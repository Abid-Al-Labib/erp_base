import { LinkedOrders, OrderedPart } from "@/types";
import { supabase_client } from "./SupabaseClient";
import toast from "react-hot-toast";



export const fetchLinkedOrdersByPartID = async (part_id: number)=> {
    const {data,error} = await supabase_client.from('order_parts').
    select(
        `
            id,
            order_id
            ,
            orders(
                *
            )
        `
    ).eq('part_id',part_id)
    if (error){
        toast.error(error.message)
    }
    console.log(data)
    return data as unknown as LinkedOrders[];
}

export const fetchOrderedPartByPartID = async( part_id:number) => {
    const {data,error} =  await supabase_client.from('order_parts').select(
        `
        id,
        is_sample_received_by_office,
        is_sample_sent_to_office,
        part_sent_by_office_date,
        part_received_by_factory_date,
        part_purchased_date,
        qty,
        vendor, 
        unit_cost,
        note,
        order_id,
        part_id,
        factory_id,
        machine_id,
        factory_section_id,
        orders(*),
        parts(*)
        `
    ).eq('part_id',part_id)
    console.log(data)
    if(error) {
        toast.error(error.message)
    }
    return data as unknown as OrderedPart[]

}

export const fetchOrderedPartsByOrderID = async (order_id: number)=> {
}
