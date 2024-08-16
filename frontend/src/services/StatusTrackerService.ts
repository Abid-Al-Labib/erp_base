import toast from "react-hot-toast";
import { supabase_client } from "./SupabaseClient";
import { StatusTracker } from "@/types";

export const fetchStatusTrackerByID = async (order_id:number) => {
    const {data,error} = await supabase_client.from('status_tracker').
    select(
        `
            id,
            action_at,
            order_id,
            profiles(
                *
            ),
            statuses(
                *
            )
        `
    ).eq('order_id',order_id)
    if (error){
        toast.error(error.message)
    }
    console.log(data)
    return data as unknown as StatusTracker[];
};
