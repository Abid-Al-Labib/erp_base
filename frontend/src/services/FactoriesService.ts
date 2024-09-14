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

export const fetchDepartments = async () => {
    const { data, error } = await supabase_client
        .from('departments')
        .select('id, name');

    if (error) {
        console.error('Error fetching departments:', error.message);
        return [];
    }
    return data;
};

export const fetchStorageParts = async (factoryId: number, storageId: number, partName: string, partId: number) => {
    let query = supabase_client
        .from('storage_parts')
        .select(`
            id,
            qty,
            factory_id,
            parts (*)
        `)
    if (factoryId !== undefined ) {
        query = query.eq('factory_id', factoryId);
    }
    if (storageId !== undefined ) {
        query = query.eq('id',storageId);
    }
    // if (partName) {
    //     query = query.ilike('parts.name', `%${partName}%`);
    // }


    if (partId !== undefined ) {
        query = query.eq('part_id', partId);
    }

    console.log("THIS IS STORAGE ID",);
    const { data, error } = await query;

    if (error) {
        console.error('Error fetching parts:', error.message);
        return [];
    }

    let filteredData = data;

    if (partName) {
        filteredData = filteredData.filter((record: any) =>
            record.parts && record.parts.name.toLowerCase().includes(partName.toLowerCase())
        );
    }

    return filteredData;
};