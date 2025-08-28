import { Tables } from "./supabase";

export type Part = Tables<"parts">  

export type Department = Tables<"departments">
export type Status = Tables<"statuses">
export type Profile = Tables<"profiles">
export type Factory = Tables<"factories">
export type ApplicationSettings = Tables<"app_settings">
export type OrderWorkflow = Tables<"order_workflows">
export type InstantAddStoragePart = Tables<"instant_add_storage_part">
export type InstantAddDamagedPart = Tables<"instant_add_damaged_part">

export type StoragePart = {
    id: number;
    qty: number;
    factory_id: number;
    part_id: number;
    parts: Part;
    avg_price: number | null;
};

export type PartHistory = {
  lastUnitCost: number | null;
  lastPurchaseDate: string | null;
  lastVendor: string | null;
  lastChangeDate: string | null;
};


export type Machine = {
    id: number,
    name: string,
    is_running: boolean,
    factory_section_id: number,
    factory_sections?: FactorySection
}

export type MachinePart = {
    id: number;
    machine_id: number;
    part_id: number;
    qty: number;
    req_qty: number | null;
    defective_qty: number | null;
    parts: Part
    machines: Machine
}

export type FactorySection = {
    id: number,
    name: string,
    factory_id: number,
    factories?: Factory
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
    in_storage: boolean,
    approved_storage_withdrawal: boolean,
    order_id: number,
    part_id: number,
    mrr_number: string,
    approved_pending_order: boolean
    approved_office_order: boolean
    approved_budget: boolean
    orders : Order,
    parts: Part,
    qty_taken_from_storage: number
}

export type Order = {
    id: number,
    req_num: string,
    created_at: string,
    order_note: string,
    created_by_user_id: number,
    department_id: number,
    factory_id: number,
    machine_id: number,
    factory_section_id: number,
    current_status_id: number,
    order_type: string,
    departments: Department,
    profiles: Profile,
    statuses: Status,
    machines: Machine | null,
    factories: Factory, 
    factory_sections: FactorySection | null,
    order_workflows: OrderWorkflow,
    src_factory: number | null,
    src_machine: number | null,
    marked_inactive: boolean | null,
    unstable_type: string | null
};

export type StatusTracker = {
    id: number,
    action_at: string,
    order_id: number,
    status_id: number,
    profiles: Profile,
    statuses: Status
};

export type Filter = {
    searchType: string | undefined;
    searchQuery: string | undefined;
    reqNumQuery: string | undefined;
    selectedDate?: Date | undefined;
    dateFilterType: number | undefined; // 1 = On, 2 = Before, 3 = After
    selectedFactoryId: number | undefined;
    selectedFactorySectionId: number | undefined;
    selectedMachineId: number | undefined;
    selectedDepartmentId: number | undefined;
    selectedStatusId: number | undefined;
    selectedOrderType: string | undefined;
    showCompletedOrders: boolean | undefined;
    
};

export type ManagementType = "factory" | "factorySections" | "machines" | "machineParts" | "departments" | "appSettings" | "addUser" | "manageUser";

export interface InputOrder {
    req_num: string,
    order_note: string,
    created_by_user_id: number,
    department_id: number,
    factory_id: number,
    factory_section_id: number,
    machine_id: number,
    machine_name: string,
    current_status_id: number,
    order_type: string,
    marked_inactive?: boolean, // For machine orders (PFM, STM, MTS)
    unstable_type?: string | null, // How to keep machine running when not marked inactive
    src_factory?: number | null, // Source factory for transfers and borrowing from storage
    src_machine?: number | null, // Source machine for transfers and borrowing from machine
}

export interface InputOrderedPart {
    qty: number;
    unit: string | null;
    order_id: number;
    part_id: number;
    part_name: string;
    factory_id: number;
    machine_id: number;
    factory_section_id: number;
    factory_section_name: string;
    machine_name: string;
    is_sample_sent_to_office: boolean,
    note?: string | null;
    in_storage: boolean;
    approved_storage_withdrawal: boolean;
}

export interface StatusTrackerItemProp {
  status: string;
  action_at: string | null;
  action_by: string | null;
  complete: boolean;
}

