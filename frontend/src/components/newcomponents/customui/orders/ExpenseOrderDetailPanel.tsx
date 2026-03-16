import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  useGetExpenseOrderItemsQuery,
  useUpdateExpenseOrderMutation,
} from '@/features/expenseOrders/expenseOrdersApi';
import { useGetStatusesQuery } from '@/features/statuses/statusesApi';
import { ORDER_OVERVIEW_FLEX, ORDER_ITEMS_FLEX } from '@/components/newcomponents/customui/orders/orderListConstants';
import type { ExpenseOrder } from '@/types/expenseOrder';
import type { Account } from '@/types/account';
import { ArrowLeft, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import OrderStatusActions from './OrderStatusActions';

interface ExpenseOrderDetailPanelProps {
  order: ExpenseOrder;
  accounts: Account[];
  onClose: () => void;
  onDelete: () => void;
  onUpdated?: () => void;
}

const ExpenseOrderDetailPanel: React.FC<ExpenseOrderDetailPanelProps> = ({
  order,
  accounts,
  onClose,
  onDelete,
  onUpdated,
}) => {
  const { data: items = [], isLoading: itemsLoading } = useGetExpenseOrderItemsQuery(order.id);
  const { data: statuses = [] } = useGetStatusesQuery({ skip: 0, limit: 100 });
  const [updateOrder, { isLoading: isUpdating }] = useUpdateExpenseOrderMutation();

  const accountName = order.account_id
    ? accounts.find((a) => a.id === order.account_id)?.name ?? `#${order.account_id}`
    : '—';

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
                <h2 className="text-xl font-semibold text-card-foreground">{order.expense_number}</h2>
                <p className="text-sm text-muted-foreground mt-1">Category: {order.expense_category}</p>
                <p className="text-sm text-muted-foreground">Account: {accountName}</p>
              </div>
              <Badge variant="secondary">{statusLabel}</Badge>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium">{formatCurrency(order.subtotal)}</dd>
              <dt className="text-muted-foreground">Total</dt>
              <dd className="font-medium">{formatCurrency(order.total_amount)}</dd>
              <dt className="text-muted-foreground">Expense date</dt>
              <dd>{formatDate(order.expense_date)}</dd>
              <dt className="text-muted-foreground">Due date</dt>
              <dd>{formatDate(order.due_date)}</dd>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{formatDate(order.created_at)}</dd>
            </dl>
            {order.description && <p className="text-sm text-muted-foreground mt-3">{order.description}</p>}
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
            <p className="text-sm text-muted-foreground py-4">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No items</p>
          ) : (
            <div className="border border-border rounded-lg overflow-auto flex-1 min-h-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="py-2">Description</TableHead>
                    <TableHead className="py-2">Qty</TableHead>
                    <TableHead className="py-2">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((it) => (
                    <TableRow key={it.id} className="border-b border-border">
                      <TableCell className="py-2 text-sm">{it.description ?? '—'}</TableCell>
                      <TableCell className="py-2">{it.quantity}</TableCell>
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

export default ExpenseOrderDetailPanel;
