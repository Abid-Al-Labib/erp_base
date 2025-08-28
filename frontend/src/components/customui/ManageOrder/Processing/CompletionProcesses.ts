import { calculatePartAveragePrice } from "@/services/helper";
import { fetchStoragePartByFactoryAndPartID, increaseStoragePartQty, updateStoragePartAvg } from "@/services/StorageService";
import { OrderedPart } from "@/types";
import toast from "react-hot-toast";

export const handlePFSReceivedAction = async (
    orderedPart: OrderedPart,
    factory_id: number,
): Promise<boolean> => {
    try {
        const storage_part_data = await fetchStoragePartByFactoryAndPartID(orderedPart.part_id,factory_id) 
        let new_avg_price: number
        
        if (!orderedPart.unit_cost){
            //cost for ordered part is missing
            toast.error("The average for this item cannot be calculated since the cost for this ordered part was not set")
            return false;
        }

        if(storage_part_data)
        {
            if (!storage_part_data.avg_price){
                // storage data exists but no averrage price
                toast.error("The average for this item cannot be calculated since the current average cost for this part in storage does not exist")
                return false;
            }
            new_avg_price = calculatePartAveragePrice(storage_part_data.qty, storage_part_data.avg_price, orderedPart.qty, orderedPart.unit_cost)
        }
        else{
            new_avg_price = calculatePartAveragePrice(0, 0, orderedPart.qty, orderedPart.unit_cost)
        }
        await increaseStoragePartQty(orderedPart.part_id,factory_id,orderedPart.qty);
        await updateStoragePartAvg(orderedPart.part_id, factory_id,new_avg_price)
        return true
    } catch (error) {
        toast.error("Failed to complete order")
        return false
    }

}
    