import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { TableCell, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";
import { ExternalLink, MoreHorizontal } from "lucide-react";
import { Order, OrderedPart } from "@/types";
import { convertUtcToBDTime } from "@/services/helper";
import LinkedOrderedPartInfo from "./LinkedOrderedPartInfo";
import { useEffect, useState } from "react";
import { fetchOrderByID } from "@/services/OrdersService";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";


interface LinkedOrdersRowProps {
  linkedOrderPart: OrderedPart
}

const LinkedOrdersRow:React.FC<LinkedOrdersRowProps> = ({linkedOrderPart}) => {
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loadingOrder, setloadingOrder] = useState(true);
  const profile = useAuth().profile
  const loadOrder = async () => {

    const order_id = linkedOrderPart.order_id
    try {
      const order_data = await fetchOrderByID(order_id);
      if (order_data) {
        setOrder(order_data);
      } else {
        toast.error(`order with id ${order_id} could not be fetched`);
      }
      
    } catch (error) {
      toast.error("Failed to fetch Order info");
    } finally {
      setloadingOrder(false);
    }
  };

  useEffect(() => {
    loadOrder();
  },[linkedOrderPart]);
  
  if (order) {
    return (
      <TableRow>
        <TableCell className="font-medium">
          {linkedOrderPart.order_id}
        </TableCell>
        <TableCell className="hidden md:table-cell">
          {convertUtcToBDTime(linkedOrderPart.orders.created_at)}
        </TableCell>
        {
          loadingOrder?('-') : (
            <TableCell>
              {order.factory_sections?.name && order.machines?.name
                ? `${order.factories.abbreviation} - ${order.factory_sections?.name} - ${order.machines?.name}`
                : `${order.factories.abbreviation} - Storage`}        
            </TableCell>
          )
        }
        <TableCell className="hidden md:table-cell">{linkedOrderPart.qty}</TableCell>
        {(profile?.permission === 'admin' || profile?.permission=== 'finance') && <TableCell className="hidden md:table-cell">{linkedOrderPart.brand? (linkedOrderPart.brand): '-'}</TableCell>}
        {(profile?.permission === 'admin' || profile?.permission=== 'finance') && <TableCell className="hidden md:table-cell">{linkedOrderPart.unit_cost? `BDT ${(linkedOrderPart.unit_cost)}`: '-'}</TableCell>}
        {(profile?.permission === 'admin' || profile?.permission=== 'finance') && <TableCell className="hidden md:table-cell">{linkedOrderPart.vendor? (linkedOrderPart.vendor): '-'}</TableCell>}
        <TableCell className="hidden md:table-cell">{linkedOrderPart.part_purchased_date? convertUtcToBDTime(linkedOrderPart.part_purchased_date).split(',')[0] : '-'}</TableCell>
        <TableCell className="hidden md:table-cell">{linkedOrderPart.part_sent_by_office_date? convertUtcToBDTime(linkedOrderPart.part_sent_by_office_date).split(',')[0] : '-'}</TableCell>
        <TableCell className="hidden md:table-cell">{linkedOrderPart.part_received_by_factory_date? convertUtcToBDTime(linkedOrderPart.part_received_by_factory_date).split(',')[0] : '-'}</TableCell>
        <TableCell className="md:hidden">
          <Dialog>
          <DialogTrigger asChild>
            <ExternalLink className="hover:cursor-pointer"/>
          </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                  <DialogTitle>
                    Ordered Part Info
                  </DialogTitle>
                  <LinkedOrderedPartInfo
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
}

export default LinkedOrdersRow