import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  useGetTransferOrderItemsQuery,
  useUpdateTransferOrderMutation,
} from '@/features/transferOrders/transferOrdersApi';
import { useGetStatusesQuery } from '@/features/statuses/statusesApi';
import { useGetFactoriesQuery } from '@/features/factories/factoriesApi';
import { useGetMachinesQuery } from '@/features/machines/machinesApi';
import { useGetProjectsQuery } from '@/features/projects/projectsApi';
import { ORDER_OVERVIEW_FLEX, ORDER_ITEMS_FLEX } from '@/components/newcomponents/customui/orders/orderListConstants';
import type { TransferOrder } from '@/types/transferOrder';
import { ArrowLeft, ArrowRight, Package, Warehouse, Cpu, AlertTriangle, FolderKanban } from 'lucide-react';
import toast from 'react-hot-toast';
import OrderStatusActions from './OrderStatusActions';
import { API_LIMITS } from '@/constants/apiLimits';

interface TransferOrderDetailPanelProps {
  order: TransferOrder;
  onClose: () => void;
  onDelete: () => void;
  onUpdated?: () => void;
}

function getLocationLabel(
  type: string,
  id: number,
  factories: { id: number; name: string }[],
  machines: { id: number; name: string }[],
  projects: { id: number; name: string }[]
): { label: string; icon: React.ReactNode } {
  const iconMap = {
    storage: <Warehouse className="h-4 w-4" />,
    machine: <Cpu className="h-4 w-4" />,
    damaged: <AlertTriangle className="h-4 w-4" />,
    project: <FolderKanban className="h-4 w-4" />,
  };
  const icon = iconMap[type as keyof typeof iconMap] ?? <Warehouse className="h-4 w-4" />;
  if (type === 'storage' || type === 'damaged') {
    const f = factories.find((x) => x.id === id);
    return { label: f ? `${f.name}${type === 'damaged' ? ' (Damaged)' : ''}` : `${type} #${id}`, icon };
  }
  if (type === 'machine') {
    const m = machines.find((x) => x.id === id);
    return { label: m?.name ?? `Machine #${id}`, icon };
  }
  if (type === 'project') {
    const p = projects.find((x) => x.id === id);
    return { label: p?.name ?? `Project #${id}`, icon };
  }
  return { label: `${type} #${id}`, icon };
}

const TransferOrderDetailPanel: React.FC<TransferOrderDetailPanelProps> = ({
  order,
  onClose,
  onDelete,
  onUpdated,
}) => {
  const { data: items = [], isLoading: itemsLoading } = useGetTransferOrderItemsQuery(order.id);
  const { data: statuses = [] } = useGetStatusesQuery({ skip: 0, limit: API_LIMITS.STRICT_100 });
  const { data: factories = [] } = useGetFactoriesQuery({ skip: 0, limit: API_LIMITS.STRICT_100 });
  const { data: machines = [] } = useGetMachinesQuery({ skip: 0, limit: API_LIMITS.FLEXIBLE_1000 });
  const { data: projects = [] } = useGetProjectsQuery({ skip: 0, limit: API_LIMITS.STRICT_100 });
  const [updateOrder, { isLoading: isUpdating }] = useUpdateTransferOrderMutation();

  const formatDate = (d: string | null | undefined) => (d ? new Date(d).toLocaleDateString() : '—');

  const statusLabel = statuses.find((s) => s.id === order.current_status_id)?.name ?? `#${order.current_status_id}`;

  const source = getLocationLabel(
    order.source_location_type,
    order.source_location_id,
    factories,
    machines,
    projects
  );
  const dest = getLocationLabel(
    order.destination_location_type,
    order.destination_location_id,
    factories,
    machines,
    projects
  );

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

        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-card-foreground">{order.transfer_number}</h2>
          <Badge variant="secondary">{statusLabel}</Badge>
        </div>

        {/* Source → Destination cards with arrow */}
        <div className="flex items-stretch gap-3 mb-6">
          <Card className="flex-1 min-w-0">
            <CardContent className="pt-4 pb-4">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Source</div>
              <div className="flex items-center gap-2 text-card-foreground">
                <span className="text-muted-foreground">{source.icon}</span>
                <span className="font-medium">{source.label}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1 capitalize">{order.source_location_type}</div>
            </CardContent>
          </Card>
          <div className="flex flex-col justify-center shrink-0 px-2">
            <ArrowRight className="h-8 w-8 text-brand-primary" />
          </div>
          <Card className="flex-1 min-w-0">
            <CardContent className="pt-4 pb-4">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Destination</div>
              <div className="flex items-center gap-2 text-card-foreground">
                <span className="text-muted-foreground">{dest.icon}</span>
                <span className="font-medium">{dest.label}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1 capitalize">{order.destination_location_type}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-4 pb-4">
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">Order date</dt>
              <dd>{formatDate(order.order_date)}</dd>
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
                    <TableHead className="py-2">Item</TableHead>
                    <TableHead className="py-2">Qty</TableHead>
                    <TableHead className="py-2">Approved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((it) => (
                    <TableRow key={it.id} className="border-b border-border">
                      <TableCell className="py-2 font-mono text-sm">{it.item_id}</TableCell>
                      <TableCell className="py-2">{it.quantity}</TableCell>
                      <TableCell className="py-2">{it.approved ? 'Yes' : 'No'}</TableCell>
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

export default TransferOrderDetailPanel;
