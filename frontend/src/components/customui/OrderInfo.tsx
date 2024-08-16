import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"

interface OrderInfoProp {
    id: number,
    created_at: string,
    created_by: string,
    department_name: string,
    current_status: string,
    note: string
}


const OrderInfo: React.FC<OrderInfoProp> = ({id,created_at,created_by,department_name,current_status,note}) => {
  return (
        <Card
        className="sm:col-span-2" x-chunk="dashboard-05-chunk-0"
    >
        <CardHeader className="pb-3">
        <CardTitle>Order Detail</CardTitle>
        </CardHeader>
        <Separator className="my-4" />
        <CardContent>
            <ul className="grid gap-3">
            <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">ID</span>
                <span>{id}</span>
            </li>
            <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Created at</span>
                <span>{created_at}</span>
            </li>
            <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Created by</span>
                <span>{created_by}</span>
            </li>
            <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Department</span>
                <span>{department_name}</span>
            </li>
            <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Current Status</span>
                <span>{current_status}</span>
            </li>
            </ul>
        <Separator className="my-2" />
        <span className="font-semibold text-muted-foreground">Note</span>
        <div className="max-w-xl text-balance leading-relaxed mt-2">{note}</div>
        </CardContent>
    </Card>
  )
}

export default OrderInfo