import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { increaseDamagedPartQty } from '@/services/DamagedGoodsService';
import { reduceMachinePartQty } from '@/services/MachinePartsService';
import { updateApprovedPendingOrderByID } from '@/services/OrderedPartsService';
import { OrderedPart } from '@/types';
import React from 'react'
import toast from 'react-hot-toast';

interface ApproveFromFactoryActionProps {
  openThisActionDialog: boolean;
  setOpenThisActionDialog: (v: boolean) => void;
  orderedPartInfo: OrderedPart;
  machine_id: number;
  factory_id: number;
  order_type: string;
  setActionMenuOpen: (v: boolean) => void;
}

const ApproveFromFactoryAction: React.FC<ApproveFromFactoryActionProps> = ({
  openThisActionDialog,
  setOpenThisActionDialog,
  orderedPartInfo,
  machine_id,
  factory_id,
  order_type,
  setActionMenuOpen,
}) => {

    
    
    const handleApproveFactory = async () => {
    try {
        await updateApprovedPendingOrderByID(orderedPartInfo.id, true);
        toast.success("Ordered part has been approved!");

        if (order_type === "PFM") {
        await reduceMachinePartQty(
            machine_id,
            orderedPartInfo.part_id,
            orderedPartInfo.qty
        );

        await increaseDamagedPartQty(
            factory_id,
            orderedPartInfo.part_id,
            orderedPartInfo.qty
        );
        }

        setOpenThisActionDialog(false);
        setActionMenuOpen(false);
    } catch (error) {
        toast.error("Error occurred. Could not complete action");
    }
    };

    

    return (
        <Dialog open={openThisActionDialog} onOpenChange={setOpenThisActionDialog}>
            <DialogContent>
                <DialogTitle>
                Approval From Factory - <span className="text-sm">{orderedPartInfo.parts.name}</span>
                </DialogTitle>
                <DialogDescription>
                <p className="text-sm text-muted-foreground">
                    Are you sure you want to approve this part?
                </p>
                </DialogDescription>
                <Button onClick={handleApproveFactory}>Approve</Button>
            </DialogContent>
        </Dialog>
              
    )
}

export default ApproveFromFactoryAction