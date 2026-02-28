import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetTransferOrderItemsQuery } from '@/features/transferOrders/transferOrdersApi';
import type { TransferOrder } from '@/types/transferOrder';
import { ArrowLeft } from 'lucide-react';

interface TransferOrderDetailPanelProps {
  order: TransferOrder;
  onClose: () => void;
  onDelete: () => void;
}

const TransferOrderDetailPanel: React.FC<TransferOrderDetailPanelProps> = ({ order, onClose, onDelete }) => {
  const { data: items = [], isLoading: itemsLoading } = useGetTransferOrderItemsQuery(order.id);

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
              <h2 className="text-xl font-semibold text-card-foreground">{order.transfer_number}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {order.source_location_type} #{order.source_location_id} → {order.destination_location_type} #{order.destination_location_id}
              </p>
            </div>
            <Badge variant="secondary">Status #{order.current_status_id}</Badge>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-muted-foreground">Order date</dt>
            <dd>{formatDate(order.order_date)}</dd>
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
                  <TableHead className="py-2">Item ID</TableHead>
                  <TableHead className="py-2">Quantity</TableHead>
                  <TableHead className="py-2">Approved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it) => (
                  <TableRow key={it.id} className="border-b border-border">
                    <TableCell className="py-2 font-mono">{it.item_id}</TableCell>
                    <TableCell className="py-2">{it.quantity}</TableCell>
                    <TableCell className="py-2">{it.approved ? 'Yes' : 'No'}</TableCell>
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

export default TransferOrderDetailPanel;
