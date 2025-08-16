import { increaseDamagedPartQty } from '@/services/DamagedGoodsService';
import { reduceMachinePartQty, addDefectiveQuantity, increaseMachinePartQty } from '@/services/MachinePartsService';
import { setMachineIsRunningById } from '@/services/MachineServices';
import { increaseStoragePartQty, reduceStoragePartQty } from '@/services/StorageService';
import { fetchOrderedPartsByOrderID } from '@/services/OrderedPartsService';
import { createLoanTransfer } from '@/services/LoanTransferService';
import { Order, OrderedPart } from '@/types';

/**
 * UNIFIED ORDER APPROVAL FUNCTION
 * Handles approval processing for all order types when advancing from status 1 (Pending)
 * Fetches ordered parts and routes to appropriate approval function based on order type
 */
export const handleOrderApproval = async (order: Order): Promise<{ success: boolean; errors: string[] }> => {
    try {

        // Fetch all ordered parts for this order
        const orderedParts = await fetchOrderedPartsByOrderID(order.id);
        
        if (!orderedParts || orderedParts.length === 0) {
            console.log("No ordered parts found for order approval");
            return { success: true, errors: [] };
        }

        // Process based on order type
        switch (order.order_type) {
            case "PFM":
                return await handlePFMApproval(
                    orderedParts,
                    order.machine_id,
                    order.factory_id,
                    order.marked_inactive ?? true,
                    order.unstable_type,
                    order.src_machine,
                    order.src_factory
                );

            case "PFS":
                return await handlePFSApproval(orderedParts, order.factory_id);

            case "STM":
                return await handleSTMApproval(
                    orderedParts,
                    order.machine_id,
                    order.src_factory || order.factory_id,
                    order.marked_inactive ?? false
                );

            case "MTS":
                return await handleMTSApproval(
                    orderedParts,
                    order.src_machine || order.machine_id,
                    order.factory_id,
                    order.marked_inactive ?? false
                );

            default:
                console.log(`Unknown order type: ${order.order_type}`);
                return { success: true, errors: [`Unknown order type: ${order.order_type}`] };
        }
    } catch (error) {
        console.error("Error in unified order approval processing:", error);
        return { success: false, errors: [`Order approval error: ${error}`] };
    }
};

/**
 * Handles the PFM (Purchase for Machine) approval process for multiple parts (BATCH VERSION - NOW DEFAULT)
 * Based on marked_inactive and unstable_type, performs different actions
 */
export const handlePFMApproval = async (
    orderedParts: OrderedPart[],
    machine_id: number,
    factory_id: number,
    marked_inactive: boolean,
    unstable_type?: string | null,
    src_machine?: number | null,
    src_factory?: number | null
): Promise<{ success: boolean; errors: string[] }> => {
    const errors: string[] = [];

    
    try {
        if (marked_inactive) {
            // Standard PFM process: set machine inactive and process all parts
            await setMachineIsRunningById(machine_id, false);
            for (const part of orderedParts) {
                await reduceMachinePartQty(machine_id, part.part_id, part.qty);
                await increaseDamagedPartQty(factory_id, part.part_id, part.qty);
            }
        } else {
            // Machine continues running - handle based on unstable_type
            switch (unstable_type) {
                case 'defective':
                    // Use defective parts: increase defective parts qty and reduce machine parts qty
                    for (const part of orderedParts) {
                        await addDefectiveQuantity(machine_id, part.part_id, part.qty);
                        await reduceMachinePartQty(machine_id, part.part_id, part.qty);
                    }
                    break;
                
                case 'less':
                    // Use fewer parts: decrease machine parts and increase damaged parts
                    for (const part of orderedParts) {
                        await reduceMachinePartQty(machine_id, part.part_id, part.qty);
                        await increaseDamagedPartQty(factory_id, part.part_id, part.qty);
                    }
                    break;
                
                case 'borrowed':
                    // Borrowing parts: create loan transfers for each part
                    // If src_machine exists, borrow from machine; otherwise borrow from storage (src_factory)
                    if (!src_machine && !src_factory) {
                        throw new Error('Borrowing source information is missing - need either src_machine or src_factory');
                    }

                    for (const part of orderedParts) {
                        try {
                            if (src_machine) {
                                // Create loan transfer from machine to machine
                                await createLoanTransfer({
                                    part_id: part.part_id,
                                    qty: part.qty,
                                    is_completed: false,
                                    completed_at: null,
                                    borrowed_factory_id: null,
                                    borrowed_machine_id: src_machine,
                                    factory_id: factory_id,
                                    machine_id: machine_id,
                                });
                            } else if (src_factory) {
                                // Create loan transfer from storage to machine
                                await createLoanTransfer({
                                    part_id: part.part_id,
                                    qty: part.qty,
                                    is_completed: false,
                                    completed_at: null,
                                    borrowed_factory_id: src_factory,
                                    borrowed_machine_id: null,
                                    factory_id: factory_id,
                                    machine_id: machine_id,
                                });
                            }
                        } catch (loanError) {
                            errors.push(`Failed to create loan transfer for part ${part.part_id}: ${loanError}`);
                        }
                    }
                    break;
                
                default:
                    // Fallback to standard process if unstable_type is not recognized
                    for (const part of orderedParts) {
                        await reduceMachinePartQty(machine_id, part.part_id, part.qty);
                        await increaseDamagedPartQty(factory_id, part.part_id, part.qty);
                    }
                    await setMachineIsRunningById(machine_id, false);
                    break;
            }
        }

        return { success: true, errors };
    } catch (error) {
        console.error("Error in PFM approval processing:", error);
        return { success: false, errors: [`PFM processing error: ${error}`] };
    }
};


/**
 * Handles the PFS (Purchase for Storage) approval process
 * Increases storage part quantities for all ordered parts
 */
export const handlePFSApproval = async (
    orderedParts: OrderedPart[],
    factory_id: number
): Promise<{ success: boolean; errors: string[] }> => {
    const errors: string[] = [];

    try {
        for (const part of orderedParts) {
            await increaseStoragePartQty(part.part_id, factory_id, part.qty);
        }
        return { success: errors.length === 0, errors };
    } catch (error) {
        console.error("Error in PFS approval processing:", error);
        return { success: false, errors: [`PFS processing error: ${error}`] };
    }
};

/**
 * Handles the STM (Storage to Machine) approval process
 * Transfers parts from storage to machine and handles machine status
 */
export const handleSTMApproval = async (
    orderedParts: OrderedPart[],
    machine_id: number,
    src_factory_id: number,
    marked_inactive: boolean
): Promise<{ success: boolean; errors: string[] }> => {
    const errors: string[] = [];

    try {
        // Handle machine status based on marked_inactive
        if (marked_inactive) {
            await setMachineIsRunningById(machine_id, false);
        }

        // Transfer parts from storage to machine
        for (const part of orderedParts) {
            await reduceStoragePartQty(part.part_id, src_factory_id, part.qty);
            await increaseMachinePartQty(machine_id, part.part_id, part.qty);
        }

        return { success: true, errors };
    } catch (error) {
        console.error("Error in STM approval processing:", error);
        return { success: false, errors: [`STM processing error: ${error}`] };
    }
};

/**
 * Handles the MTS (Machine to Storage) approval process
 * Transfers parts from machine to storage and handles machine status
 */
export const handleMTSApproval = async (
    orderedParts: OrderedPart[],
    src_machine_id: number,
    dest_factory_id: number,
    marked_inactive: boolean
): Promise<{ success: boolean; errors: string[] }> => {
    const errors: string[] = [];

    try {
        // Handle machine status based on marked_inactive
        if (marked_inactive) {
            await setMachineIsRunningById(src_machine_id, false);
        }

        // Transfer parts from machine to storage
        for (const part of orderedParts) {
            await reduceMachinePartQty(src_machine_id, part.part_id, part.qty);
            await increaseStoragePartQty(part.part_id, dest_factory_id, part.qty);
        }

        return { success: true, errors };
    } catch (error) {
        console.error("Error in MTS approval processing:", error);
        return { success: false, errors: [`MTS processing error: ${error}`] };
    }
};
