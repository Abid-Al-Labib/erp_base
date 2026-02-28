import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetExpenseOrderItemsQuery } from '@/features/expenseOrders/expenseOrdersApi';
import type { ExpenseOrder } from '@/types/expenseOrder';
import type { Account } from '@/types/account';
import { ArrowLeft } from 'lucide-react';

interface ExpenseOrderDetailPanelProps {
  order: ExpenseOrder;
  accounts: Account[];
  onClose: () => void;
  onDelete: () => void;
}

const ExpenseOrderDetailPanel: React.FC<ExpenseOrderDetailPanelProps> = ({
  order,
  accounts,
  onClose,
  onDelete,
}) => {
  const { data: items = [], isLoading: itemsLoading } = useGetExpenseOrderItemsQuery(order.id);

  const accountName = order.account_id
    ? accounts.find((a) => a.id === order.account_id)?.name ?? `#${order.account_id}`
    : '—';

  const formatCurrency = (v: number | null | undefined) =>
    v != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v) : '—';
  const formatDate = (d: string | null | undefined) => (d ? new Date(d).toLocaleDateString() : '—');

  return (
    <div className="p-6 max-w-3xl">
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
            <Badge variant="secondary">Status #{order.current_status_id}</Badge>
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

      <div className="mb-4">
        <h3 className="text-base font-semibold text-card-foreground mb-2">Line items</h3>
        {itemsLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items</p>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="py-2">Description</TableHead>
                  <TableHead className="py-2">Qty</TableHead>
                  <TableHead className="py-2">Unit</TableHead>
                  <TableHead className="py-2">Unit price</TableHead>
                  <TableHead className="py-2">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it) => (
                  <TableRow key={it.id} className="border-b border-border">
                    <TableCell className="py-2">{it.description ?? '—'}</TableCell>
                    <TableCell className="py-2">{it.quantity}</TableCell>
                    <TableCell className="py-2">{it.unit ?? '—'}</TableCell>
                    <TableCell className="py-2">{formatCurrency(it.unit_price)}</TableCell>
                    <TableCell className="py-2">{formatCurrency(it.line_subtotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
        Delete order
      </Button>
    </div>
  );
};

export default ExpenseOrderDetailPanel;
