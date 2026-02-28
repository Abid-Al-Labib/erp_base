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
import type { PurchaseOrder } from '@/types/purchaseOrder';
import { ArrowLeft, Loader2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const { data: items = [], isLoading: itemsLoading } = useGetPurchaseOrderItemsQuery(order.id);
  const { data: accounts = [] } = useGetAccountsQuery({ skip: 0, limit: 100 });
  const [updateOrder] = useUpdatePurchaseOrderMutation();

  const accountName = accounts.find((a) => a.id === order.account_id)?.name ?? `#${order.account_id}`;

  const formatCurrency = (v: number | null | undefined) =>
    v != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v) : '—';

  const formatDate = (d: string | null | undefined) =>
    d ? new Date(d).toLocaleDateString() : '—';

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
              <h2 className="text-xl font-semibold text-card-foreground">{order.po_number}</h2>
              <p className="text-sm text-muted-foreground mt-1">Supplier: {accountName}</p>
              <p className="text-sm text-muted-foreground">
                Destination: {order.destination_type} #{order.destination_id}
              </p>
            </div>
            <Badge variant="secondary">Status #{order.current_status_id}</Badge>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-medium">{formatCurrency(Number(order.subtotal))}</dd>
            <dt className="text-muted-foreground">Total</dt>
            <dd className="font-medium">{formatCurrency(Number(order.total_amount))}</dd>
            <dt className="text-muted-foreground">Created</dt>
            <dd>{formatDate(order.created_at)}</dd>
          </dl>
          {order.description && (
            <p className="text-sm text-muted-foreground mt-3">{order.description}</p>
          )}
          {order.order_note && (
            <p className="text-sm text-muted-foreground mt-1">Note: {order.order_note}</p>
          )}
        </CardContent>
      </Card>

      <div className="mb-4">
        <h3 className="text-base font-semibold text-card-foreground mb-2">Line items</h3>
        {itemsLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items</p>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="py-2">Item ID</TableHead>
                  <TableHead className="py-2">Qty ordered</TableHead>
                  <TableHead className="py-2">Qty received</TableHead>
                  <TableHead className="py-2">Unit price</TableHead>
                  <TableHead className="py-2">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it) => (
                  <TableRow key={it.id} className="border-b border-border">
                    <TableCell className="py-2 font-mono">{it.item_id}</TableCell>
                    <TableCell className="py-2">{it.quantity_ordered}</TableCell>
                    <TableCell className="py-2">{it.quantity_received}</TableCell>
                    <TableCell className="py-2">{formatCurrency(Number(it.unit_price))}</TableCell>
                    <TableCell className="py-2">{formatCurrency(Number(it.line_subtotal))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
          Delete order
        </Button>
      </div>
    </div>
  );
};

export default PurchaseOrderDetailPanel;
