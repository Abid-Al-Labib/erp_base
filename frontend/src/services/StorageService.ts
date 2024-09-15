import toast from "react-hot-toast";
import { supabase_client } from "./SupabaseClient";
import { StoragePart } from "@/types";


export const fetchStoragePartQuantityByFactoryID = async (part_id: number, factory_id: number) => {
    let { data, error } = await supabase_client
    .from('storage_parts')
    .select('*')
    .eq('part_id',part_id)
    .eq('factory_id',factory_id)

    if (error){
        toast.error(error.message)
    }

    return data as unknown as StoragePart[]

} 

export const upsertStoragePart = async (part_id: number, factory_id: number, quantity: number) =>{
    
    const { error } = await supabase_client
    .from('storage_parts')
    .upsert({ 
        part_id: part_id,
        factory_id:factory_id,
        qty:quantity 
    }, {onConflict: 'part_id, factory_id'}
    )

    if (error){
        toast.error(error.message)
    }

}

export const updateStoragePartQty = async (part_id: number, factory_id: number, new_quantity: number) => {
    
    const { error } = await supabase_client
    .from('storage_parts')
    .update({ qty: new_quantity })
    .eq('part_id', part_id).eq('factory_id', factory_id)

    if (error){
        toast.error(error.message)
    }
        
}