import { supabase_client } from "./SupabaseClient";
import toast from "react-hot-toast";
import { ProjectComponent } from "@/types";

// Fetch all components for a given project
export const fetchProjectComponentsByProjectId = async (projectId: number) => {
  const { data, error } = await supabase_client
    .from("project_components")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching project components:", error.message);
    toast.error("Failed to fetch components");
    return [];
  }

  return data as ProjectComponent[];
};

// Fetch a single component by ID
export const fetchProjectComponentById = async (componentId: number) => {
  const { data, error } = await supabase_client
    .from("project_components")
    .select("*")
    .eq("id", componentId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching component:", error.message);
    toast.error("Failed to fetch component");
    return null;
  }

  return data as ProjectComponent;
};

// Add a new component
export const addProjectComponent = async (
  componentData: Partial<ProjectComponent>
) => {
  const { data, error } = await supabase_client
    .from("project_components")
    .insert([componentData])
    .select()
    .single();

  if (error) {
    console.error("Error adding component:", error.message);
    toast.error("Failed to add component");
    return null;
  }

  toast.success("Component added successfully");
  return data as ProjectComponent;
};

// Update a component by ID
export const updateProjectComponent = async (
  componentId: number,
  updateData: Partial<ProjectComponent>
) => {
  const { error } = await supabase_client
    .from("project_components")
    .update(updateData)
    .eq("id", componentId);

  if (error) {
    console.error("Error updating component:", error.message);
    toast.error("Failed to update component");
    return false;
  }

  toast.success("Component updated successfully");
  return true;
};

// Count components by status (PLANNING, STARTED, COMPLETED)
export const fetchMetricProjectComponentsByStatus = async (
  status: "PLANNING" | "STARTED" | "COMPLETED"
) => {
  const { count, error } = await supabase_client
    .from("project_components")
    .select("*", { count: "exact", head: true })
    .eq("status", status);

  if (error) {
    console.error(`Error fetching component metric for ${status}:`, error.message);
    return null;
  }

  return count;
};
