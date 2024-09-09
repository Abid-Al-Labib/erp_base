import { OrderedPart } from "@/types"
import { Card, CardContent } from "../ui/card"
import { Separator } from "../ui/separator"
import { convertUtcToBDTime } from "@/services/helper"

interface OrderedPartInfoProp {
  linkedOrderPart: OrderedPart
}

const OrderedPartInfo:React.FC<OrderedPartInfoProp> = ({ linkedOrderPart }) => {

  return (
    <Card className="sm:col-span-2 pt-2" x-chunk="dashboard-05-chunk-0">
      {
          <CardContent>
            <ul className="grid gap-3">
              <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Quantity Ordered</span>
                <span>{linkedOrderPart.qty}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Cost/unit</span>
                <span>{linkedOrderPart.unit_cost? `BDT ${(linkedOrderPart.unit_cost)}`: '-'}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Vendor</span>
                <span>{linkedOrderPart.vendor? (linkedOrderPart.vendor): '-'}</span>
              </li>
            <Separator className="my-2"/>
              <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Part purchased date</span>
                <span>{linkedOrderPart.part_purchased_date? convertUtcToBDTime(linkedOrderPart.part_purchased_date) : '-'}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Part sent to factory date</span>
                <span>{linkedOrderPart.part_sent_by_office_date? convertUtcToBDTime(linkedOrderPart.part_sent_by_office_date) : '-'}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Part received by factory date</span>
                <span>{linkedOrderPart.part_received_by_factory_date? convertUtcToBDTime(linkedOrderPart.part_received_by_factory_date) : '-'}</span>
              </li>
            </ul>
          </CardContent>
        
      }
    </Card>  
  )
}

export default OrderedPartInfo;
