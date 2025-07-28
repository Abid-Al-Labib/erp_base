import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { updateSentDateByID } from "@/services/OrderedPartsService";
import { OrderedPart } from "@/types";
import { useState } from "react";
import toast from "react-hot-toast";

interface SentActionProps {
  openThisActionDialog: boolean;
  setOpenThisActionDialog: (v: boolean) => void;
  setActionMenuOpen: (v: boolean) => void;
  orderedPartInfo: OrderedPart;
}

const SentAction: React.FC<SentActionProps> = ({
  openThisActionDialog,
  setOpenThisActionDialog,
  setActionMenuOpen,
  orderedPartInfo,
}) => {
  const [dateSent, setDateSent] = useState<Date | undefined>(
    orderedPartInfo.part_sent_by_office_date
      ? new Date(orderedPartInfo.part_sent_by_office_date)
      : new Date()
  );

  const handleUpdateSentDate = async () => {
    if (dateSent && orderedPartInfo.part_purchased_date) {
      const sentDateStr = new Date(dateSent).toDateString();
      const purchasedDateStr = new Date(orderedPartInfo.part_purchased_date).toDateString();

      if (sentDateStr >= purchasedDateStr) {
        try {
          await updateSentDateByID(orderedPartInfo.id, dateSent);
          toast.success("Part sent to factory date set!");
        } catch (error) {
          toast.error("Error occurred. Could not complete action.");
        }
      } else {
        toast.error("Sent date must be after or equal to purchased date.");
        return;
      }
    } else {
      toast.error("Sent or purchase date missing.");
      return;
    }

    setOpenThisActionDialog(false);
    setActionMenuOpen(false);
  };

  return (
    <Dialog open={openThisActionDialog} onOpenChange={setOpenThisActionDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>Date when part was sent to factory</DialogTitle>
        <DialogDescription>
          <span className="text-sm">{orderedPartInfo.parts.name}</span>
        </DialogDescription>
        <Calendar
          mode="single"
          selected={dateSent}
          onSelect={setDateSent}
          className="rounded-md border"
        />
        <Button onClick={handleUpdateSentDate}>Confirm</Button>
      </DialogContent>
    </Dialog>
  );
};

export default SentAction;
