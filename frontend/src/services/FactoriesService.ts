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


export const addFactory = async (name: string, abbreviation: string) => {
    const { data, error } = await supabase_client
        .from('factories')
        .insert([{ name, abbreviation }]);

    if (error) {
        console.error('Error adding factory:', error.message);
        throw new Error(error.message);
    }

    return data;
};

export const addFactorySection = async (name: string, factoryId: number) => {
    try {
        const { data, error } = await supabase_client
            .from('factory_sections')
            .insert([{ name, factory_id: factoryId }]);

        if (error) {
            console.error('Error adding factory section:', error.message);
            throw new Error(error.message);
        }

        toast.success('Factory section added successfully.');
        return data;
    } catch (error) {
        console.error(error);
        toast.error('An error occurred while adding the factory section.');
        return null;
    }
};

export const deleteFactorySection = async (factorySectionId: number) => {
    try {
        // Check if there are machines in the factory section
        const { data: machines, error: machinesError } = await supabase_client
            .from('machines')
            .select('id')
            .eq('factory_section_id', factorySectionId);

        if (machinesError) {
            console.error('Error checking machines in the section:', machinesError.message);
            throw new Error('Failed to verify associated machines.');
        }

        if (machines && machines.length > 0) {
            toast.error('Cannot delete this factory section because it contains machines.');
            return false; // Operation not allowed
        }

        // Proceed to delete the factory section
        const { error: deleteError } = await supabase_client
            .from('factory_sections')
            .delete()
            .eq('id', factorySectionId);

        if (deleteError) {
            console.error('Error deleting factory section:', deleteError.message);
            throw new Error('Failed to delete factory section.');
        }

        toast.success('Factory section deleted successfully.');
        return true; // Successfully deleted
    } catch (error) {
        console.error(error);
        toast("Proplem in deleting")
        return false;
    }
};