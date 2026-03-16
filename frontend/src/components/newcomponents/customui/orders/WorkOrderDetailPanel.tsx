import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  useGetWorkOrderItemsQuery,
  useUpdateWorkOrderMutation,
} from '@/features/workOrders/workOrdersApi';
import { ORDER_OVERVIEW_FLEX, ORDER_ITEMS_FLEX } from '@/components/newcomponents/customui/orders/orderListConstants';
import type { WorkOrder } from '@/types/workOrder';
import type { WorkOrderStatus } from '@/types/workOrder';
import { ArrowLeft, Loader2, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS: WorkOrderStatus[] = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
];

interface WorkOrderDetailPanelProps {
  order: WorkOrder;
  onClose: () => void;
  onDelete: () => void;
  onStatusUpdated?: () => void;
}

const WorkOrderDetailPanel: React.FC<WorkOrderDetailPanelProps> = ({
  order,
  onClose,
  onDelete,
  onStatusUpdated,
}) => {
  const { data: items = [], isLoading: itemsLoading } = useGetWorkOrderItemsQuery(order.id);
  const [updateOrder, { isLoading: isUpdating }] = useUpdateWorkOrderMutation();

  const formatDate = (d: string | null | undefined) => (d ? new Date(d).toLocaleDateString() : '—');
  const formatCurrency = (v: number | null | undefined) =>
    v != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v) : '—';

  const handleStatusChange = async (newStatus: WorkOrderStatus) => {
    try {
      await updateOrder({ id: order.id, data: { status: newStatus } }).unwrap();
      toast.success(`Status updated to ${newStatus}`);
      onStatusUpdated?.();
    } catch (err: unknown) {
      const e = err as { data?: { detail?: string } };
      toast.error(e?.data?.detail || 'Failed to update status');
    }
  };

  return (
    <div className="p-6 flex gap-6 min-h-0 overflow-hidden">
      <div
        className="min-w-0 overflow-y-auto"
        style={{ flex: `${ORDER_OVERVIEW_FLEX} ${ORDER_OVERVIEW_FLEX} 0` }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">{order.work_order_number}</h2>
                <p className="text-sm font-medium text-muted-foreground mt-1">{order.title}</p>
                <p className="text-sm text-muted-foreground">
                  {order.work_type} • Factory #{order.factory_id}
                  {order.machine_id && ` • Machine #${order.machine_id}`}
                </p>
              </div>
              <Badge variant={order.status === 'COMPLETED' ? 'default' : 'secondary'}>{order.status}</Badge>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">Priority</dt>
              <dd>{order.priority}</dd>
              <dt className="text-muted-foreground">Cost</dt>
              <dd>{formatCurrency(order.cost)}</dd>
              <dt className="text-muted-foreground">Start date</dt>
              <dd>{formatDate(order.start_date)}</dd>
              <dt className="text-muted-foreground">End date</dt>
              <dd>{formatDate(order.end_date)}</dd>
              <dt className="text-muted-foreground">Assigned to</dt>
              <dd>{order.assigned_to ?? '—'}</dd>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{formatDate(order.created_at)}</dd>
            </dl>
            {order.description && <p className="text-sm text-muted-foreground mt-3">{order.description}</p>}
            {order.completion_notes && (
              <p className="text-sm text-muted-foreground mt-2">Completion: {order.completion_notes}</p>
            )}
          </CardContent>
        </Card>

        <div className="mb-6">
          <h3 className="text-base font-semibold text-card-foreground mb-2">Update status</h3>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((s) => (
              <Button
                key={s}
                variant={order.status === s ? 'default' : 'outline'}
                size="sm"
                disabled={isUpdating || order.status === s}
                onClick={() => handleStatusChange(s)}
                className={order.status === s ? 'bg-brand-primary hover:bg-brand-primary-hover' : ''}
              >
                {s}
              </Button>
            ))}
          </div>
          {order.status === 'COMPLETED' && order.machine_id && (
            <p className="text-xs text-muted-foreground mt-2">
              A maintenance log was created for this machine when the order was completed.
            </p>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
          Delete order
        </Button>
      </div>

      <Card
        className="min-w-0 overflow-hidden flex flex-col"
        style={{ flex: `${ORDER_ITEMS_FLEX} ${ORDER_ITEMS_FLEX} 0` }}
      >
        <CardContent className="pt-6 pb-4 flex-1 min-h-0 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-base font-semibold text-card-foreground">Items ({items.length})</h3>
          </div>
          {itemsLoading ? (
            <div className="flex items-center gap-2 py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No items</p>
          ) : (
            <div className="border border-border rounded-lg overflow-auto flex-1 min-h-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="py-2">Item</TableHead>
                    <TableHead className="py-2">Qty</TableHead>
                    <TableHead className="py-2">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((it) => (
                    <TableRow key={it.id} className="border-b border-border">
                      <TableCell className="py-2 font-mono text-sm">{it.item_id}</TableCell>
                      <TableCell className="py-2">{it.quantity}</TableCell>
                      <TableCell className="py-2 text-sm">{it.notes ?? '—'}</TableCell>
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

export default WorkOrderDetailPanel;
