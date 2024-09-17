import React from 'react';
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

interface OrdersTableRowProps {
  order: Order
  onDeleteRefresh: ()=>void;
}

const OrdersTableRow: React.FC<OrdersTableRowProps> = ({ order, onDeleteRefresh }) => {
  const handleDeleteOrder = async () => {
    try {
        await deleteOrderByID(order.id)
        onDeleteRefresh()
        toast.success("Order successfully deleted")
    } catch (error) {
        toast.error("Failed to delete");
        
    }
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
            <DropdownMenuItem onClick={handleDeleteOrder}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default OrdersTableRow;
