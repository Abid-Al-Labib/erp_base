import { useState } from 'react';
import { TableCell, TableRow } from '../ui/table';
import { editStoragePartQty, deleteStoragePart } from "@/services/StorageService";
import { updateDamagePartQuantity, deleteDamagedPart } from "@/services/DamagedGoodsService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import toast from 'react-hot-toast';
import { Button } from '../ui/button';
import { StoragePart } from "@/types";

interface StoragePartsRowProps {
    part: StoragePart;
    isDamaged?: boolean;
    onDelete?: () => void;
}

const StoragePartsRow: React.FC<StoragePartsRowProps> = ({ part, isDamaged = false, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newQty, setNewQty] = useState<number>(part.qty);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
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

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            if (isDamaged) {
                await deleteDamagedPart(part.part_id, part.factory_id);
            } else {
                await deleteStoragePart(part.part_id, part.factory_id);
            }
            setIsDeleteDialogOpen(false);
            if (onDelete) {
                onDelete(); // Refresh the list
            }
        } catch (error) {
            toast.error("Failed to delete part");
        } finally {
            setIsDeleting(false);
        }
    };
    
    return (
        <>
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
                            aria-label="Edit quantity"
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
                        <>
                            <Button onClick={() => setIsEditing(true)} className="mr-2">Edit</Button>
                            <Button 
                                onClick={() => setIsDeleteDialogOpen(true)} 
                                variant="destructive" 
                                size="sm"
                                className="text-white"
                            >
                                Delete
                            </Button>
                        </>
                    )}
                </TableCell>
            </TableRow>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete {isDamaged ? 'Damaged' : 'Storage'} Part</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{part.parts.name}</strong> from {isDamaged ? 'damaged parts' : 'storage'}?
                            <br />
                            <br />
                            Current quantity: <strong>{part.qty} {part.parts.unit || 'units'}</strong>
                            <br />
                            <br />
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default StoragePartsRow;


