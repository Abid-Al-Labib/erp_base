import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  useGetPurchaseOrderItemsQuery,
  useUpdatePurchaseOrderMutation,
} from '@/features/purchaseOrders/purchaseOrdersApi';
import { useGetAccountsQuery } from '@/features/accounts/accountsApi';
import { useGetFactoriesQuery } from '@/features/factories/factoriesApi';
import { useGetStatusesQuery } from '@/features/statuses/statusesApi';
import { useGetItemsQuery } from '@/features/items/itemsApi';
import { ORDER_OVERVIEW_FLEX, ORDER_ITEMS_FLEX } from '@/components/newcomponents/customui/orders/orderListConstants';
import type { PurchaseOrder } from '@/types/purchaseOrder';
import { ArrowLeft, Loader2, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import OrderStatusActions from './OrderStatusActions';

interface PurchaseOrderDetailPanelProps {
  order: PurchaseOrder;
  onClose: () => void;
  onDelete: () => void;
  onUpdated?: () => void;
}

const PurchaseOrderDetailPanel: React.FC<PurchaseOrderDetailPanelProps> = ({
  order,
  onClose,
  onDelete,
  onUpdated,
}) => {
  const [updateOrder, { isLoading: isUpdating }] = useUpdatePurchaseOrderMutation();
  const { data: items = [], isLoading: itemsLoading } = useGetPurchaseOrderItemsQuery(order.id);
  const { data: accounts = [] } = useGetAccountsQuery({ skip: 0, limit: 100 });
  const { data: factories = [] } = useGetFactoriesQuery({ skip: 0, limit: 100 });
  const { data: statuses = [] } = useGetStatusesQuery({ skip: 0, limit: 100 });
  const { data: allItems = [] } = useGetItemsQuery({ skip: 0, limit: 100 });

  const accountName = accounts.find((a) => a.id === order.account_id)?.name ?? `#${order.account_id}`;
  const statusLabel = statuses.find((s) => s.id === order.current_status_id)?.name ?? `#${order.current_status_id}`;
  const itemName = (id: number) => allItems.find((i) => i.id === id)?.name ?? `Item #${id}`;

  const formatCurrency = (v: number | null | undefined) =>
    v != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v) : '—';

  const formatDate = (d: string | null | undefined) => (d ? new Date(d).toLocaleDateString() : '—');

  const destinationLabel = () => {
    if (order.destination_type === 'storage') {
      const factory = factories.find((f) => f.id === order.destination_id);
      return factory ? `Storage (${factory.name})` : 'Storage';
    }
    if (order.destination_type === 'machine') {
      return `Machine #${order.destination_id}`;
    }
    return `${order.destination_type} #${order.destination_id}`;
  };

  const totalOrdered = items.reduce((sum, i) => sum + i.quantity_ordered, 0);
  const totalReceived = items.reduce((sum, i) => sum + i.quantity_received, 0);
  const receivedPct = totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0;

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
        <div className="flex items-center justify-between gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-card-foreground">{order.po_number}</h2>
            <p className="text-sm text-muted-foreground mt-1">Supplier: {accountName}</p>
            <p className="text-sm text-muted-foreground">Destination: {destinationLabel()}</p>
          </div>
          <Badge variant="secondary" className="shrink-0">{statusLabel}</Badge>
        </div>

        <Card>
          <CardContent className="pt-6">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium">{formatCurrency(Number(order.subtotal))}</dd>
              <dt className="text-muted-foreground">Total</dt>
              <dd className="font-medium">{formatCurrency(Number(order.total_amount))}</dd>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{formatDate(order.created_at)}</dd>
              <dt className="text-muted-foreground">Received</dt>
              <dd>
                <span className={receivedPct >= 100 ? 'text-green-600 dark:text-green-400' : receivedPct > 0 ? 'text-amber-600 dark:text-amber-400' : ''}>
                  {totalReceived} / {totalOrdered} ({receivedPct}%)
                </span>
              </dd>
            </dl>
            <div className="mt-3">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    receivedPct >= 100 ? 'bg-green-500' : receivedPct > 0 ? 'bg-amber-500' : 'bg-muted-foreground/30'
                  }`}
                  style={{ width: `${Math.min(receivedPct, 100)}%` }}
                />
              </div>
            </div>
            {order.description && (
              <p className="text-sm text-muted-foreground mt-3">{order.description}</p>
            )}
            {order.order_note && (
              <p className="text-sm text-muted-foreground mt-1">Note: {order.order_note}</p>
            )}
          </CardContent>
        </Card>

        <div className="pt-4 border-t border-border">
          <OrderStatusActions
          currentStatusId={order.current_status_id}
          onStatusChange={handleStatusChange}
          isLoading={isUpdating}
          statuses={statuses}
          onDelete={onDelete}
          />
        </div>
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
                    <TableHead className="py-2">Recv</TableHead>
                    <TableHead className="py-2">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((it) => (
                    <TableRow key={it.id} className="border-b border-border">
                      <TableCell className="py-2">
                        <span className="font-medium text-sm">{itemName(it.item_id)}</span>
                      </TableCell>
                      <TableCell className="py-2">{it.quantity_ordered}</TableCell>
                      <TableCell className="py-2">
                        <span className={it.quantity_received >= it.quantity_ordered ? 'text-green-600 dark:text-green-400' : ''}>
                          {it.quantity_received}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">{formatCurrency(Number(it.unit_price))}</TableCell>
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

export default PurchaseOrderDetailPanel;
