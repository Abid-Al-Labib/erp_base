import { Order } from "@/types";
import { supabase_client } from "./SupabaseClient";
import toast from "react-hot-toast";
import { convertUtcToBDTime } from "./helper"; // Import the helper function


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
        return null; // Return null or appropriate error handling
    }

    toast.success("Order successfully created");
    return data as unknown as Order[]; // Return the newly created order
};