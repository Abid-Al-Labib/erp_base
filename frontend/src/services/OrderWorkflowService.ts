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
