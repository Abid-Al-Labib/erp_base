import React, { useState } from 'react';
import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { TableCell, TableRow } from "../ui/table";
import { Link } from 'react-router-dom';
import { Badge } from '../ui/badge';
import { deleteOrderByID } from '@/services/OrdersService';
import toast from 'react-hot-toast';
import { Order } from '@/types';
import { convertUtcToBDTime } from '@/services/helper';
import { Dialog, DialogTitle, DialogContent } from '../ui/dialog';


interface OrdersTableRowProps {
  order: Order
  onDeleteRefresh: ()=>void;
}

const OrdersTableRow: React.FC<OrdersTableRowProps> = ({ order, onDeleteRefresh }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false) 
  const handleDeleteOrder = async () => {
    try {
        await deleteOrderByID(order.id)
        onDeleteRefresh()
        toast.success("Order successfully deleted")
    } catch (error) {
        toast.error("Failed to delete");
        
    }
    setIsDeleteDialogOpen(false)
  }
  
  return (
    <TableRow>
      <TableCell className="font-medium">
        {order.id}
      </TableCell>
      <TableCell>
        {order.factory_sections?.name && order.machines?.number
          ? `${order.factories.abbreviation} - ${order.factory_sections?.name} - ${order.machines?.number}`
          : `${order.factories.abbreviation} - Storage`}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {convertUtcToBDTime(order.created_at)}
      </TableCell>
      <TableCell>
        {order.profiles.name}
      </TableCell>
      <TableCell>
        {order.departments.name}
      </TableCell>
      <TableCell>
      <Badge
        className={order.statuses.name === "Parts Received" ? "bg-green-100": order.statuses.name === "Pending" ? "bg-red-100": "bg-orange-100"}
        variant="secondary"
      >
        {order.statuses.name}
      </Badge>
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
            <Link to={`/vieworder/${order.id}`}>
              <DropdownMenuItem>
                View
              </DropdownMenuItem>
            </Link>
            <Link to={`/manageorder/${order.id}`}>
              <DropdownMenuItem>
                Manage
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem onClick={()=>setIsDeleteDialogOpen(true)}>
              <span className='hover:text-red-600'>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
                <DialogTitle className="text-red-600">Delete Part</DialogTitle>
                <div>
                  You are about to permanently delet this order.
                  <br />
                  Are you sure you want to delete this order?
                </div>
                <Button onClick={handleDeleteOrder}>Delete</Button>
        </DialogContent>
      </Dialog>
    </TableRow>

  );
};

export default OrdersTableRow;
