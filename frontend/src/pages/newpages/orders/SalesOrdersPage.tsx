import React, { useState, useMemo } from 'react';
import DashboardNavbar, { SIDEBAR_COLLAPSED_KEY } from '@/components/newcomponents/customui/DashboardNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useGetSalesOrdersQuery } from '@/features/salesOrders/salesOrdersApi';
import { useGetAccountsQuery } from '@/features/accounts/accountsApi';
import type { SalesOrder } from '@/types/salesOrder';
import { ShoppingBag, Plus, Loader2, Search } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import SalesOrderDetailPanel from '@/components/newcomponents/customui/orders/SalesOrderDetailPanel';

const SalesOrdersPage: React.FC = () => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(() =>
    localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const { data: orders = [], isLoading } = useGetSalesOrdersQuery({ skip: 0, limit: 100 });
  const { data: accounts = [] } = useGetAccountsQuery({ skip: 0, limit: 100 });

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter(
      (o) =>
        o.sales_order_number?.toLowerCase().includes(q) ||
        (accounts.find((a) => a.id === o.account_id)?.name ?? '').toLowerCase().includes(q)
    );
  }, [orders, searchQuery, accounts]);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) ?? null;

  const formatCurrency = (v: number | null | undefined) =>
    v != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v) : '—';

  const accountName = (id: number) => accounts.find((a) => a.id === id)?.name ?? `#${id}`;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Toaster position="top-right" />
      <DashboardNavbar onCollapsedChange={setIsNavCollapsed} />

      <div className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ${isNavCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="flex-shrink-0 bg-card dark:bg-[hsl(var(--nav-background))] border-b border-border px-8 py-5 z-10 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-primary/10 dark:bg-brand-primary/20 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-brand-primary" />
              </div>
              <h1 className="text-2xl font-bold text-card-foreground dark:text-foreground">Sales Orders</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by SO# or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-background"
                />
              </div>
              <Button className="bg-brand-primary hover:bg-brand-primary-hover h-9" disabled title="Add dialog coming soon">
                <Plus className="mr-2 h-4 w-4" />
                Add Sales Order
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex overflow-hidden">
          <div className="w-[340px] flex-shrink-0 border-r border-border flex flex-col min-h-0 bg-card">
            <div className="px-4 py-3 border-b border-border text-sm text-muted-foreground font-medium">
              {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-10 w-10 animate-spin text-brand-primary mb-3" />
                  <p className="text-sm text-muted-foreground">Loading orders...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground text-center">
                    {searchQuery ? 'No orders match your search.' : 'No sales orders yet.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredOrders.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setSelectedOrderId(o.id)}
                      className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${
                        selectedOrderId === o.id ? 'bg-brand-primary/10 dark:bg-brand-primary/20 border-l-2 border-brand-primary' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-card-foreground truncate">{o.sales_order_number}</span>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          #{o.current_status_id}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground truncate mt-0.5">{accountName(o.account_id)}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{formatCurrency(o.total_amount)}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto bg-background">
            {selectedOrder ? (
              <SalesOrderDetailPanel
                order={selectedOrder}
                accounts={accounts}
                onClose={() => setSelectedOrderId(null)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <ShoppingBag className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-sm">Select an order to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOrdersPage;
