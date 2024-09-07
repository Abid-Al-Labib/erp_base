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
        parts(*),
        factory_sections(*),
        factories(*),
        machines(*)
        `
    ).eq('part_id',part_id).order('id', { ascending: true });

    console.log(data)
    if(error) {
        toast.error(error.message)
    }
    return data as unknown as OrderedPart[]

}

export const fetchOrderedPartsByOrderID = async (order_id: number)=> {
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
        approved_pending_order,
        approved_office_order,
        approved_budget,
        orders(*),
        parts(*),
        factory_sections(*),
        factories(*),
        machines(*)
        `
    ).eq('order_id',order_id).order('id', { ascending: true });
    console.log(data)
    if(error) {
        toast.error(error.message)
    }
    return data as unknown as OrderedPart[]
}


export const updateApprovedOfficeOrderByID = async (orderedpart_id: number, approved: boolean) => {
        
    const { error } = await supabase_client.from('order_parts').update(
        { approved_office_order: approved }
    ).eq('id', orderedpart_id)
    
    if (error){
        toast.error(error.message)
    }
}

export const updateApprovedBudgetByID = async (orderedpart_id: number, approved:boolean) => {
    const { error } = await supabase_client.from('order_parts').update(
        { approved_budget: approved }
    ).eq('id', orderedpart_id)
    
    if (error){
        toast.error(error.message)
    }
}

export const updateApprovedPendingOrderByID = async (orderedpart_id:number, approved:boolean) => {
    const { error } = await supabase_client.from('order_parts').update(
        { approved_pending_order: approved }
    ).eq('id', orderedpart_id)
    
    if (error){
        toast.error(error.message)
    }
}

export const deleteOrderedPartByID = async (orderedpart_id: number) => {
    
    const { error } = await supabase_client.from('order_parts').delete()
    .eq('id', orderedpart_id)

    if (error){
        toast.error(error.message)
    }
        
}

export const updateCostingByID = async (orderedpart_id: number, unit_cost: number, vendor: string) => {
    const { error } = await supabase_client.from('order_parts').update(
        { 
            vendor: vendor,
            unit_cost: unit_cost
        }
    ).eq('id', orderedpart_id)

    if (error) {
        toast.error(error.message)
    }
}

export const updateSampleReceivedByID = async (orderedpart_id: number, isReceived: boolean) => {
    const { error } = await supabase_client.from('order_parts').update(
        { is_sample_received_by_office: isReceived }
    ).eq('id', orderedpart_id)
    
    if (error){
        toast.error(error.message)
    }
}

export const updatePurchasedDateByID = async (orderedpart_id: number, purchasedDate: Date) => {
    const { error } = await supabase_client.from('order_parts').update(
        { part_purchased_date: purchasedDate }
    ).eq('id', orderedpart_id)
    
    if (error){
        toast.error(error.message)
    }
}

export const updateSentDateByID = async (orderedpart_id: number, sentDate: Date) => {
    const { error } = await supabase_client.from('order_parts').update(
        { part_sent_by_office_date: sentDate }
    ).eq('id', orderedpart_id)
    
    if (error){
        toast.error(error.message)
    }
}

export const updateReceivedByFactoryDateByID = async (orderedpart_id: number, receivedDate: Date) => {
    const { error } = await supabase_client.from('order_parts').update(
        { part_received_by_factory_date: receivedDate }
    ).eq('id', orderedpart_id)
    
    if (error){
        toast.error(error.message)
    }
}
export const insertOrderedParts = async (
    
    qty: number,
    order_id: number,
    part_id: number,
    factory_id: number,
    machine_id: number,
    factory_section_id: number,
    is_sample_sent_to_office: boolean,
    note: string | null,
) => {

    const { data, error } = await supabase_client.from('order_parts').insert([{
        qty,
        order_id,
        part_id,
        factory_id,
        machine_id,
        factory_section_id,
        is_sample_sent_to_office,

        note,
    }])
    .select();


    if (error) {
        toast.error("Failed to insert order part: " + error.message);
        return null;
    }

    // toast.success("Order part added successfully");
    return data as unknown as OrderedPart[];
};