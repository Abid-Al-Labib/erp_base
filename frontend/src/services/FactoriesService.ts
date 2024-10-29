import { Factory, FactorySection } from "@/types";
import { supabase_client } from "./SupabaseClient";
import toast from "react-hot-toast";

// Function to fetch all factories
export const fetchFactories = async () => {
    const { data, error } = await supabase_client
        .from('factories')
        .select('id, name, abbreviation');  

    if (error) {
        console.error('Error fetching factories:', error.message);
        return [];
    }
    return data as unknown as Factory[];
};

export const fetchFactoriesByIds = async (factoryIds:number[])=> {
    const { data, error } = await supabase_client
    .from('factories')
    .select('*')
    .in('id',factoryIds);  

    if(error){
        toast.error(error.message)
        return []
    }

    return data as unknown as Factory[]

}

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

export const fetchFactorySectionsByIds = async (factorySectionIds: number[]) =>{
    const { data, error } = await supabase_client
        .from('factory_sections')
        .select('*') 
        .in('id', factorySectionIds);

    if (error) {
        console.error('Error fetching factory sections:', error.message);
        return [];
    }
    return data as unknown as FactorySection[];
}

export const fetchAllFactorySections = async () => {
    const { data, error } = await supabase_client
        .from('factory_sections')
        .select('id, name, factory_id');

    if (error) {
        console.error('Error fetching all factory sections:', error.message);
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

