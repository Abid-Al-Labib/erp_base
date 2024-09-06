import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { TableCell, TableRow } from "../ui/table"
import { Button } from "../ui/button"
import { Calculator, CalendarArrowUp, ExternalLink, MoreHorizontal,  } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog"
import { useState } from "react"
import { Calendar } from "../ui/calendar"
import { OrderedPart } from "@/types"
import MachineInfo from "./MachineInfo"
import RelevantDatesInfo from "./RelevantDatesInfo"
import { CostingInfo } from "./CostingInfo"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import toast from "react-hot-toast"
import { deleteOrderedPartByID, updateApprovedBudgetByID, updateApprovedOfficeOrderByID, updateApprovedPendingOrderByID, updateCostingByID, updatePurchasedDateByID, updateReceivedByFactoryDateByID, updateSampleReceivedByID, updateSentDateByID } from "@/services/OrderedPartsService"
import { showBudgetApproveButton, showPendingOrderApproveButton, showOfficeOrderApproveButton, showOfficeOrderDenyButton, showPurchaseButton, showQuotationButton, showReceivedButton, showSampleReceivedButton, showSentButton } from "@/services/ButtonVisibilityHelper"

interface OrderedPartRowProp{
    mode: 'view' | 'manage',
    orderedPartInfo: OrderedPart,
    current_status: string,
    onOrderedPartUpdate: () => void
}

export const OrderedPartRow:React.FC<OrderedPartRowProp> = ({mode, orderedPartInfo, current_status, onOrderedPartUpdate}) => {
  const [datePurchased, setDatePurchased] = useState<Date | undefined>(new Date())
  const [dateSent, setDateSent] = useState<Date | undefined>(new Date())
  const [dateReceived, setDateReceived] = useState<Date | undefined>(new Date())
  const [isPurchasedDialogOpen, setIsPurchasedDialogOpen] = useState(false);
  const [isSentDialogOpen, setIsSentDialogOpen] = useState(false);
  const [isReceivedDialogOpen, setIsReceivedDialogOpen] = useState(false);
  const [isCostingDialogOpent,setIsCostingDialogOpen] = useState(false);
  const [vendor, setVendor] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [costLoading, setCostLoading] = useState(false);
  
  const handleApproveFactory = () => {
    console.log("Factory Approve action triggered");
    const approvePartFromFactory = async() => {
      try {
        await updateApprovedPendingOrderByID(orderedPartInfo.id,true)
        toast.success("Ordered part has been approved!");
        onOrderedPartUpdate();
      } catch (error) {
        toast.error("Error occured could not complete action");
      }
    };
    approvePartFromFactory();
  }

  const handleApproveOffice = () => {
    console.log("Office Approve action triggered");
    const approvePartFromOffice = async() => {
      try {
        await updateApprovedOfficeOrderByID(orderedPartInfo.id,true)
        toast.success("Ordered part has been approved!");
        onOrderedPartUpdate();
      } catch (error) {
        toast.error("Error occured could not complete action");
      }
    };
    approvePartFromOffice();
  };

  const handleApproveBudget = () => {
    console.log("Approve Budget action triggered");
    const approveBudget = async() => {
      try {
        await updateApprovedBudgetByID(orderedPartInfo.id, true);
        toast.success("The budget for this part has been approved!");
        onOrderedPartUpdate();
      } catch (error) {
        toast.error("Error occured could not complete action");
      }
    };
    approveBudget();
  };

  const handleDeny = () => {
    console.log("Deny action triggered");
    const deletingPart = async() => {
      try {
        await deleteOrderedPartByID(orderedPartInfo.id)
        toast.success("Successfully removed this part from the order");
        onOrderedPartUpdate();
      } catch (error) {
        toast.error("Error occured could not complete action");
      }
    };
    deletingPart();
  };

  const handleUpdateCosting = () => {
    const updateCosting = async(c:number,v: string) => {
      try {
        setCostLoading(true);
        await updateCostingByID(orderedPartInfo.id, c, v )
        toast.success("Costing for this part is submitted")
        onOrderedPartUpdate();
      } catch (error) {
        toast.error("Error occured could not complete action");
      }
      finally {
        setCostLoading(false);
      }
    }

    if (!vendor || !unitCost) {
      toast.error('Please fill in both Vendor and Cost/Unit fields.');
      return;
    }
    
    const numericUnitCost = parseFloat(unitCost);
    if (isNaN(numericUnitCost) || numericUnitCost < 0) {
      toast.error('Cost/Unit cannot be negative or invalid.');
      return;
    }
    
    updateCosting(numericUnitCost,vendor)
    setVendor('');
    setUnitCost('');
    setIsCostingDialogOpen(false);
  };

  const handleUpdatePurchaseDate = () => {
    console.log("Updating purchase date" + datePurchased);
    const updatePurchaseDate = async() => {
      if (datePurchased){
        try {
          await updatePurchasedDateByID(orderedPartInfo.id, datePurchased)
          toast.success("Part purchased date set!")
          onOrderedPartUpdate();
        } catch (error) {
          toast.error("Error occured could not complete action");
        }
      }
      else{
        toast.error("Part purchase date was not found")
      }
    };

    updatePurchaseDate();
    setIsPurchasedDialogOpen(false);
  }

  const handleUpdateSentDate = () => {
    console.log("Updating sent date with" + dateSent);
    const updateSentDate = async() => {
      if(dateSent){
        try {
          await updateSentDateByID(orderedPartInfo.id, dateSent)
          toast.success("Part sent to office date set!")
          onOrderedPartUpdate();
        } catch (error) {
          toast.error("Error occured could not complete action");
        } 
      }
      else{
        toast.error("Sent date was not found")
      } 

    }

    updateSentDate();
    setIsSentDialogOpen(false);
  }

  const handleUpdateReceivedDate = () => {
    console.log("Updating received date" + dateReceived);
    const updateReceivedDate = async() => {
      if(dateReceived){
        try {
          await updateReceivedByFactoryDateByID(orderedPartInfo.id, dateReceived)
          toast.success("Part received by factory date set!")
          onOrderedPartUpdate();
        } catch (error) {
          toast.error("Error occured could not complete action");
        } 
      }
      else{
        toast.error("Received date was not found")
      }
    }
    updateReceivedDate();
    setIsReceivedDialogOpen(false);
  }

  const handleSampleReceived = () => {
    console.log("Sample received")
    const updateSampleReceived = async () => {
      try {
        await updateSampleReceivedByID(orderedPartInfo.id, true);
        toast.success("Updated sample received status")
        onOrderedPartUpdate();
      } catch (error) {
        toast.error("Error occured could not complete action");
      }
    };
    updateSampleReceived();
  }

  if(mode==='view'){
    return (
      <TableRow>
      <TableCell className="font-medium">
        {orderedPartInfo.parts.name}
      </TableCell>
      <TableCell>
        {orderedPartInfo.qty}
      </TableCell>
      <TableCell>
        <Dialog>
          <DialogTrigger asChild>
            <Calculator className="hover:cursor-pointer"/>
          </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                  <CostingInfo
                    vendor={orderedPartInfo.vendor}
                    price={orderedPartInfo.unit_cost}
                  />
              </DialogContent>
        </Dialog>
      </TableCell>
      <TableCell>
        <Dialog>
        <DialogTrigger asChild>
          <ExternalLink className="hover:cursor-pointer"/>
        </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <MachineInfo
                      factory_name={orderedPartInfo.factories.name}
                      section_name={orderedPartInfo.factory_sections.name} 
                      machine_number={orderedPartInfo.machines.number} 
                      machine_type={orderedPartInfo.machines.type}
                      machine_is_running={orderedPartInfo.machines.is_running}
                />
            </DialogContent>
        </Dialog>
      </TableCell>
      <TableCell>
          <Dialog>
            <DialogTrigger asChild>
              <CalendarArrowUp className="hover:cursor-pointer"/>
            </DialogTrigger>
                <DialogContent className="">
                  <RelevantDatesInfo 
                  part_purchased_date={orderedPartInfo.part_purchased_date} 
                  part_received_by_factory_date={orderedPartInfo.part_received_by_factory_date} 
                  part_sent_by_office_date={orderedPartInfo.part_sent_by_office_date}                    
                  />
            </DialogContent>
          </Dialog>
      </TableCell>
    </TableRow>
    )
  }
  else if(mode==="manage"){
    return(
        <TableRow>
          <TableCell className="font-medium">
            {orderedPartInfo.parts.name}
          </TableCell>
          <TableCell>
            {orderedPartInfo.qty}
          </TableCell>
          <TableCell>
            <Dialog>
              <DialogTrigger asChild>
                <Calculator className="hover:cursor-pointer"/>
              </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                      <CostingInfo
                        vendor={orderedPartInfo.vendor}
                        price={orderedPartInfo.unit_cost}
                      />
                  </DialogContent>
            </Dialog>
          </TableCell>
          <TableCell>
            <Dialog>
            <DialogTrigger asChild>
              <ExternalLink className="hover:cursor-pointer"/>
            </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <MachineInfo
                          factory_name={orderedPartInfo.factories.name}
                          section_name={orderedPartInfo.factory_sections.name} 
                          machine_number={orderedPartInfo.machines.number} 
                          machine_type={orderedPartInfo.machines.type}
                          machine_is_running={orderedPartInfo.machines.is_running}
                    />
                </DialogContent>
            </Dialog>
          </TableCell>
          <TableCell>
            <Dialog>
              <DialogTrigger asChild>
                <CalendarArrowUp className="hover:cursor-pointer"/>
              </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <RelevantDatesInfo 
                    part_purchased_date={orderedPartInfo.part_purchased_date} 
                    part_received_by_factory_date={orderedPartInfo.part_received_by_factory_date} 
                    part_sent_by_office_date={orderedPartInfo.part_sent_by_office_date}                    
                    />
                  </DialogContent>
            </Dialog>
          </TableCell>
          <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-haspopup="true"
                size="icon"
                variant="ghost"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                { 
                  showOfficeOrderApproveButton(current_status, orderedPartInfo.approved_office_order) && (
                  <DropdownMenuItem onClick={handleApproveOffice}>
                    Approve from office
                  </DropdownMenuItem>
                )}
                { 
                  showPendingOrderApproveButton(current_status, orderedPartInfo.approved_pending_order) && (
                  <DropdownMenuItem onClick={handleApproveFactory}>
                    Approve from factory
                  </DropdownMenuItem>
                )}
                { 
                  showBudgetApproveButton(current_status, orderedPartInfo.approved_budget) && (
                  <DropdownMenuItem onClick={handleApproveBudget}>
                    Approve Budget
                  </DropdownMenuItem>
                )}
                {
                  showOfficeOrderDenyButton(current_status) && (                
                  <DropdownMenuItem onClick={handleDeny}>
                    Deny
                  </DropdownMenuItem>
                )}
                {
                  showQuotationButton(current_status,orderedPartInfo.vendor,orderedPartInfo.unit_cost) && (                
                  <Dialog open={isCostingDialogOpent} onOpenChange={setIsCostingDialogOpen} >
                    <DialogTrigger asChild>
                      <div 
                      className="pl-2 pt-1 hover:bg-slate-100"
                      onClick={()=>setIsCostingDialogOpen(true)}
                      >
                        Costing
                      </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogTitle>
                          Update Costing
                        </DialogTitle>
                        <fieldset className="grid gap-6 rounded-lg border p-4">
                          <div className="grid gap-3">
                            <Label htmlFor="vendor">Vendor</Label>
                            <Input 
                              id="vendor" 
                              type="text" 
                              value={vendor}
                              placeholder="Enter vendor name"
                              onChange={(e) => setVendor(e.target.value)}
                            />
                          </div>
                          <div className="grid gap-3">
                            <Label htmlFor="unit_cost">Cost/Unit</Label>
                            <Input 
                              id="unit_cost" 
                              type="number" 
                              placeholder="Enter the unit cost" 
                              onChange={(e) => setUnitCost(e.target.value)}
                              />
                        </div>
                        </fieldset>
                        <Button onClick={handleUpdateCosting} disabled={costLoading}>
                          {costLoading ? "Updating..." : "Confirm"}
                        </Button>
                    </DialogContent>
                  </Dialog>
                )}

                {
                  showPurchaseButton(current_status,orderedPartInfo.part_purchased_date) && (
                    <Dialog open={isPurchasedDialogOpen} onOpenChange={setIsPurchasedDialogOpen}>
                    <DialogTrigger asChild>
                      <div 
                      className="pl-2 pt-1 hover:bg-slate-100" 
                      onClick={()=>setIsPurchasedDialogOpen(true)}>
                        Part Purchased
                      </div>
                    </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogTitle>
                              Date when part was purchased
                            </DialogTitle>
                            <Calendar
                              mode="single"
                              selected={datePurchased}
                              onSelect={setDatePurchased}
                              className="rounded-md border"
                            />
                            <Button onClick={handleUpdatePurchaseDate}>Confirm</Button>
                        </DialogContent>
                    </Dialog>
                )}
                {
                  showSentButton(current_status, orderedPartInfo.part_sent_by_office_date) && (
                    <Dialog open={isSentDialogOpen} onOpenChange={setIsSentDialogOpen}>
                      <DialogTrigger asChild>
                        <div 
                        className="pl-2 pt-1 hover:bg-slate-100"
                        onClick={()=> setIsSentDialogOpen(true)}>
                          Part Sent
                        </div>
      
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                          <DialogTitle>
                            Date when part was sent to factory
                          </DialogTitle>
                          <Calendar
                            mode="single"
                            selected={dateSent}
                            onSelect={setDateSent}
                            className="rounded-md border"
                          />
                          <Button onClick={handleUpdateSentDate}>Confirm</Button>
                      </DialogContent>
                    </Dialog>
                )}
                {
                  showReceivedButton(current_status, orderedPartInfo.part_received_by_factory_date) && (
                  <Dialog open={isReceivedDialogOpen} onOpenChange={setIsReceivedDialogOpen}>
                    <DialogTrigger asChild>
                      <div
                        className="pl-2 pt-1 hover:bg-slate-100"
                        onClick={() => setIsReceivedDialogOpen(true)}
                      >
                        Part Received
                      </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogTitle>Date when part was received at Factory</DialogTitle>
                      <Calendar
                        mode="single"
                        selected={dateReceived}
                        onSelect={setDateReceived}
                        className="rounded-md border"
                      />
                      <Button onClick={handleUpdateReceivedDate}>Confirm</Button>
                    </DialogContent>
                  </Dialog>
                )}
                {
                  showSampleReceivedButton(orderedPartInfo.is_sample_sent_to_office,orderedPartInfo.is_sample_received_by_office) && (
                  <DropdownMenuItem onClick={handleSampleReceived}>
                    Sample Received
                  </DropdownMenuItem>
                )}

            </DropdownMenuContent>
          </DropdownMenu>
          </TableCell>
        </TableRow>

    )
  }  
}
export default OrderedPartRow