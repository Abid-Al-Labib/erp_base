import { supabase_client } from "./SupabaseClient";
import { toast } from "react-hot-toast";
import { OrderWorkflow } from "@/types";

export async function getOrderWorkflowByID(workflow_id: number): Promise<OrderWorkflow | null> {
  const { data, error } = await supabase_client
    .from("order_workflows")
    .select("*")
    .eq("id", workflow_id)
    .single();

  if (error) {
    toast.error(error.message);
    return null;
  }

  return data;
}

export async function getOrderWorkflowByType(order_type: string): Promise<OrderWorkflow | null> {
  const { data, error } = await supabase_client
    .from("order_workflows")
    .select("*")
    .eq("order_type", order_type)
    .single();

  if (error) {
    toast.error(error.message);
    return null;
  }

  return data;
}


export async function getAllOrderWorkflows(): Promise<OrderWorkflow[] | null> {
  const { data, error } = await supabase_client
    .from("order_workflows")
    .select("*");

  if (error) {
    toast.error("Failed to fetch order workflows: " + error.message);
    return null;
  }

  return data;
}


export async function getAllOrderWorkflowsByNameMap(): Promise<Record<string, OrderWorkflow> | null> {
  const { data, error } = await supabase_client
    .from("order_workflows")
    .select("*");

  if (error) {
    toast.error("Failed to fetch order workflows: " + error.message);
    return null;
  }

  const map: Record<string, OrderWorkflow> = {};
  data.forEach((workflow) => {
    map[workflow.name] = workflow;
  });

  return map;
}


export async function getAllOrderWorkflowsByIdMap(): Promise<Record<number, OrderWorkflow> | null> {
  const { data, error } = await supabase_client
    .from("order_workflows")
    .select("*");

  if (error) {
    toast.error("Failed to fetch order workflows: " + error.message);
    return null;
  }

  const map: Record<number, OrderWorkflow> = {};
  data.forEach((workflow) => {
    map[workflow.id] = workflow;
  });

  return map;
}

// Returns the last status id from status_sequence array for a given order_type (e.g., PFM, PFS, STM)
export async function getOrderLastStatusByType(order_type: string): Promise<number | null> {
  const { data, error } = await supabase_client
    .from("order_workflows")
    .select("status_sequence")
    .eq("name", order_type)
    .limit(1);

  if (error) {
    console.warn("Failed to fetch workflow:", error.message);
    return null;
  }

  const row = Array.isArray(data) ? (data[0] as { status_sequence?: number[] } | undefined) : undefined;
  const sequence = row?.status_sequence;
  if (!sequence || sequence.length === 0) {
    return null;
  }

  return sequence[sequence.length - 1];
}

// Returns a dictionary mapping workflow name (order type) -> last status id.
export async function getOrderTypeLastStatusMap() {
  let query = supabase_client
    .from("order_workflows")
    .select("type, status_sequence");

  const { data, error } = await query;
  if (error) {
    console.warn("Failed to fetch workflows:", error.message);
    return {};
  }

  const map: Record<string, number | null> = {};
  data.forEach((row) => {
    map[row.type] = Array.isArray(row.status_sequence) && row.status_sequence.length > 0 ? row.status_sequence[row.status_sequence.length - 1] : null;
  });

  console.log(map)
  return map;
}