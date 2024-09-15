import toast from "react-hot-toast";
import { supabase_client } from "./SupabaseClient";
import { MachinePart } from "@/types";

export const fetchMachineParts = async () => {
    const {data,error} = await supabase_client.from('machine_parts').select('*')
    if (error){
        toast.error(error.message)
    }
    return data as MachinePart[];
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

export const updateMachinePartQty = async (machine_id: number, part_id: number, new_quantity: number) => {
    const { error } = await supabase_client
    .from('storage_parts')
    .update({ qty: new_quantity })
    .eq('part_id', part_id).eq('machine_id', machine_id)

    if (error){
        toast.error(error.message)
    }
}