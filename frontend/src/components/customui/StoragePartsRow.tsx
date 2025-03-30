import { useState } from 'react';
import { TableCell, TableRow } from '../ui/table';
import { editStoragePartQty } from "@/services/StorageService";
import { updateDamagePartQuantity } from "@/services/DamagedGoodsService";
import toast from 'react-hot-toast';
import { Button } from '../ui/button';
import { StoragePart } from "@/types";

interface StoragePartsRowProps {
    part: StoragePart;
    isDamaged?: boolean;
}

const StoragePartsRow: React.FC<StoragePartsRowProps> = ({ part, isDamaged = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newQty, setNewQty] = useState<number>(part.qty);
    
    const handleSave = async () => {
        try {
            if (isDamaged) {
                await updateDamagePartQuantity(part.factory_id, part.part_id, newQty);
            } else {
                await editStoragePartQty(part.part_id, part.factory_id, newQty);
            }
            part.qty = newQty; // Update the part's qty locally
            setIsEditing(false);
            toast.success("Quantity updated successfully");
        } catch (error) {
            toast.error("Failed to update quantity");
        }
    };
    
    return (
        <TableRow>
            {/* <TableCell>{part.storageId}</TableCell> */}
            <TableCell>{part.parts.id}</TableCell>
            <TableCell>{part.parts.name}</TableCell>
            <TableCell>
                {isEditing ? (
                    <input
                        type="number"
                        value={newQty}
                        onChange={(e) => setNewQty(Number(e.target.value))}
                        className="border p-1 rounded w-20"
                    />
                ) : (
                    part.qty
                )}
            </TableCell>
            <TableCell className="text-right">
                {isEditing ? (
                    <>
                        <Button onClick={handleSave} className="ml-2">Save</Button>
                        <Button onClick={() => setIsEditing(false)} className="ml-2">Cancel</Button>
                    </>
                ) : (
                    <Button onClick={() => setIsEditing(true)} className="ml-2">Edit</Button>
                )}
            </TableCell>
        </TableRow>
    );
};

export default StoragePartsRow;


