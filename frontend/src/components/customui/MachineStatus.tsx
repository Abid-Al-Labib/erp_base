// MachineStatus.tsx
import { useEffect, useState } from "react";
import { fetchMachineById, setMachineIsRunningById } from "@/services/MachineServices";
import { fetchMachineParts } from "@/services/MachinePartsService";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Machine, MachinePart } from "@/types";
import toast from "react-hot-toast";

interface MachineStatusProps {
    machineId?: number;
}

const MachineStatus: React.FC<MachineStatusProps> = ({ machineId }) => {
    const [machine, setMachine] = useState<Machine | null>(null);
    const [machineParts, setMachineParts] = useState<MachinePart[]>([]);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const loadMachineStatus = async () => {
            if (machineId === undefined) {
                setMachine(null);
                setMachineParts([]);
                return;
            }

            setLoading(true);
            try {
                // Fetch machine details
                const fetchedMachine = await fetchMachineById(machineId);
                setMachine(fetchedMachine);

                // Fetch machine parts
                const fetchedParts = await fetchMachineParts(machineId);
                setMachineParts(fetchedParts);

            } catch (error) {
                console.error("Failed to fetch machine status or parts:", error);
                setMachine(null);
                setMachineParts([]);
            } finally {
                setLoading(false);
            }
        };

        loadMachineStatus();
    }, [machineId]);

    const handleToggleStatus = async () => {
        if (!machine || !machineId) return;

        setUpdating(true);
        try {
            const newStatus = !machine.is_running;
            const updatedMachine = await setMachineIsRunningById(machineId, newStatus);
            
            if (updatedMachine) {
                setMachine(prev => prev ? { ...prev, is_running: newStatus } : null);
                toast.success(`Machine marked as ${newStatus ? 'Active' : 'Inactive'}`);
            }
        } catch (error) {
            console.error("Failed to update machine status:", error);
            toast.error("Failed to update machine status");
        } finally {
            setUpdating(false);
        }
    };

    if (!machineId) {
        return (
            <Card className="mb-4 h-full">
                <CardHeader>
                    <CardTitle>Machine Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center items-center h-32 text-muted-foreground">
                        Please Select a machine
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Sample condition calculations (replace with actual logic later)
    const hasDefectiveParts = machineParts.some(part => (part.defective_qty ?? 0) > 0);
    const hasInsufficientParts = machineParts.some(part => part.qty < (part.req_qty ?? 0));


    return (
        <Card className="mb-4 h-full">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <CardTitle className="text-lg font-semibold">
                            {loading || !machine ? 'Machine Status' : machine.name}
                        </CardTitle>
                        {!loading && machine && (
                            <div className="flex flex-col gap-2 text-sm text-muted-foreground mt-2">
                                <div>
                                    <span className="font-medium">Factory Section:</span> {machine.factory_sections?.name || "N/A"}
                                </div>
                                <div>
                                    <span className="font-medium">Factory:</span> {machine.factory_sections?.factories?.name || "N/A"}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Status:</span>
                                    <Badge 
                                        variant="secondary" 
                                        className={machine.is_running ? 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20' : 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20'}
                                    >
                                        {machine.is_running ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </div>
                        )}
                    </div>
                    {machine && (
                        <Button
                            onClick={handleToggleStatus}
                            disabled={updating || loading}
                            variant={machine.is_running ? "destructive" : "default"}
                            size="sm"
                            className="ml-4"
                        >
                            {updating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                machine.is_running ? "Mark Inactive" : "Mark Active"
                            )}
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                {loading || !machine ? (
                    <div className="flex items-center gap-2 text-muted-foreground h-20">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading machine details...</span>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <h4 className="font-medium text-foreground mb-2">Machine Conditions</h4>
                        
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium min-w-[100px]">Running:</span>
                            <Badge 
                                variant="secondary" 
                                className={machine.is_running ? 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20' : 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20'}
                            >
                                {machine.is_running ? "Running" : "Not Running"}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium min-w-[100px]">Defective Parts:</span>
                            <Badge 
                                variant="secondary" 
                                className={hasDefectiveParts ? 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20' : 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20'}
                            >
                                {hasDefectiveParts ? "Has Defective Parts" : "No Defective Parts"}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium min-w-[100px]">Parts Status:</span>
                            <Badge 
                                variant="secondary" 
                                className={hasInsufficientParts ? 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20' : 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20'}
                            >
                                {hasInsufficientParts ? "Insufficient Parts" : "Parts Sufficient"}
                            </Badge>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default MachineStatus;
