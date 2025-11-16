import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import toast from "react-hot-toast";
import { Factory, Machine, Order, ProjectComponent } from "@/types";
import { fetchRunningOrdersByMachineId, fetchRunningOrdersByFactoryId, fetchRunningOrdersByProjectComponentId } from "@/services/OrdersService";
import { setMachineIsRunningById } from "@/services/MachineServices";

type RunningOrdersProps = {
  machine?: Machine | undefined;
  factory?: Factory | undefined;
  projectComponent?: ProjectComponent | undefined;
};

// Matching OrdersTableRow badge styling
const COMPLETED_STATUSES = new Set<string>([
  'Parts Received',
  'Transferred To Machine',
  'Transferred To Storage',
  'Transferred To Project',
  'Transfer Completed',
]);

const STATUS_BADGE_STYLES: Record<string, string> = {
  'Pending': 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20',
  'Order Sent To Head Office': "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20",
  'Waiting For Quotation': "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20",
  'Budget Released': "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20",
  'Waiting For Purchase': "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20",
  'Purchase Complete': "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20",
  'Parts Sent To Factory': "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20",
};

function getStatusBadgeClass(statusName: string): string {
  if (COMPLETED_STATUSES.has(statusName)) return 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20';
  if (statusName === 'Pending') return 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20';
  return STATUS_BADGE_STYLES[statusName] ?? 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20';
}

const RunningOrders = ({ machine, factory, projectComponent }: RunningOrdersProps) => {
  const [runningOrders, setRunningOrders] = useState<Order[]>([]);
  const mode: 'machine' | 'factory' | 'projectComponent' | 'none' = machine?.id ? 'machine' : factory?.id ? 'factory' : projectComponent?.id ? 'projectComponent' : 'none';
  const selectedMachineId = mode === 'machine' ? machine!.id : undefined;
  const selectedFactoryId = mode === 'factory' ? factory!.id : undefined;
  const selectedProjectComponentId = mode === 'projectComponent' ? projectComponent!.id : undefined;

  useEffect(() => {
    const load = async () => {
      if (mode === 'machine' && selectedMachineId) {
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

      if (mode === 'factory' && selectedFactoryId) {
        try {
          const orders = await fetchRunningOrdersByFactoryId(selectedFactoryId);
          setRunningOrders(orders);
        } catch {
          setRunningOrders([]);
        }
        return;
      }

      if (mode === 'projectComponent' && selectedProjectComponentId) {
        try {
          const orders = await fetchRunningOrdersByProjectComponentId(selectedProjectComponentId);
          setRunningOrders(orders);
        } catch {
          setRunningOrders([]);
        }
        return;
      }

      setRunningOrders([]);
    };
    load();
  }, [mode, selectedMachineId, selectedFactoryId, selectedProjectComponentId, machine?.is_running]);

  return (
    <div className="flex-1">
      <Card className="mb-4 h-full">
        <CardHeader>
          <CardTitle>Running Orders</CardTitle>
          <CardDescription>A list of current running orders.</CardDescription>
        </CardHeader>
        <CardContent>
          {mode === 'none' || runningOrders.length === 0 ? (
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
                    {mode === 'none' ? "Select a machine, factory, or project component to view orders" : mode === 'machine' ? "No running orders for this machine" : mode === 'factory' ? "No running orders for this storage" : "No running orders for this project component"}
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
                        <Badge variant="secondary" className="bg-primary/10">
                          <Link to={`/vieworder/${order.id}`}>{order.id}</Link>
                        </Badge>
                      </TableCell>
                      <TableCell>{order.req_num}</TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={order.order_note}>
                        {order.order_note}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeClass(order.statuses.name)} variant="secondary">
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


