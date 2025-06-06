import { StoragePart } from "@/types";
import { supabase_client } from "./SupabaseClient";
import toast from "react-hot-toast";

export const fetchDamagedPartsByFactoryID = async ({
  factoryId,
  partName,
  partId,
  page = 1,
  limit = 10
}: {
  factoryId: number;
  partName: string | null;
  partId: number | null;
  page?: number;
  limit?: number;
}) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase_client
        .from('damaged_parts')
        .select(`
            id,
            qty,
            factory_id,
            part_id,
            parts (*)
        `, { count: 'exact' })
        .eq('factory_id', factoryId)
        .order("id", {ascending: true})
        .range(from, to);
    
    if (partId) {
        query = query.eq('part_id', partId);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching parts:', error.message);
        return { data: [], count: 0 };
    }

    let filteredData = data;

    if (partName) {
        filteredData = filteredData.filter((record: any) =>
            record.parts && record.parts.name.toLowerCase().includes(partName.toLowerCase())
        );
    }
    
    return { 
      data: filteredData as unknown as StoragePart[],
      count
    };
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

export const addDamagePartQuantity = async (factory_id: number, part_id: number, added_quantity: number) => {
    // Fetch the current quantity for the given factory_id and part_id
    const { data: currentData, error: fetchError } = await supabase_client
        .from("damaged_parts")
        .select("qty")
        .eq("part_id", part_id)
        .eq("factory_id", factory_id);

    // Handle error if the fetch fails
    if (fetchError) {
        toast.error(fetchError.message);
        return;
    }

    // Calculate the updated quantity by adding the new quantity to the current quantity
    const currentQty = currentData && currentData.length > 0 ? currentData[0].qty : 0;
    const updatedQuantity = currentQty + added_quantity;

    // Update the damaged part quantity in the database
    const { error: updateError } = await supabase_client
        .from("damaged_parts")
        .upsert(
            {
                part_id: part_id,
                factory_id: factory_id,
                qty: updatedQuantity,
            },
            { onConflict: "part_id, factory_id" } // Ensure conflict is managed correctly
        );

    // Handle update error if it occurs
    if (updateError) {
        toast.error(updateError.message);
    } 
};

export const deleteDamagedPart = async (part_id: number, factory_id: number) => {
    const { error } = await supabase_client
    .from('damaged_parts')
    .delete()
    .eq('part_id', part_id)
    .eq('factory_id', factory_id)

    if (error) {
        toast.error(error.message)
        throw error;
    }

    toast.success("Damaged part deleted successfully");
}

export const upsertDamagedPart = async (part_id: number, factory_id: number, quantity: number) => {
    const { error } = await supabase_client
    .from('damaged_parts')
    .upsert({ 
        part_id: part_id,
        factory_id: factory_id,
        qty: quantity 
    }, {onConflict: 'part_id, factory_id'}
    )

    if (error) {
        toast.error(error.message)
        throw error;
    }
}