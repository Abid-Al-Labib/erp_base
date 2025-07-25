import toast from "react-hot-toast";
import { supabase_client } from "./SupabaseClient";
import { StoragePart } from "@/types";

export const fetchStorageParts = async ({
  factoryId,
  partName,
  partId,
  page = 1,
  limit = 10
}: {
  factoryId: number;
  partName?: string;
  partId?: number;
  page?: number;
  limit?: number;
}) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase_client
        .from('storage_parts')
        .select(`
            id,
            qty,
            factory_id,
            part_id,
            parts (*)
        `, { count: 'exact' })
        .order("id", {ascending: true})
        .range(from, to);
    
    if (factoryId !== undefined) {
        query = query.eq('factory_id', factoryId);
    }

    if (partId !== undefined) {
        query = query.eq('part_id', partId);
    }

    if (partName) {
        query = query.ilike('parts.name', `%${partName}%`);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching parts:', error.message);
        return { data: [], count: 0 };
    }

    return { 
      data: data as unknown as StoragePart[],
      count
    };
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

// export const updateStoragePartQty = async (part_id: number, factory_id: number, new_quantity: number) => {
    
//     const { error } = await supabase_client
//     .from('storage_parts')
//     .update({ qty: new_quantity })
//     .eq('part_id', part_id).eq('factory_id', factory_id)

//     if (error){
//         toast.error(error.message)
//     }
        
// }

export const updateStoragePartQty = async (part_id: number, factory_id: number, quantity: number) => {
    const { data: currentData, error: fetchError } = await supabase_client
        .from('storage_parts')
        .select('qty')
        .eq('part_id', part_id).eq('factory_id', factory_id)


    toast.success("Updating part " + part_id + " in factory " + factory_id + " with quantity " + quantity)
    if (fetchError) {
        toast.error(fetchError.message)
        return
    }

    let updatedQuantity = 0
    
    if (currentData && currentData.length > 0){
        updatedQuantity = currentData[0].qty + quantity;
    }
    else {
        updatedQuantity = quantity; // For new parts, just use the quantity being added
    }
    
    const { error: upsertError } = await supabase_client
        .from('storage_parts')
        .upsert({
            part_id: part_id,
            factory_id: factory_id,
            qty: updatedQuantity
        }, { onConflict: 'part_id, factory_id' }
        )

    if (upsertError) {
        toast.error(upsertError.message)
    }   
}

export const reduceStoragePartQty = async (part_id: number, factory_id: number, quantity: number) => {
    const { data: currentData, error: fetchError } = await supabase_client
        .from('storage_parts')
        .select('qty')
        .eq('part_id', part_id).eq('factory_id', factory_id)

    if (fetchError) {
        toast.error(fetchError.message)
        return
    }

    if (!currentData || currentData.length === 0) {
        toast.error('Part not found in storage')
        return
    }

    const currentQuantity = currentData[0].qty
    const newQuantity = currentQuantity - quantity

    if (newQuantity < 0) {
        toast.error('Insufficient quantity in storage')
        return
    }

    if (newQuantity === 0) {
        // Remove the part from storage if quantity becomes 0
        const { error: deleteError } = await supabase_client
            .from('storage_parts')
            .delete()
            .eq('part_id', part_id)
            .eq('factory_id', factory_id)

        if (deleteError) {
            toast.error(deleteError.message)
        }
    } else {
        // Update the quantity
        const { error: updateError } = await supabase_client
            .from('storage_parts')
            .update({ qty: newQuantity })
            .eq('part_id', part_id)
            .eq('factory_id', factory_id)

        if (updateError) {
            toast.error(updateError.message)
        }
    }
}

export const editStoragePartQty = async (part_id: number, factory_id: number, new_quantity: number) => {
    
    const { error } = await supabase_client
    .from('storage_parts')
    .update({ qty: new_quantity })
    .eq('part_id', part_id).eq('factory_id', factory_id)

    if (error){
        toast.error(error.message)
    }
        
}

export const deleteStoragePart = async (part_id: number, factory_id: number) => {
    const { error } = await supabase_client
    .from('storage_parts')
    .delete()
    .eq('part_id', part_id)
    .eq('factory_id', factory_id)

    if (error) {
        toast.error(error.message)
        throw error;
    }

    toast.success("Storage part deleted successfully");
}
