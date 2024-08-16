import { Tables } from "./supabase";

export type Part = Tables<"parts">  

export type Department = Tables<"departments">
export type Status = Tables<"statuses">
export type Profile = Tables<"profiles">


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