import React from 'react';
import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { TableCell, TableRow } from "../ui/table";
import { Link } from 'react-router-dom';
import { Badge } from '../ui/badge';
import { deleteStatusByID } from '@/services/OrdersService';
import toast from 'react-hot-toast';

interface OrdersTableRowProps {
  id: number;
  created_at: string;
  created_by_name: string;
  department_name: string;
  current_status: string;
  onDeleteRefresh: ()=>void;
}

const OrdersTableRow: React.FC<OrdersTableRowProps> = ({ id, created_at, created_by_name, department_name, current_status, onDeleteRefresh }) => {
  const handleDeleteOrder = async () => {
    try {
        await deleteStatusByID(id)
        onDeleteRefresh()
        toast.success("Order successfully deleted")
    } catch (error) {
        toast.error("Failed to delete");
        
    }
  }
  
  return (
    <TableRow>
      <TableCell className="font-medium">
        {id}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {created_at}
      </TableCell>
      <TableCell>
        {created_by_name}
      </TableCell>
      <TableCell>
        {department_name}
      </TableCell>
      <TableCell>
      <Badge
        className={current_status === "Parts Received" ? "bg-green-100": current_status === "Pending" ? "bg-red-100": "bg-orange-100"}
        variant="secondary"
      >
        {current_status}
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
            <Link to={`/vieworder/${id}`}>
              <DropdownMenuItem>
                View
              </DropdownMenuItem>
            </Link>
            <Link to={`/manageorder/${id}`}>
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
