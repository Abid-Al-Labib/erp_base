import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { TableCell, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";
import { ExternalLink, MoreHorizontal } from "lucide-react";
import { OrderedPart } from "@/types";
import { convertUtcToBDTime } from "@/services/helper";
import OrderedPartInfo from "./OrderedPartInfo";


interface LinkedOrdersRowProps {
  linkedOrderPart: OrderedPart
}

const LinkedOrdersRow:React.FC<LinkedOrdersRowProps> = ({linkedOrderPart}) => {
  return (
    <TableRow>
      <TableCell className="font-medium">
        {linkedOrderPart.order_id}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {convertUtcToBDTime(linkedOrderPart.orders.created_at)}
      </TableCell>
      <TableCell>
        {linkedOrderPart.factories.abbreviation} - {linkedOrderPart.factory_sections.name} - {linkedOrderPart.machines.number}
      </TableCell>
      <TableCell className="hidden md:table-cell">{linkedOrderPart.qty}</TableCell>
      <TableCell className="hidden md:table-cell">{linkedOrderPart.unit_cost? `BDT ${(linkedOrderPart.unit_cost)}`: '-'}</TableCell>
      <TableCell className="hidden md:table-cell">{linkedOrderPart.vendor? (linkedOrderPart.vendor): '-'}</TableCell>
      <TableCell className="hidden md:table-cell">{linkedOrderPart.part_purchased_date? convertUtcToBDTime(linkedOrderPart.part_purchased_date) : '-'}</TableCell>
      <TableCell className="hidden md:table-cell">{linkedOrderPart.part_sent_by_office_date? convertUtcToBDTime(linkedOrderPart.part_sent_by_office_date) : '-'}</TableCell>
      <TableCell className="hidden md:table-cell">{linkedOrderPart.part_received_by_factory_date? convertUtcToBDTime(linkedOrderPart.part_received_by_factory_date) : '-'}</TableCell>
      <TableCell className="md:hidden">
        <Dialog>
        <DialogTrigger asChild>
          <ExternalLink className="hover:cursor-pointer"/>
        </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogTitle>
                  Ordered Part Info
                </DialogTitle>
                <OrderedPartInfo
                  linkedOrderPart={linkedOrderPart}
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
            <Link to={`/vieworder/${linkedOrderPart.order_id}`}>
              <DropdownMenuItem>
                View Full Order
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default LinkedOrdersRow