import { Order, OrderedPart } from "@/types";
import {
  showBudgetApproveButton,
  showPendingOrderApproveButton,
  showOfficeOrderApproveButton,
  showOfficeOrderDenyButton,
  showPurchaseButton,
  showQuotationButton,
  showReceivedButton,
  showSampleReceivedButton,
  showSentButton,
  showReviseBudgetButton,
  showOfficeNoteButton,
  showApproveTakingFromStorageButton,
  showMrrButton,
  showReturnButton,
  showRemovePartButton,
  showUpdatePartQuantityButton,
} from "@/services/ButtonVisibilityHelper";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ApproveFromFactoryAction from "./Actions/ApproveFromFactoryAction";
import { useState } from "react";
import RemovePartAction from "./Actions/RemovePartAction";
import UpdatePartQtyAction from "./Actions/UpdatePartQtyAction";
import ApproveOfficeAction from "./Actions/ApproveOfficeAction";
import OfficeNoteAction from "./Actions/OfficeNoteAction";
import ApproveBudgetAction from "./Actions/ApproveBudgetAction";
import QuotationAction from "./Actions/QuotationAction";
import ApproveTakingFromStorageAction from "./Actions/ApproveTakingFromStorageAction";
import ReviseBudgetAction from "./Actions/ReviseBudgetAction";
import ReceivedAction from "./Actions/ReceivedAction";
import SentAction from "./Actions/SentAction";
import PurchasedAction from "./Actions/PurchasedAction";
import MRRInputAction from "./Actions/MRRInputAction";
import SampleReceivedAction from "./Actions/SampleReceivedAction";
import ReturnPartAction from "./Actions/ReturnPartAction";

interface OrderedPartsActionMenuProps {
  order: Order;
  orderedPartInfo: OrderedPart;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

const OrderedPartsActionMenu: React.FC<OrderedPartsActionMenuProps> = ({
  order,
  orderedPartInfo,
  isOpen,
  setIsOpen,
}) => {

  const [isApproveFromOfficeDialogOpen, setIsApproveFromOfficeDialogOpen] = useState(false);
  const [isRemovePartDialogOpen, setIsRemovePartDialogOpen] = useState(false);
  const [isApproveFromFactoryDialogOpen, setIsApproveFromFactoryDialogOpen] = useState(false);
  const [isApproveBudgetDialogOpen, setIsApproveBudgetDialogOpen] = useState(false);
  const [isSampleReceivedDialogOpen, setIsSampleReceivedDialogOpen] = useState(false);
  const [isPurchasedDialogOpen, setIsPurchasedDialogOpen] = useState(false);
  const [isSentDialogOpen, setIsSentDialogOpen] = useState(false);
  const [isReceivedDialogOpen, setIsReceivedDialogOpen] = useState(false);
  const [isCostingDialogOpen,setIsCostingDialogOpen] = useState(false);
  const [isReviseBudgetDialogOpen, setIsReviseBudgetDialogOpen] = useState(false);
  const [isOfficeNoteDialogOpen, setIsOfficeNoteDialogOpen] = useState(false);
  const [isTakeFromStorageDialogOpen, setIsTakeFromStorageDialogOpen] = useState(false);
  const [isMrrDialogOpen, setIsMrrDialogOpen] = useState(false)
  const [isUpdatePartQuantityDialogOpen, setIsUpdatePartQuantityDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogTitle>Part Actions</DialogTitle>
        <DialogDescription>
          Select an action for <b>{orderedPartInfo.parts.name}</b>
        </DialogDescription>
        <div className="flex flex-col gap-2 pt-2">
          {showOfficeOrderApproveButton(order.statuses.name, orderedPartInfo.approved_office_order) && (
            <>
              <Button variant="outline" onClick={() => setIsApproveFromOfficeDialogOpen(true)}>
                Approve from Office
              </Button>
              <ApproveOfficeAction openThisActionDialog={isApproveFromOfficeDialogOpen} setOpenThisActionDialog={setIsApproveFromOfficeDialogOpen} setActionMenuOpen={setIsOpen} orderedPartInfo={orderedPartInfo} />
            </>
          )}
          {showPendingOrderApproveButton(order.statuses.name, orderedPartInfo.approved_pending_order) && (
            <>
              <Button variant="outline" onClick={() => setIsApproveFromFactoryDialogOpen(true)}>
                Approve from Factory
              </Button>
              <ApproveFromFactoryAction openThisActionDialog={isApproveFromFactoryDialogOpen} setOpenThisActionDialog={setIsApproveFromFactoryDialogOpen} orderedPartInfo={orderedPartInfo} machine_id={order.machine_id} factory_id={order.factory_id} order_type={order.order_type} setActionMenuOpen={setIsOpen} />
            </>
          )}
          {showRemovePartButton(order.statuses.name) && (
            <>
              <Button variant="destructive" onClick={() => setIsRemovePartDialogOpen(true)}>
                Remove Part
              </Button>
              <RemovePartAction openThisActionDialog={isRemovePartDialogOpen} setOpenThisActionDialog={setIsRemovePartDialogOpen} setActionMenuOpen={setIsOpen} orderedPartInfo={orderedPartInfo} />
            </>
          )}
          {showUpdatePartQuantityButton(order.statuses.name) && (
            <>
              <Button onClick={() => setIsUpdatePartQuantityDialogOpen(true)}>
                Update Quantity
              </Button>
              <UpdatePartQtyAction openThisActionDialog={isUpdatePartQuantityDialogOpen} setOpenThisActionDialog={setIsUpdatePartQuantityDialogOpen} setActionMenuOpen={setIsOpen} orderedPartInfo={orderedPartInfo} />
            </>
          )}
          {showApproveTakingFromStorageButton(order.statuses.name, orderedPartInfo.in_storage, orderedPartInfo.approved_storage_withdrawal) && (
            <Button variant="outline" onClick={() => setIsTakeFromStorageDialogOpen(true)}>
              Take from Storage
            </Button>
          )}
          <ApproveTakingFromStorageAction isDialogOpen={isTakeFromStorageDialogOpen} setIsDialogOpen={setIsTakeFromStorageDialogOpen} setActionMenuOpen={setIsOpen} orderedPartInfo={orderedPartInfo} factory_id={order.factory_id} machine_id={order.machine_id} />
          {showOfficeNoteButton(order.statuses.name) && (
            <>
              <Button variant="outline" onClick={() => setIsOfficeNoteDialogOpen(true)}>
                Add Office Note
              </Button>
              <OfficeNoteAction openThisActionDialog={isOfficeNoteDialogOpen} setOpenThisActionDialog={setIsOfficeNoteDialogOpen} setActionMenuOpen={setIsOpen} orderedPartInfo={orderedPartInfo} />
            </>
          )}
          {showBudgetApproveButton(order.statuses.name, orderedPartInfo.approved_budget, orderedPartInfo.qty, orderedPartInfo.vendor, orderedPartInfo.brand) && (
            <ApproveBudgetAction openThisActionDialog={isApproveBudgetDialogOpen} setOpenThisActionDialog={setIsApproveBudgetDialogOpen} setActionMenuOpen={setIsOpen} orderedPartInfo={orderedPartInfo} />
          )}
          {showReviseBudgetButton(order.statuses.name, orderedPartInfo.approved_budget) && (
            <>
              <Button variant="destructive" onClick={() => setIsReviseBudgetDialogOpen(true)}>
                Revise Budget
              </Button>
              <ReviseBudgetAction openThisActionDialog={isReviseBudgetDialogOpen} setOpenThisActionDialog={setIsReviseBudgetDialogOpen} setActionMenuOpen={setIsOpen} orderedPartInfo={orderedPartInfo} />
            </>
          )}
          {showOfficeOrderDenyButton(order.statuses.name) && (
            <>
              <Button variant="destructive" onClick={() => setIsRemovePartDialogOpen(true)}>
                Deny Part
              </Button>
              <RemovePartAction openThisActionDialog={isRemovePartDialogOpen} setOpenThisActionDialog={setIsRemovePartDialogOpen} setActionMenuOpen={setIsOpen} orderedPartInfo={orderedPartInfo} />
            </>
          )}
          {showQuotationButton(order.statuses.name, orderedPartInfo.brand, orderedPartInfo.vendor, orderedPartInfo.unit_cost) && (
            <>
              <Button className="border-purple-600" variant="outline" onClick={() => setIsCostingDialogOpen(true)}>
                Quotation
              </Button>
              <QuotationAction openThisActionDialog={isCostingDialogOpen} setOpenThisActionDialog={setIsCostingDialogOpen} setActionMenuOpen={setIsOpen} orderedPartInfo={orderedPartInfo} />
            </>
          )}
          {showPurchaseButton(order.statuses.name, orderedPartInfo.part_purchased_date) && (
            <>
              <Button variant="outline" onClick={() => setIsPurchasedDialogOpen(true)}>
                Set Purchase Date
              </Button>
              <PurchasedAction openThisActionDialog={isPurchasedDialogOpen} setOpenThisActionDialog={setIsPurchasedDialogOpen} setActionMenuOpen={setIsOpen} orderedPartInfo={orderedPartInfo} />
            </>
          )}
          {showSentButton(order.statuses.name, orderedPartInfo.part_sent_by_office_date) && (
            <>
              <Button variant="outline" onClick={() => setIsSentDialogOpen(true)}>
                Set Sent Date
              </Button>
              <SentAction openThisActionDialog={isSentDialogOpen} setOpenThisActionDialog={setIsSentDialogOpen} setActionMenuOpen={setIsOpen} orderedPartInfo={orderedPartInfo} />
            </>
          )}
          {showReceivedButton(order.statuses.name, orderedPartInfo.part_received_by_factory_date) && (
            <>
              <Button variant="outline" onClick={() => setIsReceivedDialogOpen(true)}>
                Set Received Date
              </Button>
              <ReceivedAction openThisActionDialog={isReceivedDialogOpen} setOpenThisActionDialog={setIsReceivedDialogOpen} setActionMenuOpen={setIsOpen} orderedPartInfo={orderedPartInfo} order_type={order.order_type} factory_id={order.factory_id} machine_id={order.machine_id} />
            </>
          )}
          {showMrrButton(order.statuses.name, orderedPartInfo.mrr_number) && (
            <>
              <Button variant="outline" onClick={() => setIsMrrDialogOpen(true)}>
                Add MRR Number
              </Button>
              <MRRInputAction openThisActionDialog={isMrrDialogOpen} setOpenThisActionDialog={setIsMrrDialogOpen} setActionMenuOpen={setIsOpen} orderedPartInfo={orderedPartInfo} />
            </>
          )}
          {showSampleReceivedButton(orderedPartInfo.is_sample_sent_to_office, orderedPartInfo.is_sample_received_by_office) && (
            <>
              <Button variant="outline" onClick={() => setIsSampleReceivedDialogOpen(true)}>
                Receive Sample
              </Button>
              <SampleReceivedAction openThisActionDialog={isSampleReceivedDialogOpen} setOpenThisActionDialog={setIsSampleReceivedDialogOpen} setActionMenuOpen={setIsOpen} orderedPartInfo={orderedPartInfo} />
            </>
          )}
          {showReturnButton(order.statuses.name, orderedPartInfo) && (
            <>
              <Button variant="destructive" onClick={() => setIsReturnDialogOpen(true)}>
                Return Part
              </Button>
              <ReturnPartAction openThisActionDialog={isReturnDialogOpen} setOpenThisActionDialog={setIsReturnDialogOpen} setActionMenuOpen={setIsOpen} orderedPartInfo={orderedPartInfo} order_type={order.order_type} machine_id={order.machine_id} factory_id={order.factory_id} />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderedPartsActionMenu;
