import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { TableCell, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";
import { ExternalLink, MoreHorizontal } from "lucide-react";
import { Part } from "@/types";
import { convertUtcToBDTime } from "@/services/helper";
import OrderedPartInfo from "./OrderedPartInfo";


interface LinkedOrdersRowProps {
  order_id: number,
  order_creation_date: string
  part_info: Part
}

const LinkedOrdersRow:React.FC<LinkedOrdersRowProps> = ({order_id,order_creation_date,part_info}) => {
  return (
    <TableRow>
      <TableCell className="font-medium">
        {order_id}
      </TableCell>
      <TableCell>
        {convertUtcToBDTime(order_creation_date)}
      </TableCell>
      <TableCell>
        <Dialog>
        <DialogTrigger asChild>
          <ExternalLink className="hover:cursor-pointer"/>
        </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogTitle>
                  Additional info
                </DialogTitle>
                <OrderedPartInfo
                  part_id={part_info.id}
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
            <Link to={`/vieworder/${order_id}`}>
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