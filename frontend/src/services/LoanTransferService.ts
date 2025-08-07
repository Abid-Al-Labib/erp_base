import { supabase_client } from "./SupabaseClient";
import { LoanTransfer } from "@/types";
import toast from "react-hot-toast";

export const createLoanTransfer = async (loanTransfer: Partial<LoanTransfer>) => {
  const { data, error } = await supabase_client
    .from("loan_transfers")
    .insert(loanTransfer)
    .select()
    .single();

  if (error) {
    toast.error(`Create failed: ${error.message}`);
    return null;
  }

  toast.success("Loan transfer created");
  return data as LoanTransfer;
};


export const fetchAllLoanTransfers = async () => {
  const { data, error } = await supabase_client
    .from("loan_transfers")
    .select("*");

  if (error) {
    toast.error(`Fetch failed: ${error.message}`);
    return [];
  }

  return data as LoanTransfer[];
};


export const fetchLoanTransferById = async (id: number) => {
  const { data, error } = await supabase_client
    .from("loan_transfers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    toast.error(`Fetch failed: ${error.message}`);
    return null;
  }

  return data as LoanTransfer;
};


export const updateLoanTransfer = async (
  id: number,
  loanTransfer: Partial<LoanTransfer>
) => {
  const { data, error } = await supabase_client
    .from("loan_transfers")
    .update(loanTransfer)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    toast.error(`Update failed: ${error.message}`);
    return null;
  }

  toast.success("Loan transfer updated");
  return data as LoanTransfer;
};


export const deleteLoanTransfer = async (id: number) => {
  const { error } = await supabase_client
    .from("loan_transfers")
    .delete()
    .eq("id", id);

  if (error) {
    toast.error(`Delete failed: ${error.message}`);
    return false;
  }

  toast.success("Loan transfer deleted");
  return true;
};


export const completeLoanTransfer = async (id: number) => {
  const { data, error } = await supabase_client
    .from("loan_transfers")
    .update({
      is_completed: true,
      completed_at: new Date().toISOString()
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    toast.error(`Completion failed: ${error.message}`);
    return null;
  }

  toast.success("Loan transfer completed");
  return data as LoanTransfer;
};
