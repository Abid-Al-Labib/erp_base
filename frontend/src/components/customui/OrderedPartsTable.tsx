import { Order, OrderedPart, Status } from "@/types";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "../ui/table"
import { useEffect, useState } from "react";
import { fetchOrderedPartsByOrderID, updateApprovedBudgetByID, updateApprovedOfficeOrderByID, updateApprovedPendingOrderByID } from "@/services/OrderedPartsService";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import OrderedPartRow from "./OrderedPartRow";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { isChangeStatusAllowed } from "@/services/helper";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { deleteOrderByID, UpdateStatusByID } from "@/services/OrdersService";
import { InsertStatusTracker } from "@/services/StatusTrackerService";
import { useNavigate } from 'react-router-dom';
import { showBudgetApproveButton, showOfficeOrderApproveButton, showPendingOrderApproveButton } from "@/services/ButtonVisibilityHelper";


interface OrderedPartsTableProp {
  mode:  "view" | "manage"
  order: Order
  current_status: Status
}


const OrderedPartsTable:React.FC<OrderedPartsTableProp> = ({mode, order, current_status}) => {
  const [orderedParts, setOrderedParts] = useState<OrderedPart[]>([]);
  const [loadingTable, setLoadingTable] = useState(true);
  const [showActionsCompletedPopup, setShowActionsCompletedPopup] = useState(false);
  const [showEmptyOrderPopup, setShowEmptyOrderPopup] = useState(false);
  const [loadingApproval, setLoadingApproval] =useState(false)
  const [isApproveAllFactoryDialogOpen, setisApproveAllFactoryDialogOpen] = useState(false)
  const [isApproveAllOfficeDialogOpen, setisApproveAllOfficeDialogOpen] = useState(false)
  const [isApproveAllBudgetDialogOpen, setApproveAllBudgetDialogOpen] = useState(false)
  const navigate = useNavigate()
  
  const handleApproveAllPendingOrder = async () => {
    setLoadingApproval(true)
    try {
      const updatePromises = orderedParts.map((ordered_part) => {
        if (!(ordered_part.in_storage && ordered_part.approved_storage_withdrawal)){
          return updateApprovedPendingOrderByID(ordered_part.id, true);
        }
      });
      await Promise.all(updatePromises);
      toast.success("Approved all parts in the pending order")
      await refreshPartsTable()
    } catch (error) {
      toast.error("Failed to bulk approve")
    } finally {
      setLoadingApproval(false)
    }
    setisApproveAllFactoryDialogOpen(false)
  }
  
  const handleApproveAllOfficeOrder = async () => {
    setLoadingApproval(true)
    try {
      const updatePromises = orderedParts.map((ordered_part) => {
        if (!(ordered_part.in_storage && ordered_part.approved_storage_withdrawal)){
          return updateApprovedOfficeOrderByID(ordered_part.id, true);
        }
      });
      await Promise.all(updatePromises);
      toast.success("Approved all ordered items from office")
      await refreshPartsTable()
    } catch (error) {
      toast.error("Failed to bulk approve")
    } finally {
      setLoadingApproval(false)
    }
    setisApproveAllOfficeDialogOpen(false)
  }
  
  const handleApproveAllBudgets = async () => {
    setLoadingApproval(true)
    try {
      const updatePromises = orderedParts.map((ordered_part) => {
        if (!(ordered_part.in_storage && ordered_part.approved_storage_withdrawal)){
          return updateApprovedBudgetByID(ordered_part.id, true);
        }
      });
      await Promise.all(updatePromises);
      toast.success("Approved budgets for all parts")
      await refreshPartsTable()
    } catch (error) {
      toast.error("Failed to bulk approve")
    } finally {
      setLoadingApproval(false)
    }
    setApproveAllBudgetDialogOpen(false)
  }
  
  const refreshPartsTable = async () => {
    try {
        const order_id = order.id
        const updatedOrderedPartsList = await fetchOrderedPartsByOrderID(order_id)
        if (updatedOrderedPartsList) {
          setOrderedParts(updatedOrderedPartsList)
          if(mode==="manage")
          {
            if (updatedOrderedPartsList.length===0){
              setShowEmptyOrderPopup(true);
              await deleteOrderByID(order.id) 
            }
            else{
              const next_status_id = isChangeStatusAllowed(updatedOrderedPartsList,current_status.name)
              if (next_status_id && next_status_id!==-1 ){
                console.log("changing status")
                try { 
                  await UpdateStatusByID(order_id,next_status_id)
                  await InsertStatusTracker((new Date()), order_id, 1, next_status_id)
                } catch (error) {
                  toast.error("Error updating status")
                }
                setShowActionsCompletedPopup(true);
              }
            }
          }
        } else {
          toast.error('Ordred parts table could not fetch data');
        }
    } catch (error) {
      toast.error('Ordred parts table could not fetch data');
    } finally{
      setLoadingTable(false);
    } 
  }

  useEffect(()=>{
    refreshPartsTable()
    console.log(current_status)
  },[])

  const handleNavigation = () => {
    navigate('/orders'); 
  };

  if (mode==="view"){
    return(      
      <Card x-chunk="dashboard-06-chunk-0" className="mt-1">
      <CardHeader>
          <CardTitle>View Parts Ordered</CardTitle>
          <CardDescription>
          This is a list of parts that were ordered.
          </CardDescription>
      </CardHeader>
      {(loadingTable===true)? (
                  <div className='animate-spin flex flex-row justify-center p-5'>
                      <Loader2 />
                  </div>
        ):
      <CardContent>
        <Table>
        <TableHeader>
        <TableRow>
            <TableHead className="whitespace-nowrap">Part</TableHead>
            <TableHead className="whitespace-nowrap">In Storage</TableHead>
            <TableHead className="whitespace-nowrap">Take from storage</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">Qty</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">Brand</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">Vendor</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">Cost/Unit</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">Note</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">Office Note</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">Date Purchased</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">Date Sent To Factory</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">Date Received By Factory</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">Office Sample Sent/Received</TableHead>
            <TableHead className="md:hidden">Info</TableHead>
        </TableRow>
        </TableHeader>
        {loadingTable? (
            <div className='flex flex-row justify-center'>
                <Loader2 className='h-8 w-8 animate-spin'/>
            </div>
        ):
            <TableBody>
            {orderedParts.map(orderedPart => (                                        
                <OrderedPartRow key={orderedPart.id}
              mode="view"
              orderedPartInfo={orderedPart}
              current_status={current_status}
              onOrderedPartUpdate={refreshPartsTable} 
              factory_id={order.factory_id}
              machine_id={order.machine_id}
              order_type={order.order_type}/>
            ))}
            </TableBody>
        }  
      </Table>
      </CardContent>
    }
    </Card>
    )
  }
  else if (mode==="manage"){
    return(
      <Card x-chunk="dashboard-06-chunk-0" className="mt-5">
      <CardHeader>
          <CardTitle>Manage Parts Ordered</CardTitle>
          <CardDescription>
              This is a list of parts that were ordered, you can complete actions on each ordered part.
          </CardDescription>
      </CardHeader>
      {(loadingTable===true)? (
                  <div className='animate-spin flex flex-row justify-center p-5'>
                      <Loader2 />
                  </div>
        ):
        <CardContent>
        <div className="flex justify-end gap-2 mb-2">
          {showPendingOrderApproveButton(current_status.name,false) && (
            <Button disabled={loadingApproval} onClick={()=>setisApproveAllFactoryDialogOpen(true)}>{loadingApproval? "Approving...": "Approve all pending parts"}</Button>
          )}
          {showOfficeOrderApproveButton(current_status.name,false) && (
            <Button disabled={loadingApproval} onClick={()=>setisApproveAllOfficeDialogOpen(true)}>{loadingApproval? "Approving...": "Approve all parts"}</Button>
          )}
          {showBudgetApproveButton(current_status.name,false) && (
            <Button disabled={loadingApproval} onClick={()=>setApproveAllBudgetDialogOpen(true)}>{loadingApproval? "Approving...": "Approve all budgets"}</Button>
          )}
        </div>
        <Table>
        <TableHeader>
        <TableRow>
            <TableHead className="whitespace-nowrap">Part</TableHead>
            <TableHead className="whitespace-nowrap">In Storage</TableHead>
            <TableHead className="whitespace-nowrap">Take from storage</TableHead>
            <TableHead className="whitespace-nowrap">Last Cost/Unit</TableHead>
            <TableHead className="whitespace-nowrap">Last Purchase Date</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">Qty</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">Brand</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">Vendor</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">Cost/Unit</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">Note</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">Office Note</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">Date Purchased</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">Date Sent To Factory</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">Date Received By Factory</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">Office Sample Sent/Received</TableHead>
            <TableHead className="md:hidden">Info</TableHead>
        </TableRow>
        </TableHeader>
        {loadingTable? (
            <div className='flex flex-row justify-center'>
                <Loader2 className='h-8 w-8 animate-spin'/>
            </div>
        ):
            <TableBody>
            {orderedParts.map(orderedPart => (                                        
                <OrderedPartRow key={orderedPart.id}
              mode="manage"
              orderedPartInfo={orderedPart}
              current_status={current_status}
              onOrderedPartUpdate={refreshPartsTable} 
              factory_id={order.factory_id}
              machine_id={order.machine_id}
              order_type={order.order_type}/>
            ))}
            </TableBody>
        }  
      </Table>
      </CardContent>
      }
      <Dialog open={showActionsCompletedPopup} onOpenChange={handleNavigation}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-green-600">All action completed for current status</DialogTitle>
              <DialogDescription>
                <p>Order will be moved to next status.</p>
                <p>You will be moved back to orders page.</p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={handleNavigation}>OK</Button>
            </DialogFooter>
          </DialogContent>
      </Dialog>
      <Dialog open={showEmptyOrderPopup} onOpenChange={handleNavigation}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">This order has no parts ordered.</DialogTitle>
              <DialogDescription>
                <p>Order will be deleted.</p>
                <p>You will be moved back to orders page.</p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={handleNavigation}>OK</Button>
            </DialogFooter>
          </DialogContent>
      </Dialog>

      <Dialog open={isApproveAllFactoryDialogOpen} onOpenChange={setisApproveAllFactoryDialogOpen}>
        <DialogContent>
          <DialogTitle>
           Approve All
          </DialogTitle>
          <DialogDescription>
            <p className="text-sm text-muted-foreground">
              You are approving all the parts in this pending order. This cannot be undone and you will move to next status.
            </p>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to approve?
            </p>
          </DialogDescription>
          <Button onClick={handleApproveAllPendingOrder}>Approve</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isApproveAllOfficeDialogOpen} onOpenChange={setisApproveAllOfficeDialogOpen}>
        <DialogContent>
          <DialogTitle>
           Approve All
          </DialogTitle>
          <DialogDescription>
            <p className="text-sm text-muted-foreground">
              You are approving all the parts in this order. This cannot be undone and you will move to next status.
            </p>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to approve?
            </p>
          </DialogDescription>
          <Button onClick={handleApproveAllOfficeOrder}>Approve</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isApproveAllBudgetDialogOpen} onOpenChange={setApproveAllBudgetDialogOpen}>
        <DialogContent>
          <DialogTitle>
           Approve All 
          </DialogTitle>
          <DialogDescription>
            <p className="text-sm text-muted-foreground">
              You are approving budgets for all parts. Only approve if you are okay with the whole quotation. 
              This cannot be undone and you will be moved to the next status.
            </p>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to approve?
            </p>
          </DialogDescription>
          <Button onClick={handleApproveAllBudgets}>Approve</Button>
        </DialogContent>
      </Dialog>
      </Card>
      
    )
  }
  
}

export default OrderedPartsTable