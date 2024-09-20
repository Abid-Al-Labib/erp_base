import { Profile } from "@/types";
import { supabase_client } from "./SupabaseClient";


export async function getUserProfile(user_id: string) {
    const { data, error } = await supabase_client
      .from('profiles')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (error) {
      throw new Error(error.message);
    }
    
    return data as unknown as Profile;
  }
  