import { OrderedPart } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { fetchOrderedPartByPartID } from "@/services/OrderedPartsService"
import { Loader2 } from "lucide-react"
import { convertUtcToBDTime } from "@/services/helper"

interface OrderedPartInfoProp {
  part_id: number
}

const OrderedPartInfo:React.FC<OrderedPartInfoProp> = ({ part_id }) => {
  
  const [orderedParts, setOrderedPart] = useState<OrderedPart[]>([]);
  const [loadingPartInfo, setLoadingPartInfo] = useState(true)
  
  useEffect(() => {
    const loadOrderedPartInfo = async () => {
      try {
        const data = await fetchOrderedPartByPartID(part_id);
        setOrderedPart(data)
      } catch (error) {
        toast.error("Could not load info");
      } finally {
        setLoadingPartInfo(false);
      }
    }; 
    loadOrderedPartInfo();
  }, [part_id]);

  return (
    <Card className="sm:col-span-2 pt-2" x-chunk="dashboard-05-chunk-0">
      {
        loadingPartInfo ? (
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin"/>
          </div>
        ) : 
          <CardContent>
            <ul className="grid gap-3">
              <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Quantity Ordered</span>
                <span>{orderedParts[0].qty}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Cost/unit</span>
                <span>{orderedParts[0].unit_cost}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Vendor</span>
                <span>{orderedParts[0].vendor}</span>
              </li>
            <Separator className="my-2" />
              <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Sample sent to office</span>
                <span>{orderedParts[0].is_sample_sent_to_office}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Sample received by office</span>
                <span>{orderedParts[0].is_sample_received_by_office}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Part purchased date</span>
                <span>{orderedParts[0].part_purchased_date}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Part sent to factory date</span>
                <span>{orderedParts[0].part_sent_by_office_date}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Part received by factory date</span>
                <span>{orderedParts[0].part_received_by_factory_date}</span>
              </li>
            </ul>
            <Separator className="my-2" />
            <span className="font-semibold text-muted-foreground">Note</span>
            <div className="max-w-xl text-balance leading-relaxed mt-2">
              {orderedParts[0].note}
            </div>
          </CardContent>
        
      }
    </Card>  
  )
}

export default OrderedPartInfo;
