import toast from "react-hot-toast";
import { supabase_client } from "./SupabaseClient";
import { StoragePart } from "@/types";


export const fetchStorageParts = async (factoryId: number, storageId: number, partName: string, partId: number) => {
    let query = supabase_client
        .from('storage_parts')
        .select(`
            id,
            qty,
            factory_id,
            parts (*)
        `)
    if (factoryId !== undefined) {
        query = query.eq('factory_id', factoryId);
    }
    if (storageId !== undefined) {
        query = query.eq('id', storageId);
    }
    // if (partName) {
    //     query = query.ilike('parts.name', `%${partName}%`);
    // }


    if (partId !== undefined) {
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
    // console.log("Adding storage of part_id ",part_id);
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

export const addStoragePartQty = async (part_id: number, factory_id: number, new_quantity: number) => {


    const { data: currentData, error } = await supabase_client
        .from('storage_parts')
        .select('qty')
        .eq('part_id', part_id).eq('factory_id', factory_id)
        .single()

    
    const updatedQuantity =(currentData?.qty||0)+new_quantity;

    

    const {  } = await supabase_client
        .from('storage_parts')
        .upsert({
            part_id: part_id,
            factory_id: factory_id,
            qty: updatedQuantity
        }, { onConflict: 'part_id, factory_id' }
        )

    if (error) {
        toast.error(error.message)
    }


}