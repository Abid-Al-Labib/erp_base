import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  useGetSalesOrderItemsQuery,
  useGetSalesOrderDeliveriesQuery,
  useUpdateSalesOrderMutation,
} from '@/features/salesOrders/salesOrdersApi';
import { useGetStatusesQuery } from '@/features/statuses/statusesApi';
import { ORDER_OVERVIEW_FLEX, ORDER_ITEMS_FLEX } from '@/components/newcomponents/customui/orders/orderListConstants';
import type { SalesOrder } from '@/types/salesOrder';
import type { Account } from '@/types/account';
import { ArrowLeft, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import OrderStatusActions from './OrderStatusActions';

interface SalesOrderDetailPanelProps {
  order: SalesOrder;
  accounts: Account[];
  onClose: () => void;
  onUpdated?: () => void;
}

const SalesOrderDetailPanel: React.FC<SalesOrderDetailPanelProps> = ({
  order,
  accounts,
  onClose,
  onUpdated,
}) => {
  const { data: items = [], isLoading: itemsLoading } = useGetSalesOrderItemsQuery(order.id);
  const { data: deliveries = [] } = useGetSalesOrderDeliveriesQuery(order.id);
  const { data: statuses = [] } = useGetStatusesQuery({ skip: 0, limit: 100 });
  const [updateOrder, { isLoading: isUpdating }] = useUpdateSalesOrderMutation();

  const accountName = accounts.find((a) => a.id === order.account_id)?.name ?? `#${order.account_id}`;

  const formatCurrency = (v: number | null | undefined) =>
    v != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v) : '—';
  const formatDate = (d: string | null | undefined) => (d ? new Date(d).toLocaleDateString() : '—');

  const statusLabel = statuses.find((s) => s.id === order.current_status_id)?.name ?? `#${order.current_status_id}`;

  const handleStatusChange = async (statusId: number) => {
    try {
      await updateOrder({ id: order.id, data: { current_status_id: statusId } }).unwrap();
      toast.success('Status updated');
      onUpdated?.();
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
                <h2 className="text-xl font-semibold text-card-foreground">{order.sales_order_number}</h2>
                <p className="text-sm text-muted-foreground mt-1">Customer: {accountName}</p>
                <p className="text-sm text-muted-foreground">Factory ID: {order.factory_id}</p>
              </div>
              <Badge variant="secondary">{statusLabel}</Badge>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">Total</dt>
              <dd className="font-medium">{formatCurrency(order.total_amount)}</dd>
              <dt className="text-muted-foreground">Order date</dt>
              <dd>{formatDate(order.order_date)}</dd>
              <dt className="text-muted-foreground">Expected delivery</dt>
              <dd>{formatDate(order.expected_delivery_date)}</dd>
              <dt className="text-muted-foreground">Fully delivered</dt>
              <dd>{order.is_fully_delivered ? 'Yes' : 'No'}</dd>
              <dt className="text-muted-foreground">Invoiced</dt>
              <dd>{order.is_invoiced ? 'Yes' : 'No'}</dd>
            </dl>
            {order.notes && <p className="text-sm text-muted-foreground mt-3">{order.notes}</p>}
          </CardContent>
        </Card>

        <div className="pt-4 border-t border-border">
          <OrderStatusActions
            currentStatusId={order.current_status_id}
            onStatusChange={handleStatusChange}
            isLoading={isUpdating}
            statuses={statuses}
          />
        </div>

        {deliveries.length > 0 && (
          <div>
            <h3 className="text-base font-semibold text-card-foreground mb-2">Deliveries ({deliveries.length})</h3>
            <div className="border border-border rounded-lg divide-y">
              {deliveries.map((d: { id: number; delivery_number?: string; scheduled_date?: string; actual_delivery_date?: string; delivery_status?: string }) => (
                <div key={d.id} className="px-4 py-2 flex justify-between text-sm">
                  <span>{d.delivery_number ?? `#${d.id}`}</span>
                  <span className="text-muted-foreground">
                    {d.delivery_status ?? '—'} • {formatDate(d.actual_delivery_date ?? d.scheduled_date)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
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
            <p className="text-sm text-muted-foreground py-4">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No items</p>
          ) : (
            <div className="border border-border rounded-lg overflow-auto flex-1 min-h-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="py-2">Item</TableHead>
                    <TableHead className="py-2">Qty</TableHead>
                    <TableHead className="py-2">Delivered</TableHead>
                    <TableHead className="py-2">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((it: { id: number; item_id: number; quantity_ordered: number; quantity_delivered?: number; unit_price: number; line_total?: number }) => (
                    <TableRow key={it.id} className="border-b border-border">
                      <TableCell className="py-2 font-mono text-sm">{it.item_id}</TableCell>
                      <TableCell className="py-2">{it.quantity_ordered}</TableCell>
                      <TableCell className="py-2">{it.quantity_delivered ?? '—'}</TableCell>
                      <TableCell className="py-2">{formatCurrency(it.unit_price)}</TableCell>
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

export default SalesOrderDetailPanel;
