import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '../ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from "@/components/ui/button";
import SearchAndFilter from "@/components/customui/SearchAndFilter";

type StoragePart = {
    storageId: number;
    id: number;
    name: string;
    description: string;
    qty: number;
    factory_name: string;
};

interface StoragePartsTableProps {
    parts: StoragePart[];
    onApplyFilters: (filters: any) => void;
    onResetFilters: () => void;
}

const StoragePartsTable: React.FC<StoragePartsTableProps> = ({ parts, onApplyFilters, onResetFilters }) => {
    return (
        <Card className="mt-5">
            <CardHeader className="flex justify-between">
                <CardTitle>Storage Parts</CardTitle>
                <CardDescription>
                    This is a list of storage orders.
                </CardDescription>
                <div className="ml-auto">   
                    <SearchAndFilter
                        filterConfig={[
                            { type: 'factory', label: 'Factory' },
                            { type: 'storageId', label: 'Storage ID' },
                            { type: 'partName', label: 'Part Name' },
                            { type: 'partId', label: 'Part ID' },
                        ]}
                        onApplyFilters={onApplyFilters}
                        onResetFilters={onResetFilters}
                        hideDefaultIdDateSearch={true}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Storage ID</TableHead>
                            <TableHead>Part ID</TableHead>
                            <TableHead>Part Name</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Factory Name</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {parts.map((part) => (
                            <TableRow key={part.storageId}>
                                <TableCell>{part.storageId}</TableCell>
                                <TableCell>{part.id}</TableCell>
                                <TableCell>{part.name}</TableCell>
                                <TableCell>{part.qty}</TableCell>
                                <TableCell>{part.factory_name}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default StoragePartsTable;
