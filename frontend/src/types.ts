import { Tables } from "./supabase";

export type Part = Tables<"parts">  

export type Department = Tables<"departments">
export type Status = Tables<"statuses">
export type Profile = Tables<"profiles">
export type Factory = Tables<"factories">

export type Machine = {
    id: number,
    number: number,
    type: string,
    is_running: boolean,
    factory_section_id: number,
    factory_sections: FactorySection
}

export type FactorySection = {
    id: number,
    name: string,
    factory_id: number,
    factories: Factory
} 

export type OrderedPart = {
    id: number,
    is_sample_received_by_office: boolean,
    is_sample_sent_to_office: boolean,
    part_sent_by_office_date: string | null,
    part_received_by_factory_date: string | null,
    part_purchased_date: string|null,
    qty: number,
    vendor: string | null,
    brand: string | null, 
    unit_cost: number | null,
    note: string | null,
    office_note: string | null,
    order_id: number,
    part_id: number,
    approved_pending_order: boolean
    approved_office_order: boolean
    approved_budget: boolean
    orders : Order,
    parts: Part,
}

export type Order = {
    id: number,
    created_at: string,
    order_note: string,
    created_by_user_id: number,
    department_id: number,
    factory_id: number,
    machine_id: number,
    factory_section_id: number,
    current_status_id: number,
    departments: Department,
    profiles: Profile,
    statuses: Status,
    machines: Machine,
    factories: Factory,
    factory_sections: FactorySection
};

export type StatusTracker = {
    id: number,
    action_at: string,
    order_id: number,
    status_id: number,
    profiles: Profile,
    statuses: Status
};
