import { Order } from "@/types";
import { supabase_client } from "./SupabaseClient";
import toast from "react-hot-toast";


export const fetchOrders = async (page: number = 1, limit: number = 10, searchQuery: string = '') => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase_client
        .from('orders')
        .select(
            `
            id,
            created_at,
            order_note,
            created_by_user_id,
            department_id,
            current_status_id,
            departments(*),
            profiles(*),
            statuses(*)
            `,
            { count: 'exact' }
        )
        .ilike('order_note', `%${searchQuery}%`)
        .range(from, to)
        .order('id', { ascending: true });

    if (error) {
        toast.error(error.message);
        return { data: [], count: 0 };
    }

    return { data: data as unknown as Order[], count };
};


export const fetchOrderByID = async (order_id:number) => {
    const {data,error} = await supabase_client.from('orders').
    select(
        `
            id,
            created_at,
            order_note,
            created_by_user_id,
            department_id,
            current_status_id
            ,
            departments(
                *
            ),
            profiles(
                *
            ),
            statuses(
                *
            )
        `
    ).eq('id',order_id)
    if (error){
        toast.error(error.message)
    }
    console.log(data)
    return data as unknown as Order[];
};

export const UpdateStatusByID = async (orderid: number, status_id:number) => {
    
    const { error } = await supabase_client.from('orders')
    .update({ current_status_id: status_id })
    .eq('id', orderid)
    
    if (error){
        toast.error(error.message)
    }
}

export const deleteStatusByID = async (orderid:number) => {
    
    const { error } = await supabase_client
    .from('orders')
    .delete()
    .eq('id', orderid)
    
    if(error) {
        toast.error(error.message)
    }
}


export const insertOrder = async (created_at: string,
    order_note: string,
    created_by_user_id: number,
    department_id: number,
    current_status_id: number) => {

    

    const { data, error } = await supabase_client.from('orders').insert([
        {
            "created_at": created_at,
            "order_note": order_note,
            "created_by_user_id": created_by_user_id,
            "department_id": department_id,
            "current_status_id": current_status_id,
        },
        ])
        .select()

    if (error) {
        toast.error("Failed to create order: " + error.message);
        return null; 
    }

    toast.success("Order successfully created");
    return data as unknown as Order[];
};