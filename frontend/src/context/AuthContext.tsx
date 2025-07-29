import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase_client } from "@/services/SupabaseClient";
import { getUserProfile } from "../services/ProfilesService";
import { ApplicationSettings, Profile, Status } from "@/types";
import { fetchAppSettings } from "@/services/AppSettingsService";
import FullScreenLoader from "@/pages/FullScreenLoader";
import { fetchStatuses } from "@/services/StatusesService";

interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  allStatuses: Status[] | null;
  role: string | null;
  appSettings: ApplicationSettings[] | null;
  loading: boolean;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  setAppSettings: React.Dispatch<React.SetStateAction<ApplicationSettings[] | null>>;
  setAllStatuses: React.Dispatch<React.SetStateAction<Status[] | null>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allStatuses, setAllStatuses] = useState<Status[] | null>(null);
  const [appSettings, setAppSettings] = useState<ApplicationSettings[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase_client.auth.getSession();
      if (session) {
        setSession(session);
        await Promise.all([
          loadProfile(session.user.id),
          loadAppSettings(),
          loadStatuses()
        ]);
      }
      setLoading(false);
    };

    loadSession();

    const { data } = supabase_client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setProfile(null);
        setAppSettings(null);
        setAllStatuses(null);
      } else if (event === 'SIGNED_IN' && session) {
        setSession(prevSession => {
          const isNewUser = !prevSession || prevSession.user.id !== session.user.id;

          if (isNewUser) {
            (async () => {
              setLoading(true);
              await Promise.all([
                loadProfile(session.user.id),
                loadAppSettings(),
                loadStatuses()
              ]);
              setLoading(false);
            })();
          }

          return session;
        });
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;

    const profileChannel = supabase_client
      .channel('user_profile_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${session.user.id}`
      }, (payload) => {
        if (payload.eventType === 'UPDATE' && payload.new) {
          setProfile(prev => prev ? { ...prev, ...(payload.new as Partial<Profile>) } : payload.new as Profile);
        } else if (payload.eventType === 'DELETE') {
          setProfile(null);
        }
      })
      .subscribe();

    const settingsChannel = supabase_client
      .channel('app_settings_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'app_settings'
      }, (payload) => {
        setAppSettings(prevSettings => {
          if (!prevSettings) return prevSettings;

          if (payload.eventType === 'UPDATE' && payload.new) {
            return prevSettings.map(setting =>
              setting.id === (payload.new as any).id ? { ...setting, ...(payload.new as Partial<ApplicationSettings>) } : setting
            );
          } else if (payload.eventType === 'INSERT' && payload.new) {
            return [...prevSettings, payload.new as ApplicationSettings];
          } else if (payload.eventType === 'DELETE' && payload.old) {
            return prevSettings.filter(setting => setting.id !== (payload.old as any).id);
          }
          return prevSettings;
        });
      })
      .subscribe();

    const statusesChannel = supabase_client
      .channel('statuses_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'statuses'
      }, (payload) => {
        setAllStatuses(prevStatuses => {
          if (!prevStatuses) return prevStatuses;

          if (payload.eventType === 'UPDATE' && payload.new) {
            return prevStatuses.map(status =>
              status.id === (payload.new as any).id ? { ...status, ...(payload.new as Partial<Status>) } : status
            );
          } else if (payload.eventType === 'INSERT' && payload.new) {
            return [...prevStatuses, payload.new as Status];
          } else if (payload.eventType === 'DELETE' && payload.old) {
            return prevStatuses.filter(status => status.id !== (payload.old as any).id);
          }
          return prevStatuses;
        });
      })
      .subscribe();

    return () => {
      profileChannel.unsubscribe();
      settingsChannel.unsubscribe();
      statusesChannel.unsubscribe();
    };
  }, [session?.user?.id]);

  const loadProfile = async (user_id: string) => {
    const curr_profile = await getUserProfile(user_id);
    if (curr_profile) {
      setProfile(curr_profile);
    } else {
      console.warn("⚠️ Could not load profile");
    }
  };

  const loadAppSettings = async () => {
    const curr_settings = await fetchAppSettings();
    if (curr_settings) {
      setAppSettings(curr_settings);
    } else {
      console.warn("⚠️ Could not load app settings");
    }
  };

  const loadStatuses = async () => {
    const all_statuses = await fetchStatuses();
    if (all_statuses) {
      setAllStatuses(all_statuses);
    } else {
      console.warn("⚠️ Could not load all statuses");
    }
  };

  const role = profile?.permission ?? null;

  return (
    <AuthContext.Provider value={{
      session,
      profile,
      role,
      appSettings,
      allStatuses,
      loading,
      setSession,
      setProfile,
      setAppSettings,
      setAllStatuses
    }}>
      {loading ? <FullScreenLoader /> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
