import { Order } from "@/types";
import { supabase_client } from "./SupabaseClient";
import toast from "react-hot-toast";


export const fetchOrders = async ({
    page = 1,
    limit = 10,
    query = '',
    searchDate,
    statusId,
    departmentId,
}: {
    page: number;
    limit: number;
    query?: string;
    searchDate?: Date;
    statusId?: number;
    departmentId?: number;
}) => {

    console.log(`Fetching orders with parameters: 
        Page: ${page}, 
        Limit: ${limit}, 
        Query: ${query}, 
        Search Date: ${searchDate}, 
        Status ID: ${statusId}, 
        Department ID: ${departmentId}`
    );

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let queryBuilder = supabase_client
        .from('orders')
        .select(
            `
            id,
            created_at,
            order_note,
            created_by_user_id,
            department_id,
            current_status_id,
            factory_id,
            machine_id,
            factory_section_id,
            departments(*),
            profiles(*),
            statuses(*),
            factory_sections(*),
            factories(*),
            machines(*)
            `,
            { count: 'exact' }
        )
        .range(from, to)
        .order('id', { ascending: true });

    if (query) {
        queryBuilder = queryBuilder.eq('id', query);
    }

    if (searchDate) {
        const formattedDate = searchDate.toISOString().split('T')[0];
        queryBuilder = queryBuilder.gte('created_at', `${formattedDate}T00:00:00.000Z`)
            .lte('created_at', `${formattedDate}T23:59:59.999Z`);
    }

    if (statusId) {
        queryBuilder = queryBuilder.eq('current_status_id', statusId);
    }

    if (departmentId) {
        console.log('Fetching orders with deptID '); 
        console.log({departmentId});
        queryBuilder = queryBuilder.eq('department_id', departmentId);
    }

    const { data, error, count } = await queryBuilder;

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
            current_status_id,
            factory_id,
            machine_id,
            factory_section_id,
            departments(*),
            profiles(*),
            statuses(*),
            factory_sections(*),
            factories(*),
            machines(*)
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