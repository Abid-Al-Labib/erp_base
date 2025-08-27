// AllMachinesStatus.tsx
import { useEffect, useState } from "react";
import { fetchFactories, fetchAllFactorySections } from "@/services/FactoriesService";
import { fetchAllMachinesEnriched } from "@/services/MachineServices";
import { fetchMachineParts } from "@/services/MachinePartsService";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "../ui/badge";

interface Factory {
    id: number;
    name: string;
}

interface FactorySection {
    id: number;
    name: string;
    factory_id: number;
}

interface Machine {
    id: number;
    name: string;
    is_running: boolean;
    factory_section_id: number;
    factory: string;
    factory_section_name: string;
}

interface AllMachinesStatusProps {
    factoryId?: number;
    factorySectionId?: number;
    handleRowSelection?: (factoryId: number, factorySectionId: number, machineId: number) => void;
    loadingMessage?: string;
}

const AllMachinesStatus = ({ factoryId, factorySectionId, handleRowSelection, loadingMessage }: AllMachinesStatusProps) => {
    const [factories, setFactories] = useState<Factory[]>([]);
    const [factorySections, setFactorySections] = useState<FactorySection[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [machinePartsStatus, setMachinePartsStatus] = useState<Record<number, { hasDefective: boolean }>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const fetchedFactories = await fetchFactories();
                const fetchedSections = await fetchAllFactorySections();
                const { data: enrichedMachines } = await fetchAllMachinesEnriched();

                setFactories(fetchedFactories);
                setFactorySections(fetchedSections);
                setMachines(enrichedMachines);

                // Fetch machine parts status for each machine
                const partsStatusPromises = enrichedMachines.map(async (machine) => {
                    try {
                        const parts = await fetchMachineParts(machine.id);
                        const hasDefective = parts.some(part => (part.defective_qty ?? 0) > 0);
                        return { machineId: machine.id, hasDefective };
                    } catch (error) {
                        console.error(`Error fetching parts for machine ${machine.id}:`, error);
                        return { machineId: machine.id, hasDefective: false };
                    }
                });

                const partsStatusResults = await Promise.all(partsStatusPromises);
                const partsStatusMap = partsStatusResults.reduce((acc, result) => {
                    acc[result.machineId] = { hasDefective: result.hasDefective };
                    return acc;
                }, {} as Record<number, { hasDefective: boolean }>);

                setMachinePartsStatus(partsStatusMap);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // If no factory is selected, show a message
    if (factoryId === undefined) {
        return (
            <Card className="mt-5">
                <CardHeader>
                    <CardTitle>Machine Status Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center items-center h-32 text-muted-foreground">
                        Please select a factory to view machine status
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Filter machines based on factoryId and factorySectionId
    const filteredMachines = machines.filter(machine => {
        if (factoryId !== undefined) {
            const section = factorySections.find(s => s.id === machine.factory_section_id);
            if (!section || section.factory_id !== factoryId) return false;
        }
        if (factorySectionId !== undefined && machine.factory_section_id !== factorySectionId) {
            return false;
        }
        return true;
    });

    // Group machines by factory and section
    const groupedMachines = filteredMachines.reduce((acc, machine) => {
        const section = factorySections.find(s => s.id === machine.factory_section_id);
        const factory = factories.find(f => f.id === section?.factory_id);
        
        if (!factory || !section) return acc;
        
        const key = `${factory.id}-${section.id}`;
        if (!acc[key]) {
            acc[key] = {
                factory: factory.name,
                section: section.name,
                machines: []
            };
        }
        acc[key].machines.push(machine);
        return acc;
    }, {} as Record<string, { factory: string; section: string; machines: Machine[] }>);

    // Sort machines in each group
    Object.values(groupedMachines).forEach(group => {
        group.machines.sort((a, b) => 
            a.name.localeCompare(b.name, undefined, {
                numeric: true,
                sensitivity: 'base'
            })
        );
    });

    return (
        <Card className="mt-5">
            <CardHeader>
                <CardTitle>Machine Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[12%]">Factory</TableHead>
                            <TableHead className="w-[8%]">Section</TableHead>
                            <TableHead className="w-[64%]">Machines</TableHead>
                            <TableHead className="w-[8%]">Running Status</TableHead>
                            <TableHead className="w-[8%]">Parts Status</TableHead>
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
                                </TableRow>
                            ))
                        ) : (
                            Object.entries(groupedMachines).map(([key, group]) => {
                                const [factoryId, sectionId] = key.split('-').map(Number);
                                const runningCount = group.machines.filter(m => m.is_running).length;
                                const totalCount = group.machines.length;
                                const defectiveCount = group.machines.filter(m => machinePartsStatus[m.id]?.hasDefective).length;

                                return (
                                    <TableRow 
                                        key={key}
                                        className="cursor-default"
                                    >
                                        <TableCell>{group.factory}</TableCell>
                                        <TableCell>{group.section}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-2">
                                                {group.machines.map((machine) => {
                                                    const hasDefective = machinePartsStatus[machine.id]?.hasDefective;
                                                    return (
                                                        <Badge
                                                            key={machine.id}
                                                            variant="secondary"
                                                            className={`text-sm cursor-pointer ${
                                                                hasDefective
                                                                    ? "bg-yellow-100 text-yellow-700"
                                                                    : machine.is_running
                                                                        ? "bg-green-100 text-green-600"
                                                                        : "bg-red-100 text-red-600"
                                                            }`}
                                                            onClick={() => handleRowSelection?.(factoryId, sectionId, machine.id)}
                                                        >
                                                            {machine.name}
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant="secondary" 
                                                className={`text-sm ${runningCount === totalCount ? 'bg-green-100' : runningCount === 0 ? 'bg-red-100' : 'bg-orange-100'}`}
                                            >
                                                {runningCount}/{totalCount} Running
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant="secondary" 
                                                className={`text-sm ${defectiveCount > 0 ? 'bg-yellow-100' : 'bg-green-100'}`}
                                            >
                                                {defectiveCount > 0 ? `${defectiveCount} Defective` : 'All Parts OK'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default AllMachinesStatus;