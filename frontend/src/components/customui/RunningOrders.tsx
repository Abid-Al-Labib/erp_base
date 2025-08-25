import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import toast from "react-hot-toast";
import { Machine, Order } from "@/types";
import { fetchRunningOrdersByMachineId } from "@/services/OrdersService";
import { setMachineIsRunningById } from "@/services/MachineServices";

type RunningOrdersProps = {
  machine?: Machine | undefined;
  machineId?: number | undefined;
  // future-ready: storage variants can be added later
  storage?: unknown;
  storageId?: number | undefined;
};

const RunningOrders = ({ machine, machineId, storageId }: RunningOrdersProps) => {
  const [runningOrders, setRunningOrders] = useState<Order[]>([]);
  const selectedMachineId = machineId ?? machine?.id;

  useEffect(() => {
    const load = async () => {
      // Prefer machine flow if provided
      if (selectedMachineId) {
        try {
          const orders = await fetchRunningOrdersByMachineId(selectedMachineId);
          setRunningOrders(orders);

          if (orders.length === 0 && machine?.is_running === false) {
            toast.success("Machine is now running");
            await setMachineIsRunningById(selectedMachineId, true);
          }
        } catch (err) {
          setRunningOrders([]);
        }
        return;
      }

      // Storage flow placeholder (to be implemented later)
      if (storageId) {
        setRunningOrders([]);
        return;
      }

      // No target selected
      setRunningOrders([]);
    };
    load();
  }, [selectedMachineId, storageId, machine?.is_running]);

  return (
    <div className="flex-1">
      <Card className="mb-4 h-full">
        <CardHeader>
          <CardTitle>Running Orders</CardTitle>
          <CardDescription>A list of current running orders.</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedMachineId === undefined || runningOrders.length === 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Order ID</TableHead>
                  <TableHead className="w-[100px]">Req #</TableHead>
                  <TableHead className="w-[120px]">Created At</TableHead>
                  <TableHead>Order Note</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-[250px] text-muted-foreground">
                    {selectedMachineId === undefined ? "Select a machine to view orders" : "No running orders for this machine"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <div className="h-[293px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Order ID</TableHead>
                    <TableHead className="w-[100px]">Req #</TableHead>
                    <TableHead className="w-[120px]">Created At</TableHead>
                    <TableHead>Order Note</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runningOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Badge variant="secondary" className="bg-blue-100">
                          <Link to={`/vieworder/${order.id}`}>{order.id}</Link>
                        </Badge>
                      </TableCell>
                      <TableCell>{order.req_num}</TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={order.order_note}>
                        {order.order_note}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            order.statuses.name === "Parts Received"
                              ? "bg-green-100"
                              : order.statuses.name === "Pending"
                                ? "bg-red-100"
                                : "bg-orange-100"
                          }
                          variant="secondary"
                        >
                          {order.statuses.name}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RunningOrders;


