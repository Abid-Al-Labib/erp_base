import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Props = {
  factoryName?: string;
  totalItems?: number;
};

const StorageDetails = ({ factoryName, totalItems }: Props) => {
  return (
    <div className="w-80 flex-shrink-0">
      <Card className="mb-4 h-full">
        <CardHeader>
          <CardTitle>Storage Details</CardTitle>
          <CardDescription>Overview of selected storage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>Factory: {factoryName || "-"}</div>
            {typeof totalItems === 'number' && <div>Total Items: {totalItems}</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorageDetails;


