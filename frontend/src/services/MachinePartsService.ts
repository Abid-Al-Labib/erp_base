import toast from "react-hot-toast";
import { supabase_client } from "./SupabaseClient";
import { MachinePart } from "@/types";


export const fetchMachineParts = async (
    machineId?: number,
    partId?: number,
    partName?: string
) => {
    let query = supabase_client
        .from('machine_parts')
        .select(`
      id,
      qty,
      req_qty,
      defective_qty,
      machine_id,
      parts (*),
      machines(*)
    `);

    // Add machine ID filter if provided
    // console.log(partId);

    if (machineId !== undefined) {
        query = query.eq('machine_id', machineId);
    }

    // Add part ID filter if provided
    // console.log(partId);
    if (partId !== undefined) {
        query = query.eq('part_id', partId);
    }

    // Execute the query
    const { data, error } = await query.order('id',{ascending: true});

    // Handle any errors
    if (error) {
        toast.error('Error fetching machine parts: ' + error.message);
        return [];
    }

    // Additional filtering based on part name
    let filteredData = data;

    if (partName) {
        filteredData = filteredData.filter((record: any) =>
            record.parts && record.parts.name.toLowerCase().includes(partName.toLowerCase())
        );
    }

    return filteredData as unknown as MachinePart[];
};

export const upsertMachineParts = async ( part_id: number, machine_id: number, quantity: number) => {
    
    const { error } = await supabase_client
    .from('machine_parts')
    .upsert({ 
        machine_id:  machine_id,
        part_id: part_id,
        qty: quantity
    },{onConflict: 'part_id, machine_id'}
    )

    if (error) {
        toast.error(error.message)
    }
        
}

export const updateMachinePartQuantities = async (
    id: number, // Primary key ID
    quantity: number,
    req_qty: number
  ) => {
    const { error } = await supabase_client
      .from("machine_parts")
      .update({ qty: quantity, req_qty: req_qty })
      .eq("id", id);
  
    if (error) {
      toast.error("Error updating machine part quantities: " + error.message);
    } else {
      toast.success("Machine part quantities updated successfully.");
    }
  };


export const increaseMachinePartQty = async (
    machine_id: number,
    part_id: number,
    quantity: number
): Promise<void> => {
    // Fetch the current quantity for the given machine_id and part_id
    const { data: currentData, error: fetchError } = await supabase_client
        .from("machine_parts")
        .select("qty")
        .eq("part_id", part_id)
        .eq("machine_id", machine_id);

    // Handle error if the fetch fails
    if (fetchError) {
        toast.error(fetchError.message);
        return;
    }

    const currentQty = currentData && currentData.length > 0 ? currentData[0].qty : 0;
    const updatedQuantity = currentQty + quantity;

    // Upsert the new quantity value into the database
    const { error: upsertError } = await supabase_client
        .from("machine_parts")
        .upsert(
            {
                part_id: part_id,
                machine_id: machine_id,
                qty: updatedQuantity,
            },
            { onConflict: "part_id, machine_id" }
        );

    // Handle upsert error if it occurs
    if (upsertError) {
        toast.error(upsertError.message);
    }
};

export const reduceMachinePartQty = async (
    machine_id: number,
    part_id: number,
    quantity: number
): Promise<number> => {
    // Fetch the current quantity for the given machine_id and part_id
    const { data: currentData, error: fetchError } = await supabase_client
        .from("machine_parts")
        .select("qty")
        .eq("part_id", part_id)
        .eq("machine_id", machine_id);

    // Handle error if the fetch fails
    if (fetchError) {
        toast.error(fetchError.message);
        return 0;
    }

    if (!currentData || currentData.length === 0) {
        toast.error('Part not found in machine');
        return 0;
    }

    const currentQty = currentData[0].qty;
    
    // If trying to reduce more than available, reduce only what's available
    const actualReductionAmount = Math.min(quantity, currentQty);
    const newQuantity = currentQty - actualReductionAmount;

    if (newQuantity === 0) {
        // Remove the part from machine if quantity becomes 0
        const { error: deleteError } = await supabase_client
            .from("machine_parts")
            .delete()
            .eq("part_id", part_id)
            .eq("machine_id", machine_id);

        if (deleteError) {
            toast.error(deleteError.message);
        }
    } else {
        // Update the quantity
        const { error: updateError } = await supabase_client
            .from("machine_parts")
            .update({ qty: newQuantity })
            .eq("part_id", part_id)
            .eq("machine_id", machine_id);

        if (updateError) {
            toast.error(updateError.message);
        }
    }

    return actualReductionAmount;
};

export const updateRequiredQuantity = async (partId: number, newCurQty: number, newReqQty: number) => {
    const { error } = await supabase_client
        .from('machine_parts')
        .update({ qty: newCurQty, req_qty: newReqQty })
        .eq('id', partId);

    if (error) {
        toast.error('Error updating required quantity: ' + error.message);
        throw error; // Throw error to handle it in the component
    }

    toast.success('Required quantity updated successfully.');
};

export const updateDefectiveQuantity = async (partId: number, newDefQty: number) => {
    const { error } = await supabase_client
        .from('machine_parts')
        .update({ defective_qty: newDefQty })
        .eq('id', partId);

    if (error) {
        toast.error('Error updating defective quantity: ' + error.message);
        throw error; // Throw error to handle it in the component
    }

    toast.success('Defective quantity updated successfully.');  
}

export const addDefectiveQuantity = async (machineId: number, partId: number, newDefQty: number) => {
    // First fetch the current defective quantity
    const { data: currentData, error: fetchError } = await supabase_client
        .from('machine_parts')
        .select('defective_qty')
        .eq('machine_id', machineId)
        .eq('part_id', partId)
        .maybeSingle();

    if (fetchError) {
        toast.error('Error fetching current defective quantity: ' + fetchError.message);
        throw fetchError;
    }

    // Calculate new defective quantity
    const currentDefQty = currentData?.defective_qty || 0;
    const updatedDefQty = currentDefQty + newDefQty;

    // Update the defective quantity
    const { error: updateError } = await supabase_client
        .from('machine_parts')
        .update({ defective_qty: updatedDefQty })
        .eq('machine_id', machineId)
        .eq('part_id', partId);

    if (updateError) {
        toast.error('Error updating defective quantity: ' + updateError.message);
        throw updateError;
    }
    toast.success('Defective quantity updated successfully.');  
}

export const reduceDefectiveQuantity = async (machineId: number, partId: number, newDefQty: number) => {
    const { data: currentData, error: fetchError } = await supabase_client
        .from('machine_parts')
        .select('defective_qty')
        .eq('machine_id', machineId)
        .eq('part_id', partId)
        .maybeSingle(); 

    if (fetchError) {
        toast.error('Error fetching current defective quantity: ' + fetchError.message);
        throw fetchError;
    }

    const currentDefQty = currentData?.defective_qty || 0;
    const updatedDefQty = currentDefQty - newDefQty;

    // Update the defective quantity
    const { error: updateError } = await supabase_client
        .from('machine_parts')
        .update({ defective_qty: updatedDefQty })
        .eq('machine_id', machineId)
        .eq('part_id', partId);

    if (updateError) {
        toast.error('Error updating defective quantity: ' + updateError.message);
        throw updateError;
    }

    toast.success('Defective quantity updated successfully.');  
}

export const deleteMachinePart = async (machinePartId: number) => {
    const { error } = await supabase_client
        .from('machine_parts')
        .delete()
        .eq('id', machinePartId);

    if (error) {
        toast.error("Failed to delete machine part: " + error.message);
        return false;
    }

    toast.success("Machine part deleted successfully!");
    return true;
};
