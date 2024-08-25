import { Tables } from "./supabase";

export type Part = Tables<"parts">  

export type Department = Tables<"departments">
export type Status = Tables<"statuses">
export type Profile = Tables<"profiles">
export type Factory = Tables<"factories">

export type OrderedPart = {
    id: number,
    is_sample_received_by_office: string,
    is_sample_sent_to_office: string,
    part_sent_by_office_date: string | null,
    part_received_by_factory_date: string | null,
    part_purchased_date: string|null,
    qty: number,
    vendor: string | null, 
    unit_cost: number | null,
    note: string | null,
    order_id: number,
    part_id: number,
    factory_id: number,
    machine_id: number,
    factory_section_id: number,
    orders : Order,
    parts: Part

}

export type LinkedOrders = {
    id: number,
    order_id: number,
    orders : Order,
}


export type Order = {
    id: number;
    created_at: string;
    order_note: string;
    created_by_user_id: number;
    department_id: number;
    current_status_id: number;
    departments: Department;
    profiles: Profile;
    statuses: Status;
};

export type StatusTracker = {
    id: number;
    action_at: string;
    order_id: number;
    profiles: Profile;
    statuses: Status
}