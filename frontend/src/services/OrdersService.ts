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


export const insertOrder = async (order: Order) => {

    const currentUtcDate = new Date();
    const bdTimeOffset = 6; // Bangladesh is UTC+6
    const bdDate = new Date(currentUtcDate.getTime() + bdTimeOffset * 3600000); // Convert to Bangladesh time

    // Now convert the adjusted date to the local string using the existing helper
    const bdTimeString = convertUtcToBDTime(bdDate.toISOString());

    const { data, error } = await supabase_client.from('orders').insert([
        {
            "created_at": bdTimeString,
            "order_note": order.order_note,
            "created_by_user_id": order.created_by_user_id,
            "department_id": order.department_id,
            "current_status_id": order.current_status_id,
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