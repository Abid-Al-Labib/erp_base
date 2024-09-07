import { OrderedPart, Status } from "@/types";
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
import { UpdateStatusByID } from "@/services/OrdersService";
import { InsertStatusTracker } from "@/services/StatusTrackerService";
import { useNavigate } from 'react-router-dom';
import { showBudgetApproveButton, showOfficeOrderApproveButton, showPendingOrderApproveButton } from "@/services/ButtonVisibilityHelper";


interface OrderedPartsTableProp {
  mode:  "view" | "manage"
  order_id: number
  current_status: Status
}


const OrderedPartsTable:React.FC<OrderedPartsTableProp> = ({mode, order_id, current_status}) => {
  const [orderedParts, setOrderedParts] = useState<OrderedPart[]>([]);
  const [loadingTable, setLoadingTable] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [loadingApproval, setLoadingApproval] =useState(false)
  const navigate = useNavigate()
  
  const handleApproveAllPendingOrder = async () => {
    setLoadingApproval(true)
    try {
      const updatePromises = orderedParts.map((ordered_part) => {
        return updateApprovedPendingOrderByID(ordered_part.id, true);
      });
      await Promise.all(updatePromises);
      toast.success("Approved all parts in the pending order")
      await refreshPartsTable()
    } catch (error) {
      toast.error("Failed to bulk approve")
    } finally {
      setLoadingApproval(false)
    }
  }
  
  const handleApproveAllOfficeOrder = async () => {
    setLoadingApproval(true)
    try {
      const updatePromises = orderedParts.map((ordered_part) => {
        return updateApprovedOfficeOrderByID(ordered_part.id, true);
      });
      await Promise.all(updatePromises);
      toast.success("Approved all ordered items from office")
      await refreshPartsTable()
    } catch (error) {
      toast.error("Failed to bulk approve")
    } finally {
      setLoadingApproval(false)
    }
  }
  
  const handleApproveAllBudgets = async () => {
    setLoadingApproval(true)
    try {
      const updatePromises = orderedParts.map((ordered_part) => {
        return updateApprovedBudgetByID(ordered_part.id, true);
      });
      await Promise.all(updatePromises);
      toast.success("Approved budgets for all parts")
      await refreshPartsTable()
    } catch (error) {
      toast.error("Failed to bulk approve")
    } finally {
      setLoadingApproval(false)
    }
  }
  
  const refreshPartsTable = async () => {
    try {
        const updatedOrderedPartsList = await fetchOrderedPartsByOrderID(order_id)
        if (updatedOrderedPartsList) {
          setOrderedParts(updatedOrderedPartsList)
          if(mode==="manage")
          {
            const statusChange = isChangeStatusAllowed(updatedOrderedPartsList,current_status.name)
            if (statusChange){
              console.log("changing status")
              try {
                const next_status_id = (current_status.id+1) 
                await UpdateStatusByID(order_id,next_status_id)
                await InsertStatusTracker((new Date()), order_id, 1, next_status_id)
              } catch (error) {
                toast.error("Error updating status")
              }
              setShowPopup(true);
              setTimeout(() => {
                handleNavigation()
              }, 5000);
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
            <TableHead>Part name</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Costing</TableHead>
            <TableHead>Machine Info</TableHead>
            <TableHead>Relevant Dates</TableHead>
            <TableHead>
            <span className="sr-only">Actions</span>
            </TableHead>
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
                current_status={current_status.name}  
                onOrderedPartUpdate={refreshPartsTable} 
                />
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
            <Button disabled={loadingApproval} onClick={handleApproveAllPendingOrder}>{loadingApproval? "Approving...": "Approve all pending parts"}</Button>
          )}
          {showOfficeOrderApproveButton(current_status.name,false) && (
            <Button disabled={loadingApproval} onClick={handleApproveAllOfficeOrder}>{loadingApproval? "Approving...": "Approve all parts"}</Button>
          )}
          {showBudgetApproveButton(current_status.name,false) && (
            <Button disabled={loadingApproval} onClick={handleApproveAllBudgets}>{loadingApproval? "Approving...": "Approve all budgets"}</Button>
          )}
        </div>
        <Table>
        <TableHeader>
        <TableRow>
          <TableHead>Part name</TableHead>
          <TableHead>Qty</TableHead>
          <TableHead>Costing</TableHead>
          <TableHead>Machine Info</TableHead>
          <TableHead>Relevant Dates</TableHead>
          <TableHead>Actions</TableHead>
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
                current_status={current_status.name}
                onOrderedPartUpdate={refreshPartsTable}   
                />
            ))}
            </TableBody>
        }  
      </Table>
      </CardContent>
      }
      <Dialog open={showPopup} onOpenChange={handleNavigation}>
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
      </Card>
    )
  }
  
}

export default OrderedPartsTable