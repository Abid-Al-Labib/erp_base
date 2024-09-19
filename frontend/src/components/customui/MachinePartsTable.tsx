// MachinePartsTable.tsx
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '../ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import SearchAndFilter from "@/components/customui/SearchAndFilter";

type MachinePart = {
    machinePartId: number;
    id: number;
    name: string;
    description: string;
    qty: number;
    machine_name: string;
};

interface MachinePartsTableProps {
    parts: MachinePart[];
    onApplyFilters: (filters: any) => void;
    onResetFilters: () => void;
}

const MachinePartsTable: React.FC<MachinePartsTableProps> = ({ parts, onApplyFilters, onResetFilters }) => {
    return (
        <Card className="mt-5">
            <CardHeader className="flex justify-between">
                <CardTitle>Machine Parts</CardTitle>
                <CardDescription>This is a list of machine parts.</CardDescription>
                <div className="ml-auto">
                    <SearchAndFilter
                        filterConfig={[
                            { type: 'factory', label: 'Factory'},
                            { type: 'factorySection' , label: 'Factory Section'},
                            { type: 'machine', label: 'Machine' },
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
                            <TableHead>Machine Part ID</TableHead>
                            <TableHead>Part ID</TableHead>
                            <TableHead>Part Name</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Machine Name</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {parts.map((part) => (
                            <TableRow key={part.machinePartId}>
                                <TableCell>{part.machinePartId}</TableCell>
                                <TableCell>{part.id}</TableCell>
                                <TableCell>{part.name}</TableCell>
                                <TableCell>{part.qty}</TableCell>
                                <TableCell>{part.machine_name}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default MachinePartsTable;
