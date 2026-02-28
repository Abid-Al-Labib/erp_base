import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetSalesOrderItemsQuery, useGetSalesOrderDeliveriesQuery } from '@/features/salesOrders/salesOrdersApi';
import type { SalesOrder } from '@/types/salesOrder';
import type { Account } from '@/types/account';
import { ArrowLeft } from 'lucide-react';

interface SalesOrderDetailPanelProps {
  order: SalesOrder;
  accounts: Account[];
  onClose: () => void;
}

const SalesOrderDetailPanel: React.FC<SalesOrderDetailPanelProps> = ({ order, accounts, onClose }) => {
  const { data: items = [], isLoading: itemsLoading } = useGetSalesOrderItemsQuery(order.id);
  const { data: deliveries = [] } = useGetSalesOrderDeliveriesQuery(order.id);

  const accountName = accounts.find((a) => a.id === order.account_id)?.name ?? `#${order.account_id}`;

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
              <h2 className="text-xl font-semibold text-card-foreground">{order.sales_order_number}</h2>
              <p className="text-sm text-muted-foreground mt-1">Customer: {accountName}</p>
              <p className="text-sm text-muted-foreground">Factory ID: {order.factory_id}</p>
            </div>
            <Badge variant="secondary">Status #{order.current_status_id}</Badge>
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
                  <TableHead className="py-2">Item ID</TableHead>
                  <TableHead className="py-2">Qty ordered</TableHead>
                  <TableHead className="py-2">Qty delivered</TableHead>
                  <TableHead className="py-2">Unit price</TableHead>
                  <TableHead className="py-2">Line total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it: { id: number; item_id: number; quantity_ordered: number; quantity_delivered?: number; unit_price: number; line_total?: number }) => (
                  <TableRow key={it.id} className="border-b border-border">
                    <TableCell className="py-2 font-mono">{it.item_id}</TableCell>
                    <TableCell className="py-2">{it.quantity_ordered}</TableCell>
                    <TableCell className="py-2">{it.quantity_delivered ?? '—'}</TableCell>
                    <TableCell className="py-2">{formatCurrency(it.unit_price)}</TableCell>
                    <TableCell className="py-2">{formatCurrency(it.line_total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
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
  );
};

export default SalesOrderDetailPanel;
