import { useState } from "react";
import { TableCell, TableRow } from "../ui/table";
import {
  editStoragePartQty,
  deleteStoragePart,
  updateStoragePartAvg,
} from "@/services/StorageService";
import {
  updateDamagePartQuantity,
  deleteDamagedPart,
  updateDamagedPartAvg, // <-- add this
} from "@/services/DamagedGoodsService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { StoragePart } from "@/types";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface StoragePartsRowProps {
  part: StoragePart;
  isDamaged?: boolean;
  onDelete?: () => void;
}

const StoragePartsRow: React.FC<StoragePartsRowProps> = ({
  part,
  isDamaged = false,
  onDelete,
}) => {
  // Delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset avg price dialog (storage)
  const [isResetAvgPriceDialogOpen, setIsResetAvgPriceDialogOpen] =
    useState(false);
  const [isResettingAvg, setIsResettingAvg] = useState(false);
  const [newAvgPrice, setNewAvgPrice] = useState<string>("");
  const [confirmResetChecked, setConfirmResetChecked] =
    useState<boolean>(false);

  // Update avg price dialog (damaged)
  const [isDamagedAvgDialogOpen, setIsDamagedAvgDialogOpen] = useState(false);
  const [damagedNewAvgPrice, setDamagedNewAvgPrice] = useState<string>("");
  const [damagedConfirmChecked, setDamagedConfirmChecked] = useState(false);
  const [isUpdatingDamagedAvg, setIsUpdatingDamagedAvg] = useState(false);

  // Edit quantity dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editQty, setEditQty] = useState<string>(String(part.qty));
  const [isSavingQty, setIsSavingQty] = useState(false);

  const openEditDialog = () => {
    setEditQty(String(part.qty)); // initialize with current qty
    setIsEditDialogOpen(true);
  };

  const handleSaveQty = async () => {
    const qtyNum = Number(editQty);
    if (Number.isNaN(qtyNum) || qtyNum < 0) {
      toast.error("Please enter a valid quantity (0 or greater).");
      return;
    }

    setIsSavingQty(true);
    try {
      if (isDamaged) {
        await updateDamagePartQuantity(part.factory_id, part.part_id, qtyNum);
      } else {
        await editStoragePartQty(part.part_id, part.factory_id, qtyNum);
      }
      // update local row display
      part.qty = qtyNum;
      toast.success("Quantity updated successfully");
      setIsEditDialogOpen(false);
    } catch {
      toast.error("Failed to update quantity");
    } finally {
      setIsSavingQty(false);
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
      onDelete?.();
    } catch {
      toast.error("Failed to delete part");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmResetAvgPrice = async () => {
    const valueNum = Number(newAvgPrice);
    if (!newAvgPrice || Number.isNaN(valueNum) || valueNum <= 0) {
      toast.error("Please enter a valid average price greater than 0");
      return;
    }
    if (!confirmResetChecked) {
      toast.error("Please confirm that you understand this cannot be undone");
      return;
    }
    setIsResettingAvg(true);
    try {
      await updateStoragePartAvg(part.part_id, part.factory_id, valueNum);
      part.avg_price = valueNum; // local update for immediate UI feedback
      toast.success("Average price reset successfully");
      // close + reset dialog state
      setIsResetAvgPriceDialogOpen(false);
      setNewAvgPrice("");
      setConfirmResetChecked(false);
    } catch {
      toast.error("Failed to reset average price");
    } finally {
      setIsResettingAvg(false);
    }
  };

  const handleConfirmUpdateDamagedAvg = async () => {
    const valueNum = Number(damagedNewAvgPrice);
    if (!damagedNewAvgPrice || Number.isNaN(valueNum) || valueNum <= 0) {
      toast.error("Please enter a valid average price greater than 0");
      return;
    }
    if (!damagedConfirmChecked) {
      toast.error("Please confirm that you understand this overrides the current average");
      return;
    }
    setIsUpdatingDamagedAvg(true);
    try {
      await updateDamagedPartAvg(part.part_id, part.factory_id, valueNum);
      part.avg_price = valueNum; // local update
      toast.success("Damaged part average price updated");
      setIsDamagedAvgDialogOpen(false);
      setDamagedNewAvgPrice("");
      setDamagedConfirmChecked(false);
    } catch {
      toast.error("Failed to update damaged part average price");
    } finally {
      setIsUpdatingDamagedAvg(false);
    }
  };

  return (
    <>
      <TableRow>
        <TableCell>{part.parts.id}</TableCell>
        <TableCell>{part.parts.name}</TableCell>
        <TableCell>{part.qty}</TableCell>
        <TableCell>{part.avg_price ? part.avg_price : "-"}</TableCell>

        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="More actions">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={openEditDialog}>
                Edit quantity
              </DropdownMenuItem>

              {/* Storage-only: Reset Avg. Price */}
              {!isDamaged && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsResetAvgPriceDialogOpen(true)}
                  >
                    Reset Avg. Price
                  </DropdownMenuItem>
                </>
              )}

              {/* Damaged-only: Update Avg. Price */}
              {isDamaged && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsDamagedAvgDialogOpen(true)}
                  >
                    Update Avg. Price
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-red-600 focus:text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {/* Edit Quantity Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Quantity</DialogTitle>
            <DialogDescription>
              Update the quantity for <strong>{part.parts.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label htmlFor="edit_qty" className="text-sm font-medium">
              New Quantity ({part.parts.unit || "units"})
            </label>
            <Input
              id="edit_qty"
              type="number"
              min={0}
              step={1}
              value={editQty}
              onChange={(e) => setEditQty(e.target.value)}
              placeholder="Enter new quantity"
            />
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSavingQty}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveQty} disabled={isSavingQty}>
              {isSavingQty ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Delete {isDamaged ? "Damaged" : "Storage"} Part
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{part.parts.name}</strong> from{" "}
              {isDamaged ? "damaged parts" : "storage"}?
              <br />
              <br />
              Current quantity:{" "}
              <strong>
                {part.qty} {part.parts.unit || "units"}
              </strong>
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

      {/* Reset Avg. Price Dialog (storage) */}
      <Dialog
        open={isResetAvgPriceDialogOpen}
        onOpenChange={setIsResetAvgPriceDialogOpen}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Reset Average Price
            </DialogTitle>
            <DialogDescription>
              Set a new average cost for{" "}
              <strong>{part.parts.name}</strong>. This overrides previous
              calculations for this part in this factory.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm">
            <strong>Warning:</strong> You are about to reset the average price.
            <br />
            This cannot be undone and is not recommended in normal operations.
            <br />
            This will <em>hard override</em> the average cost, ignoring previous
            calculations.
          </div>

          <div className="mt-4 space-y-2">
            <label htmlFor="new_avg_price" className="text-sm font-medium">
              New Average Price ({part.parts.unit || "unit"})
            </label>
            <Input
              id="new_avg_price"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Enter new average price"
              value={newAvgPrice}
              onChange={(e) => setNewAvgPrice(e.target.value)}
            />
          </div>

          <label className="mt-3 flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={confirmResetChecked}
              onChange={(e) => setConfirmResetChecked(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              I understand this step cannot be undone and is a manual override
              of the average price.
            </span>
          </label>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsResetAvgPriceDialogOpen(false);
                setNewAvgPrice("");
                setConfirmResetChecked(false);
              }}
              disabled={isResettingAvg}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmResetAvgPrice}
              disabled={isResettingAvg}
            >
              {isResettingAvg ? "Resetting..." : "Reset Avg. Price"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Avg. Price Dialog (damaged) */}
      <Dialog
        open={isDamagedAvgDialogOpen}
        onOpenChange={setIsDamagedAvgDialogOpen}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Update Average Price (Damaged)</DialogTitle>
            <DialogDescription>
              Set a new average cost for{" "}
              <strong>{part.parts.name}</strong> in damaged inventory.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-3 text-sm">
            <strong>Warning:</strong> This will override the current damaged
            average cost for this part at this factory.
          </div>

          <div className="mt-4 space-y-2">
            <label htmlFor="damaged_avg_price" className="text-sm font-medium">
              New Average Price ({part.parts.unit || "unit"})
            </label>
            <Input
              id="damaged_avg_price"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Enter new average price"
              value={damagedNewAvgPrice}
              onChange={(e) => setDamagedNewAvgPrice(e.target.value)}
            />
          </div>

          <label className="mt-3 flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={damagedConfirmChecked}
              onChange={(e) => setDamagedConfirmChecked(e.target.checked)}
              className="mt-0.5"
            />
            <span>I understand this will override the current average.</span>
          </label>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDamagedAvgDialogOpen(false);
                setDamagedNewAvgPrice("");
                setDamagedConfirmChecked(false);
              }}
              disabled={isUpdatingDamagedAvg}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmUpdateDamagedAvg}
              disabled={isUpdatingDamagedAvg}
            >
              {isUpdatingDamagedAvg ? "Updating..." : "Update Avg. Price"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StoragePartsRow;
