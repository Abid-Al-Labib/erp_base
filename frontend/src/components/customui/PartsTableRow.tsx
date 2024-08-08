import React from 'react';
import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { TableCell, TableRow } from "../ui/table";

interface PartsTableRowProps {
  id: string;
  name: string;
  unit_cost: string;
  unit: string;
  vendor: string;
  created_at: string;
}

const PartsTableRow: React.FC<PartsTableRowProps> = ({ id, name, unit_cost, unit, vendor, created_at }) => {
  return (
    <TableRow>
      <TableCell className="font-medium">
        {id}
      </TableCell>
      <TableCell>
        {name}
      </TableCell>
      <TableCell>
        {unit_cost}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {unit}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {vendor}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {created_at}
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
            <DropdownMenuItem>View</DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default PartsTableRow;
