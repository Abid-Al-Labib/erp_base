import { Order } from "@/types";
import { supabase_client } from "./SupabaseClient";
import toast from "react-hot-toast";


export const fetchOrders = async () => {
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
    )
    if (error){
        toast.error(error.message)
    }
    console.log(data)
    return data as unknown as Order[];
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