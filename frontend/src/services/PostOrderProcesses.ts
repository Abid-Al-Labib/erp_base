import { setMachineIsRunningById } from "@/services/MachineServices";
import { increaseDamagedPartQty } from '@/services/DamagedGoodsService';
import { addDefectiveQuantity, increaseMachinePartQty, reduceMachinePartQty } from "@/services/MachinePartsService";
import { increaseStoragePartQty, reduceStoragePartQty } from "@/services/StorageService";
import { InputOrderedPart } from "@/types";

// ============================================================================
// POST ORDER PROCESSING SERVICES
// ============================================================================

/**
 * Process post-order tasks for PFM (Purchase For Machine) orders
 * @param orderedParts - Array of ordered parts
 * @param selectedMachineId - ID of the selected machine
 * @param selectedFactoryId - ID of the selected factory
 * @param markAsInactive - Whether to mark the machine as inactive
 * @returns Processing result with success status and any errors
 */
export const processPFMPostOrderTasks = async (
    orderedParts: InputOrderedPart[], 
    selectedMachineId: number, 
    selectedFactoryId: number, 
    markAsInactive: boolean
) => {
    const errors: string[] = [];
    
    try {
        if (markAsInactive) {
            await setMachineIsRunningById(selectedMachineId, false);
            for (const part of orderedParts) {
                await increaseDamagedPartQty(selectedFactoryId, part.part_id, part.qty);
                await reduceMachinePartQty(selectedMachineId, part.part_id, part.qty);
            }
        } else {
            for (const part of orderedParts) {
                await addDefectiveQuantity(selectedMachineId, part.part_id, part.qty);
            }
        }
        return { success: errors.length === 0, errors };
    } catch (error) {
        console.error("Error in PFM post-order processing:", error);
        return { success: false, errors: [`PFM processing error: ${error}`] };
    }
};

/**
 * Process post-order tasks for PFS (Purchase For Storage) orders
 * @returns Processing result with success status and any errors
 */
export const processPFSPostOrderTasks = async (
    orderedParts: InputOrderedPart[], 
    selectedFactoryId: number, 
) => {
    const errors: string[] = [];

    try {
        for (const part of orderedParts) {
            await increaseStoragePartQty(part.part_id, selectedFactoryId, part.qty);
        }
        return { success: errors.length === 0, errors };
    } catch (error) {
        console.error("Error in PFS post-order processing:", error);
        return { success: false, errors: [`PFS processing error: ${error}`] };
    }
};

/**
 * Process post-order tasks for STM (Storage To Machine) orders
 * @param orderedParts - Array of ordered parts
 * @param selectedMachineId - ID of the selected machine
 * @param srcFactoryId - ID of the source factory (where parts come from)
 * @param markAsInactive - Whether to mark the machine as inactive
 * @returns Processing result with success status and any errors
 */
export const processSTMPostOrderTasks = async (
    orderedParts: InputOrderedPart[], 
    selectedMachineId: number, 
    srcFactoryId: number, 
    markAsInactive: boolean
) => {
    if (markAsInactive) {
        await setMachineIsRunningById(selectedMachineId, false);
    }
    try {
        //MAYBE NEED TO MOVE THIS TO AFTER ORDER COMPLETED??
        console.log("srcFactoryId", srcFactoryId);
        for (const part of orderedParts) {
            await reduceStoragePartQty(part.part_id, srcFactoryId, part.qty);  
            await increaseMachinePartQty(selectedMachineId, part.part_id, part.qty);
        }
        return { success: true, errors: [] };
    } catch (error) {
        console.error("Error in STM post-order processing:", error);
        return { success: false, errors: [`STM processing error: ${error}`] };
    }
};

/**
 * Process post-order tasks for MTS (Machine To Storage) orders
 * @param orderedParts - Array of ordered parts
 * @param srcMachineId - ID of the source machine (where parts come from)
 * @param destFactoryId - ID of the destination factory (where parts go to storage)
 * @param markAsInactive - Whether to mark the machine as inactive
 * @returns Processing result with success status and any errors
 */
export const processMTSPostOrderTasks = async (
    orderedParts: InputOrderedPart[], 
    srcMachineId: number, 
    destFactoryId: number, 
    markAsInactive: boolean
) => {
    // console.log(`[DEBUG] MTS processPostOrderTasks called with: srcMachineId=${srcMachineId}, destFactoryId=${destFactoryId}, markAsInactive=${markAsInactive}`);
    // console.log(`[DEBUG] Processing ${orderedParts.length} parts:`, orderedParts.map(p => ({part_id: p.part_id, qty: p.qty})));
    
    if (markAsInactive) {
        await setMachineIsRunningById(srcMachineId, false);
    }
    try {
        for (const part of orderedParts) {
            console.log(`[DEBUG] Processing part: ${part.part_id}, qty: ${part.qty}, destFactory: ${destFactoryId}`);
            await reduceMachinePartQty(srcMachineId, part.part_id, part.qty);  
            await increaseStoragePartQty(part.part_id, destFactoryId, part.qty);
        }
        return { success: true, errors: [] };
    } catch (error) {
        console.error("Error in MTS post-order processing:", error);
        return { success: false, errors: [`MTS processing error: ${error}`] };
    }
};