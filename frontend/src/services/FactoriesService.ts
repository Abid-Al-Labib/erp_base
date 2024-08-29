import { supabase_client } from "./SupabaseClient";

// Function to fetch all factories
export const fetchFactories = async () => {
    const { data, error } = await supabase_client
        .from('factories')
        .select('id, name');  // Assuming the factories table has 'id' and 'name'

    if (error) {
        console.error('Error fetching factories:', error.message);
        return [];
    }
    return data;
};