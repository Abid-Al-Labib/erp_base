// AllMachinesStatus.tsx
import { useEffect, useState } from "react";
import { fetchFactories, fetchFactorySections } from "@/services/FactoriesService";
import { fetchMachines } from "@/services/MachineServices";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    factory: string;
    factory_section_id: number;
    factory_section_name: string;
}

interface AllMachinesStatusProps {
    factoryId?: number;
    factorySectionId?: number;
    handleRowSelection: (factoryId: number, factorySectionId: number, machineId: number) => void; // New prop
}

const AllMachinesStatus: React.FC<AllMachinesStatusProps> = ({ factoryId, factorySectionId, handleRowSelection }) => {
    const [factories, setFactories] = useState<Factory[]>([]);
    const [factorySections, setFactorySections] = useState<FactorySection[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const fetchedFactories = factoryId
                    ? await fetchFactories().then((factories) => {
                        return factories.filter((f) => f.id === factoryId);
                    })
                    : await fetchFactories();
                setFactories(fetchedFactories);

                let allSections: FactorySection[] = [];
                if (factorySectionId && factoryId) {
                    const section = await fetchFactorySections(factoryId).then((sections) => {
                        return sections.find((section) => section.id === factorySectionId);
                    });

                    if (section) {
                        allSections = [section]; // Directly set the section to the state if found
                    } else {
                    }
                } else {
                    for (const factory of fetchedFactories) {
                        const sections = await fetchFactorySections(factory.id);
                        allSections.push(...sections);
                    }
                }

                setFactorySections(allSections);

                const allMachines: Machine[] = [];
                for (const section of allSections) {
                    const machines = await fetchMachines(section.id);
                    machines.forEach((machine) => {
                        allMachines.push({
                            ...machine,
                            factory_section_id: section.id,
                            factory: fetchedFactories.find((f) => f.id === section.factory_id)?.name || "Unknown Factory",
                            factory_section_name: section.name,
                        });
                    });
                }
                setMachines(allMachines);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [factoryId, factorySectionId]);

    if (loading) {
        return (
            <div className="flex justify-center p-5">
                <Loader2 className="animate-spin" />
                <span>Loading...</span>
            </div>
        );
    }

    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle>All Machines Status</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableCaption>A list of all machines and their running statuses.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Factory</TableHead>
                            <TableHead>Factory Section</TableHead>
                            <TableHead>Machine Name</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {machines.map((machine) => (
                            <TableRow
                                key={machine.id}
                                className="cursor-pointer hover:bg-gray-100" // Adds hover effect
                                onClick={() =>
                                    handleRowSelection(
                                        factories.find((f) => f.name === machine.factory)?.id ?? -1,
                                        machine.factory_section_id,
                                        machine.id
                                    )
                                }
                            >
                                <TableCell>{machine.factory}</TableCell>
                                <TableCell>{machine.factory_section_name}</TableCell>
                                <TableCell>{machine.name}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className={machine.is_running ? 'bg-green-100' : 'bg-red-100'}>
                                        {machine.is_running ? "Running" : "Not Running"}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default AllMachinesStatus;
