import { DamagedPart } from "@/types";
import { supabase_client } from "./SupabaseClient";
import toast from "react-hot-toast";

export const fetchDamagedPartsByFactoryID = async (factoryId: number, partName: string | null, partId: number | null) => {
    let query = supabase_client
        .from('damaged_parts')
        .select(`
            id,
            qty,
            factory_id,
            part_id,
            parts (*)
        `)
        .eq('factory_id', factoryId)
    
    if (partId) {
        query = query.eq('part_id', partId);
    }

    const { data, error } = await query.order("id", {ascending: true});

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
    
    return filteredData as unknown as DamagedPart[]
};


export const updateDamagePartQuantity = async (factory_id:number, part_id:number, new_quantity:number) => {
    const { error } = await supabase_client
    .from('damaged_parts')
    .update({ qty: new_quantity })
    .eq('part_id', part_id).eq('factory_id', factory_id)

    if (error){
        toast.error(error.message)
    }

}