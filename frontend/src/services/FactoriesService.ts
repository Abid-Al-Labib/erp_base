import { supabase_client } from "./SupabaseClient";

// Function to fetch all factories
export const fetchFactories = async () => {
    const { data, error } = await supabase_client
        .from('factories')
        .select('id, name');  

    if (error) {
        console.error('Error fetching factories:', error.message);
        return [];
    }
    return data;
};

export const fetchFactorySections = async (factoryId: number) => {
    const { data, error } = await supabase_client
        .from('factory_sections')
        .select('id, name, factory_id') 
        .eq('factory_id', factoryId);

    if (error) {
        console.error('Error fetching factory sections:', error.message);
        return [];
    }
    return data;
};

export const fetchMachines = async (factorySectionId: number) => {
    const { data, error } = await supabase_client
        .from('machines')
        .select('id, type, number')  
        .eq('factory_section_id', factorySectionId);

    if (error) {
        console.error('Error fetching machines:', error.message);
        return [];
    }
    return data;
};