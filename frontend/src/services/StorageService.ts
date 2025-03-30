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

export const updateStoragePartQty = async (part_id: number, factory_id: number, quantity: number, type: 'add'|'subtract') => {

    const { data: currentData, error } = await supabase_client
        .from('storage_parts')
        .select('qty')
        .eq('part_id', part_id).eq('factory_id', factory_id)

    let updatedQuantity = 0
    
    if (type === 'add') {
        if (currentData){
            updatedQuantity = currentData[0].qty+quantity;
        }
        else updatedQuantity = updatedQuantity + quantity
    }
    else 
    {
        if(currentData){
            if (currentData[0].qty>=quantity){
                updatedQuantity = currentData[0].qty - quantity;
            }
        } 
    }
    

    
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

export const editStoragePartQty = async (part_id: number, factory_id: number, new_quantity: number) => {
    
    const { error } = await supabase_client
    .from('storage_parts')
    .update({ qty: new_quantity })
    .eq('part_id', part_id).eq('factory_id', factory_id)

    if (error){
        toast.error(error.message)
    }
        
}
