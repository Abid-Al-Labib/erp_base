// MachinePartsTable.tsx
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '../ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import SearchAndFilter from "@/components/customui/SearchAndFilter";
import MachinePartsRow from './MachinePartsRow'; // Import the MachinePartsRow component
import { MachinePart, Machine } from '@/types';

interface MachinePartsTableProps {
    MachineParts: MachinePart[];
    onApplyFilters: (filters: any) => void;
    onResetFilters: () => void;
    onRefresh: () => Promise<void>; // Add this line to include the onRefresh prop
    selectedMachine?: Machine;
    loading?: boolean;
}

const MachinePartsTable: React.FC<MachinePartsTableProps> = ({ MachineParts, onApplyFilters, onResetFilters, onRefresh, selectedMachine, loading }) => {
    // console.log("Machine Parts of", MachineParts);

    return (
        <Card>
            <CardHeader className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <CardTitle>Machine Parts</CardTitle>
                    </div>
                    <SearchAndFilter
                        filterConfig={[
                            { type: 'partName', label: 'Part Name' },
                            { type: 'partId', label: 'Part ID' },
                        ]}
                        onFiltersChange={(f) => {
                            onApplyFilters({
                                partIdQuery: f.partIdQuery,
                                partNameQuery: f.partNameQuery,
                            });
                        }}
                    />
                </div>
                <CardDescription>A list of all the machine parts in the selected machine</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Part ID</TableHead>
                            <TableHead>Part Name</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Defective Parts</TableHead>
                            <TableHead>Required Quantity</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 4 }).map((_, idx) => (
                                <TableRow key={idx}>
                                    <TableCell><div className="h-5 w-16 bg-muted rounded" /></TableCell>
                                    <TableCell><div className="h-5 w-40 bg-muted rounded" /></TableCell>
                                    <TableCell><div className="h-5 w-16 bg-muted rounded" /></TableCell>
                                    <TableCell><div className="h-5 w-24 bg-muted rounded" /></TableCell>
                                    <TableCell><div className="h-5 w-28 bg-muted rounded" /></TableCell>
                                    <TableCell className="text-right"><div className="h-5 w-10 bg-muted rounded ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            MachineParts.map((MachinePart) => (
                                <MachinePartsRow key={MachinePart.id} MachinePart={MachinePart} onRefresh={onRefresh}/>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default MachinePartsTable;