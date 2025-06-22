import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase_client } from "@/services/SupabaseClient";
import { getUserProfile } from "../services/ProfilesService";
import { ApplicationSettings, Profile } from "@/types";
import { fetchAppSettings } from "@/services/AppSettingsService";
import FullScreenLoader from "@/pages/FullScreenLoader";

interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  role: string | null;
  appSettings: ApplicationSettings[] | null;
  loading: boolean;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  setAppSettings: React.Dispatch<React.SetStateAction<ApplicationSettings[] | null>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [appSettings, setAppSettings] = useState<ApplicationSettings[] | null>(null); 
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase_client.auth.getSession();
      if (session) {
        setSession(session);
        await Promise.all([
          loadProfile(session.user.id),
          loadAppSettings()
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
      } else if (event === 'SIGNED_IN' && session) {
        setSession(session);
        
        (async () => {
          setLoading(true);
          await Promise.all([
            loadProfile(session.user.id),
            loadAppSettings()
          ]);
          setLoading(false);
        })();
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const loadProfile = async (user_id: string) => {
    const curr_profile = await getUserProfile(user_id);
    if (curr_profile) {
      setProfile(curr_profile);
    } else {
      console.warn("Could not load profile");
    }
  };

  const loadAppSettings = async () => {
    const curr_settings = await fetchAppSettings();
    if (curr_settings) {
      setAppSettings(curr_settings);
    } else {
      console.warn("Could not load app settings");
    }
  };

  const role = profile?.permission ?? null;

  return (
    <AuthContext.Provider value={{ session, profile, role, appSettings, loading, setSession, setProfile, setAppSettings }}>
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
