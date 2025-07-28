import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { returnOrderedPartByID } from "@/services/OrderedPartsService";
import { updateMachinePartQty } from "@/services/MachinePartsService";
import { updateStoragePartQty } from "@/services/StorageService";
import { OrderedPart } from "@/types";
import toast from "react-hot-toast";

interface ReturnPartActionProps {
  openThisActionDialog: boolean;
  setOpenThisActionDialog: (v: boolean) => void;
  setActionMenuOpen: (v: boolean) => void;
  orderedPartInfo: OrderedPart;
  order_type: string;
  machine_id: number | null;
  factory_id: number | null;
}

const ReturnPartAction: React.FC<ReturnPartActionProps> = ({
  openThisActionDialog,
  setOpenThisActionDialog,
  setActionMenuOpen,
  orderedPartInfo,
  order_type,
  machine_id,
  factory_id,
}) => {
  const handleReturnPart = async () => {
    try {
      await returnOrderedPartByID(orderedPartInfo.id);

      if (order_type === "Storage" && factory_id !== null) {
        await updateStoragePartQty(orderedPartInfo.part_id, factory_id, orderedPartInfo.qty, "subtract");
      }

      if (order_type === "Machine" && machine_id !== null) {
        await updateMachinePartQty(machine_id, orderedPartInfo.part_id, orderedPartInfo.qty, "subtract");
      }

      toast.success("Part returned successfully");
    } catch (error) {
      toast.error("Error returning part");
    }

    setOpenThisActionDialog(false);
    setActionMenuOpen(false);
  };

  return (
    <Dialog open={openThisActionDialog} onOpenChange={setOpenThisActionDialog}>
      <DialogContent>
        <DialogTitle>
          Returning Part - <span className="text-sm">{orderedPartInfo.parts.name}</span>
        </DialogTitle>
        <DialogDescription>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to return this part?
          </p>
        </DialogDescription>
        <Button onClick={handleReturnPart}>Approve</Button>
      </DialogContent>
    </Dialog>
  );
};

export default ReturnPartAction;
