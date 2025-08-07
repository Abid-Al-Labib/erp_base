import {
  createLoanTransfer,
  fetchLoanTransferById,
  completeLoanTransfer,
} from "@/services/LoanTransferService";
import {
  increaseMachinePartQty,
  reduceMachinePartQty,
} from "@/services/MachinePartsService";
import {
  reduceStoragePartQty,
  increaseStoragePartQty,
} from "@/services/StorageService";
import { LoanTransfer, Order } from "@/types";
import toast from "react-hot-toast";

/**
 * Starts a loan transfer by creating a new loan transfer record and updating part quantities.
 * - Reduces from borrowed storage or machine
 * - Increases at the borrower machine
 */
export const startLoanTransfer = async (
  order: Order & { qty: number; part_id: number },
  borrowed_factory_id: number,
  borrowed_machine_id: number | null
): Promise<LoanTransfer | null> => {
  const newLoanTransfer: Partial<LoanTransfer> = {
    is_completed: false,
    completed_at: null,
    borrowed_factory_id,
    borrowed_machine_id,
    factory_id: order.factory_id,
    machine_id: order.machine_id,
    qty: order.qty,
    part_id: order.part_id,
  };

  const loanTransfer = await createLoanTransfer(newLoanTransfer);

  if (!loanTransfer) {
    toast.error("Loan transfer creation failed. Aborting quantity updates.");
    return null;
  }

  try {
    if (borrowed_machine_id !== null) {
      // Loaned from machine
      await reduceMachinePartQty(borrowed_machine_id, order.part_id, order.qty);
    } else {
      // Loaned from storage
      await reduceStoragePartQty(order.part_id, borrowed_factory_id, order.qty);
    }

    // Increase in destination machine
    await increaseMachinePartQty(order.machine_id, order.part_id, order.qty);
  } catch (err) {
    toast.error("Loan transfer created, but quantity updates failed.");
    // Optional: rollback logic could be added here
  }

  return loanTransfer;
};

/**
 * Completes a loan transfer by marking it complete and reversing the part movements.
 * - Increases at borrwed machine or storage
 * - Reduces from borrower machine
 */
export const complete_loan_transfer = async (
  loan_transfer_id: number
): Promise<boolean> => {
  const loanTransfer = await fetchLoanTransferById(loan_transfer_id);

  if (!loanTransfer) {
    toast.error("Loan transfer not found.");
    return false;
  }

  const {
    borrowed_factory_id,
    borrowed_machine_id,
    factory_id,
    machine_id,
    qty,
    part_id,
  } = loanTransfer;

  // Validate required fields
  if (
    !part_id ||
    !qty ||
    qty <= 0 ||
    machine_id === null ||
    factory_id === null ||
    borrowed_factory_id === null
  ) {
    toast.error("Loan transfer data is incomplete.");
    return false;
  }

  // Mark the transfer as completed
  const updatedTransfer = await completeLoanTransfer(loan_transfer_id);

  if (!updatedTransfer) {
    toast.error("Failed to complete loan transfer.");
    return false;
  }

  try {
    if (borrowed_machine_id !== null) {
      // Return to borrowed machine
      await increaseMachinePartQty(borrowed_machine_id, part_id, qty);
    } else {
      // Return to borrowed storage
      await increaseStoragePartQty(part_id, borrowed_factory_id, qty);
    }

    // Remove from destination machine
    await reduceMachinePartQty(machine_id, part_id, qty);

    toast.success("Loan transfer completed and parts returned.");
    return true;
  } catch (error) {
    toast.error("Error while reversing part quantities.");
    return false;
  }
};
