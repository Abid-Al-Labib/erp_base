import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/types";

interface OrderMachineAndStorageInfoProps {
  order: Order;
  mode: "view" | "manage";
}

const OrderMachineAndStorageInfo: React.FC<OrderMachineAndStorageInfoProps> = ({ order, mode }) => {
  if (order.order_type !== 'STM') {
    return null;
  }

  const getMachineStatusBadge = () => {
    if (order.marked_inactive) {
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Inactive</Badge>
    }
    if (order.unstable_type) {
      const unstableText = order.unstable_type === 'defective' ? 'Defective Parts' : 
                         order.unstable_type === 'less' ? 'Less Parts' : order.unstable_type
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
        Active - {unstableText}
      </Badge>
    }
    return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Active</Badge>
  }

  return (
    <Card className="h-full flex flex-col w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Machine & Storage Info</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {/* Machine Status Section */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Machine Status</h4>
            <div className="mb-3">
              {getMachineStatusBadge()}
            </div>
          </div>

          {/* Machine Parts Section */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Machine Parts</h4>
            <div className="space-y-2">
              {/* This would show machine parts with reduced quantities */}
              <div className="text-sm text-muted-foreground">
                Machine parts will be reduced based on instability type
              </div>
            </div>
          </div>

          {/* Storage Parts Section */}
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Storage Parts</h4>
            <div className="space-y-2">
              {/* This would show storage parts with increased quantities */}
              <div className="text-sm text-muted-foreground">
                Storage parts will be increased by 20%
              </div>
            </div>
          </div>

          {/* Other Parts Section */}
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
              Other Machine & Storage Parts
            </summary>
            <div className="mt-2 max-h-32 overflow-y-auto text-sm text-muted-foreground">
              <div className="space-y-1">
                <div>Additional machine parts...</div>
                <div>Additional storage items...</div>
              </div>
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderMachineAndStorageInfo;
