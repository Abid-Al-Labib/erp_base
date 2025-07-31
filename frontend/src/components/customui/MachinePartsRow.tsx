// MachinePartsRow.tsx
import { useState } from 'react';
import { TableRow, TableCell } from '../ui/table';
import { Button } from '../ui/button';
import { updateRequiredQuantity, updateDefectiveQuantity } from "@/services/MachinePartsService";
import toast from 'react-hot-toast'; // Optional: For showing success/error messages
import { MachinePart } from '@/types';

interface MachinePartsRowProps {
    MachinePart: MachinePart;
    onRefresh: () => Promise<void>; // Add onRefresh prop to the row interface
}

const MachinePartsRow: React.FC<MachinePartsRowProps> = ({ MachinePart, onRefresh }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newCurQty, setNewCurQty] = useState<number>(MachinePart.qty);
    const [newReqQty, setNewReqQty] = useState<number>(MachinePart.req_qty ?? 0);
    const [newDefectiveQty, setNewDefectiveQty] = useState<number>(MachinePart.defective_qty ?? 0);

    const handleUpdate = async () => {
        try {
            await updateRequiredQuantity(MachinePart.id, newCurQty, newReqQty);
            await updateDefectiveQuantity(MachinePart.id, newDefectiveQty);
            setIsEditing(false); 
            MachinePart.req_qty = newReqQty; // Directly update the MachinePart object with the new quantity
            MachinePart.defective_qty = newDefectiveQty; // Update defective qty
            await onRefresh(); // Trigger a refresh after successful update
        } catch (error) {
            // console.error('Failed to update quantities:', error);
            toast.error('Failed to update quantities.'); // Optional: Show error message
        }
    };

    const hasDefectiveParts = MachinePart.defective_qty && MachinePart.defective_qty > 0;

    return (
        <TableRow key={MachinePart.id}>
            <TableCell>{MachinePart.parts.id}</TableCell>
            <TableCell>{MachinePart.parts.name}</TableCell>
            <TableCell>
                {isEditing ? (
                <input
                    type="number"
                    value={newCurQty}
                        onChange={(e) => setNewCurQty(Number(e.target.value))}
                    className="border p-1 rounded w-20"
                    aria-label="Edit current quantity"
                />
            ) : (
                <span className={`${MachinePart.qty < (MachinePart.req_qty ?? 0) ? 'text-orange-500' : ''}`}>
                    {MachinePart.qty}
                </span>
            )}</TableCell>
            <TableCell>
                {isEditing ? (
                    <input
                        type="number"
                        value={newDefectiveQty}
                        onChange={(e) => setNewDefectiveQty(Number(e.target.value))}
                        className="border p-1 rounded w-20"
                        aria-label="Edit defective quantity"
                        min="0"
                        placeholder="Defective parts"
                    />
                ) : (
                    <span className={`${hasDefectiveParts ? 'text-yellow-600 font-medium' : 'text-gray-500'}`}>
                        {MachinePart.defective_qty ?? 0}
                    </span>
                )}
            </TableCell>
            <TableCell>
                {isEditing ? (
                    <input
                        type="number"
                        value={newReqQty}
                        onChange={(e) => setNewReqQty(Number(e.target.value))}
                        className="border p-1 rounded w-20"
                        aria-label="Edit required quantity"
                    />
                ) : (
                    MachinePart.req_qty === -1 || MachinePart.req_qty === null ? (
                        <span className="text-red-500">--</span>
                    ) : (
                        MachinePart.req_qty
                    )
                )}
            </TableCell>
            <TableCell className="text-right">
                {isEditing ? (
                    <div className="flex justify-end gap-2">
                        <Button onClick={handleUpdate} size="sm">
                            Save
                        </Button>
                        <Button onClick={() => setIsEditing(false)} size="sm" variant="outline">
                            Cancel
                        </Button>
                    </div>
                ) : (
                    <Button onClick={() => setIsEditing(true)} size="sm">
                        Edit
                    </Button>
                )}
            </TableCell>
        </TableRow>
    );
};

export default MachinePartsRow;
