import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { TableCell, TableRow } from "../ui/table"
import { Button } from "../ui/button"
import { ExternalLink, MoreHorizontal, Notebook, NotebookPen,  } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog"
import { useEffect, useState } from "react"
import { Calendar } from "../ui/calendar"
import { OrderedPart } from "@/types"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import toast from "react-hot-toast"
import { deleteOrderedPartByID, fetchLastCostAndPurchaseDate, updateApprovedBudgetByID, updateApprovedOfficeOrderByID, updateApprovedPendingOrderByID, updateCostingByID, updatePurchasedDateByID, updateReceivedByFactoryDateByID, updateSampleReceivedByID, updateSentDateByID } from "@/services/OrderedPartsService"
import { showBudgetApproveButton, showPendingOrderApproveButton, showOfficeOrderApproveButton, showOfficeOrderDenyButton, showPurchaseButton, showQuotationButton, showReceivedButton, showSampleReceivedButton, showSentButton } from "@/services/ButtonVisibilityHelper"
import OrderedPartInfo from "./OrderedPartInfo"
import { convertUtcToBDTime } from "@/services/helper"

interface OrderedPartRowProp{
    mode: 'view' | 'manage',
    orderedPartInfo: OrderedPart,
    current_status: string,
    machine_id: number,
    onOrderedPartUpdate: () => void
}

export const OrderedPartRow:React.FC<OrderedPartRowProp> = ({mode, orderedPartInfo, current_status, machine_id, onOrderedPartUpdate}) => {
  const [datePurchased, setDatePurchased] = useState<Date | undefined>(new Date())
  const [dateSent, setDateSent] = useState<Date | undefined>(new Date())
  const [dateReceived, setDateReceived] = useState<Date | undefined>(new Date())
  const [isPurchasedDialogOpen, setIsPurchasedDialogOpen] = useState(false);
  const [isSentDialogOpen, setIsSentDialogOpen] = useState(false);
  const [isReceivedDialogOpen, setIsReceivedDialogOpen] = useState(false);
  const [isCostingDialogOpent,setIsCostingDialogOpen] = useState(false);
  const [vendor, setVendor] = useState('');
  const [brand, setBrand] = useState('')
  const [unitCost, setUnitCost] = useState('');
  const [costLoading, setCostLoading] = useState(false);
  const [lastUnitCost, setLastUnitCost] = useState<number | null>(null);
  const [lastPurchaseDate, setLastPurchaseDate] = useState<string | null>(null); // assuming date is string

  // useEffect to fetch most recent cost and purchase date
  useEffect(() => {
      const fetchData = async () => {
          if (mode=="manage")
          {
            const result = await fetchLastCostAndPurchaseDate(machine_id, orderedPartInfo.part_id);
            if (result) {
              setLastUnitCost(result.unit_cost);
              setLastPurchaseDate(result.part_purchase_date);
            }
          }
      };

      fetchData(); // Trigger the fetch when component mounts or dependencies change
  }, [machine_id, orderedPartInfo.part_id]);

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
    const updateCosting = async(brand:string, cost:number, vendor: string) => {
      try {
        setCostLoading(true);
        await updateCostingByID(orderedPartInfo.id, brand, cost, vendor )
        toast.success("Costing for this part is submitted")
        onOrderedPartUpdate();
      } catch (error) {
        toast.error("Error occured could not complete action");
      }
      finally {
        setCostLoading(false);
      }
    }

    if (!vendor || !unitCost || !brand) {
      toast.error('Please fill in all information');
      return;
    }
    
    const numericUnitCost = parseFloat(unitCost);
    if (isNaN(numericUnitCost) || numericUnitCost < 0) {
      toast.error('Cost/Unit cannot be negative or invalid.');
      return;
    }
    
    updateCosting(brand,numericUnitCost,vendor)
    setBrand('')
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
      if(dateSent && datePurchased){
        if (dateSent.getDate()>=datePurchased.getDate()){
          try {
            await updateSentDateByID(orderedPartInfo.id, dateSent)
            toast.success("Part sent to office date set!")
            onOrderedPartUpdate();
          } catch (error) {
            toast.error("Error occured could not complete action");
          } 
        }
        else{
          toast.error("Date sent must be after date purchased")
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
      if(dateReceived && dateSent){
        if (dateReceived.getDate()>=dateSent.getDate()){
          try {
            await updateReceivedByFactoryDateByID(orderedPartInfo.id, dateReceived)
            toast.success("Part received by factory date set!")
            onOrderedPartUpdate();
          } catch (error) {
            toast.error("Error occured could not complete action");
          } 
        }
        else{
          toast.error("Received date must be after sent date")
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
        <TableCell className="whitespace-nowrap">{orderedPartInfo.parts.name}</TableCell>
        <TableCell className="whitespace-nowrap hidden md:table-cell">{orderedPartInfo.qty}</TableCell>
        <TableCell className="whitespace-nowrap hidden md:table-cell">{orderedPartInfo.brand || '-'}</TableCell>
        <TableCell className="whitespace-nowrap hidden md:table-cell">{orderedPartInfo.vendor || '-'}</TableCell>
        <TableCell className="whitespace-nowrap hidden md:table-cell">{orderedPartInfo.unit_cost || '-'}</TableCell>
        <TableCell className="hidden md:table-cell">
          {
            orderedPartInfo.note?
            (
              <Dialog>
                <DialogTrigger asChild>
                  <Notebook className="hover:cursor-pointer"/>
                </DialogTrigger>
                  <DialogContent>
                    <div>{orderedPartInfo.note}</div>    
                  </DialogContent>
              </Dialog>
            ) : '-'
          }
        </TableCell>
        <TableCell className="hidden md:table-cell">
          {
            orderedPartInfo.office_note?
            ( <Dialog>
                <DialogTrigger asChild>
                  <NotebookPen className="hover:cursor-pointer"/>
                </DialogTrigger>
                  <DialogContent>
                    <div>
                      {orderedPartInfo.office_note}
                    </div>
                  </DialogContent>
              </Dialog>
            ) : '-'
          }
        </TableCell>
        <TableCell className="whitespace-nowrap hidden md:table-cell">{orderedPartInfo.part_purchased_date? convertUtcToBDTime(orderedPartInfo.part_purchased_date) : '-'}</TableCell>
        <TableCell className="whitespace-nowrap hidden md:table-cell">{orderedPartInfo.part_sent_by_office_date? convertUtcToBDTime(orderedPartInfo.part_sent_by_office_date) : '-'}</TableCell>
        <TableCell className="whitespace-nowrap hidden md:table-cell">{orderedPartInfo.part_received_by_factory_date? convertUtcToBDTime(orderedPartInfo.part_received_by_factory_date) : '-'}</TableCell>
        <TableCell className="whitespace-nowrap hidden md:table-cell">{orderedPartInfo.is_sample_sent_to_office? 'Yes': 'No'}</TableCell>
        <TableCell className="whitespace-nowrap hidden md:table-cell">{orderedPartInfo.is_sample_received_by_office? 'Yes': 'No'}</TableCell>

        <TableCell className="md:hidden">
            <Dialog>
              <DialogTrigger asChild>
                <ExternalLink className="hover:cursor-pointer"/>
              </DialogTrigger>
                <DialogContent className="">
                  <OrderedPartInfo 
                    orderedPart={orderedPartInfo}                
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
        <TableCell className="whitespace-nowrap">{orderedPartInfo.parts.name}</TableCell>
        <TableCell className="whitespace-nowrap hidden md:table-cell">{`BDT ${lastUnitCost}` || '-'}</TableCell>
        <TableCell className="whitespace-nowrap hidden md:table-cell">{lastPurchaseDate? convertUtcToBDTime(lastPurchaseDate): '-'}</TableCell>
        <TableCell className="whitespace-nowrap hidden md:table-cell">{orderedPartInfo.qty}</TableCell>
        <TableCell className="whitespace-nowrap hidden md:table-cell">{orderedPartInfo.brand || '-'}</TableCell>
        <TableCell className="whitespace-nowrap hidden md:table-cell">{orderedPartInfo.vendor || '-'}</TableCell>
        <TableCell className="whitespace-nowrap hidden md:table-cell">{orderedPartInfo.unit_cost || '-'}</TableCell>
        <TableCell className="hidden md:table-cell">
          {
            orderedPartInfo.note?
            (
              <Dialog>
                <DialogTrigger asChild>
                  <Notebook className="hover:cursor-pointer"/>
                </DialogTrigger>
                  <DialogContent>
                    <div>{orderedPartInfo.note}</div>    
                  </DialogContent>
              </Dialog>
            ) : '-'
          }
        </TableCell>
        <TableCell className="hidden md:table-cell">
          {
            orderedPartInfo.office_note?
            ( <Dialog>
                <DialogTrigger asChild>
                  <NotebookPen className="hover:cursor-pointer"/>
                </DialogTrigger>
                  <DialogContent>
                    <div>
                      {orderedPartInfo.office_note}
                    </div>
                  </DialogContent>
              </Dialog>
            ) : '-'
          }
        </TableCell>
        <TableCell className="whitespace-nowrap hidden md:table-cell">{orderedPartInfo.part_purchased_date? convertUtcToBDTime(orderedPartInfo.part_purchased_date) : '-'}</TableCell>
        <TableCell className="whitespace-nowrap hidden md:table-cell">{orderedPartInfo.part_sent_by_office_date? convertUtcToBDTime(orderedPartInfo.part_sent_by_office_date) : '-'}</TableCell>
        <TableCell className="whitespace-nowrap hidden md:table-cell">{orderedPartInfo.part_received_by_factory_date? convertUtcToBDTime(orderedPartInfo.part_received_by_factory_date) : '-'}</TableCell>
        <TableCell className="whitespace-nowrap hidden md:table-cell">{orderedPartInfo.is_sample_sent_to_office? 'Yes': 'No'}</TableCell>
        <TableCell className="whitespace-nowrap hidden md:table-cell">{orderedPartInfo.is_sample_received_by_office? 'Yes': 'No'}</TableCell>
        <TableCell className="md:hidden">
            <Dialog>
              <DialogTrigger asChild>
                <ExternalLink className="hover:cursor-pointer"/>
              </DialogTrigger>
                <DialogContent className="">
                  <OrderedPartInfo 
                    orderedPart={orderedPartInfo}                
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
                            <Label htmlFor="brand">Brand</Label>
                            <Input 
                              id="brand" 
                              type="text" 
                              value={brand}
                              placeholder="Enter brand name"
                              onChange={(e) => setBrand(e.target.value.trim())}
                            />
                          </div>
                          <div className="grid gap-3">
                            <Label htmlFor="vendor">Vendor</Label>
                            <Input 
                              id="vendor" 
                              type="text" 
                              value={vendor}
                              placeholder="Enter vendor name"
                              onChange={(e) => setVendor(e.target.value.trim())}
                            />
                          </div>
                          <div className="grid gap-3">
                            <Label htmlFor="unit_cost">Cost/Unit</Label>
                            <Input 
                              id="unit_cost" 
                              type="number" 
                              placeholder="Enter the unit cost" 
                              onChange={(e) => setUnitCost(e.target.value.trim())}
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