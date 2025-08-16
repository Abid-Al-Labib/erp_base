import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { fetchFactories, fetchFactorySections } from '@/services/FactoriesService';
import { fetchAllMachines } from "@/services/MachineServices";
import { Factory, FactorySection, Machine } from "@/types";

export type UnstableType = 'defective' | 'borrowed' | 'less' | '';

export interface BorrowingConfiguration {
    source: 'machine' | 'storage';
    borrowFactoryId?: number;
    borrowFactorySectionId?: number;
    selectedBorrowMachine?: number;
    selectedBorrowFactory?: number;
}

interface MachineUnstabilityFormProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    unstableType: UnstableType;
    onUnstableTypeChange: (type: UnstableType, borrowingConfig?: BorrowingConfiguration) => void;
    onMarkInactiveInstead?: () => void;
    showMarkInactiveOption?: boolean;
    title?: string;
    description?: string;
    currentMachineId?: number; // To exclude from borrowing options
}

const MachineUnstabilityForm: React.FC<MachineUnstabilityFormProps> = ({
    isOpen,
    onOpenChange,
    unstableType,
    onUnstableTypeChange,
    onMarkInactiveInstead,
    showMarkInactiveOption = true,
    title = "How will you keep the machine running?",
    description = "Since you're not marking the machine as inactive, please specify how it will continue operating.",
    currentMachineId
}) => {
    // Borrowing state
    const [showBorrowDialog, setShowBorrowDialog] = useState<boolean>(false);
    const [borrowSource, setBorrowSource] = useState<'machine' | 'storage'>('machine');
    const [selectedBorrowMachine, setSelectedBorrowMachine] = useState<number | null>(null);
    const [selectedBorrowFactory, setSelectedBorrowFactory] = useState<number | null>(null);
    const [borrowFactoryId, setBorrowFactoryId] = useState<number | null>(null);
    const [borrowFactorySectionId, setBorrowFactorySectionId] = useState<number | null>(null);
    const [factories, setFactories] = useState<Factory[]>([]);
    const [borrowFactorySections, setBorrowFactorySections] = useState<FactorySection[]>([]);
    const [borrowMachines, setBorrowMachines] = useState<Machine[]>([]);

    // Load factories for borrowing
    useEffect(() => {
        const loadFactories = async () => {
            try {
                const fetchedFactories = await fetchFactories();
                setFactories(fetchedFactories);
            } catch (error) {
                console.error("Failed to load factories:", error);
            }
        };
        loadFactories();
    }, []);

    // Load borrowing factory sections when borrow factory is selected
    useEffect(() => {
        const loadBorrowFactorySections = async () => {
            if (borrowFactoryId) {
                try {
                    const fetchedSections = await fetchFactorySections(borrowFactoryId);
                    setBorrowFactorySections(fetchedSections);
                } catch (error) {
                    console.error("Failed to load borrow factory sections:", error);
                }
            } else {
                setBorrowFactorySections([]);
                setBorrowFactorySectionId(null);
                setBorrowMachines([]);
                setSelectedBorrowMachine(null);
            }
        };
        loadBorrowFactorySections();
    }, [borrowFactoryId]);

    // Load borrowing machines when borrow factory section is selected
    useEffect(() => {
        const loadBorrowMachines = async () => {
            if (borrowFactorySectionId) {
                try {
                    const fetchedMachines = await fetchAllMachines(borrowFactorySectionId);
                    console.log("All machines loaded for section:", borrowFactorySectionId, fetchedMachines);
                    setBorrowMachines(fetchedMachines);
                } catch (error) {
                    console.error("Failed to load borrow machines:", error);
                }
            } else {
                setBorrowMachines([]);
                setSelectedBorrowMachine(null);
            }
        };
        loadBorrowMachines();
    }, [borrowFactorySectionId]);
    
    const handleUnstableTypeSelection = (type: UnstableType) => {
        if (type === 'borrowed') {
            // Show borrowing dialog instead of immediate callback
            setShowBorrowDialog(true);
        } else {
            // For other types, proceed normally
            onUnstableTypeChange(type);
            onOpenChange(false);
        }
    };

    const resetBorrowingState = () => {
        setBorrowSource('machine');
        setSelectedBorrowMachine(null);
        setSelectedBorrowFactory(null);
        setBorrowFactoryId(null);
        setBorrowFactorySectionId(null);
        setBorrowFactorySections([]);
        setBorrowMachines([]);
    };

    const handleConfirmBorrowing = () => {
        const borrowingConfig: BorrowingConfiguration = {
            source: borrowSource,
            borrowFactoryId: borrowFactoryId || undefined,
            borrowFactorySectionId: borrowFactorySectionId || undefined,
            selectedBorrowMachine: selectedBorrowMachine || undefined,
            selectedBorrowFactory: selectedBorrowFactory || undefined
        };
        
        onUnstableTypeChange('borrowed', borrowingConfig);
        setShowBorrowDialog(false);
        onOpenChange(false);
        resetBorrowingState();
    };

    const handleCancelBorrowing = () => {
        setShowBorrowDialog(false);
        resetBorrowingState();
    };

    const handleMarkInactiveInstead = () => {
        if (onMarkInactiveInstead) {
            onMarkInactiveInstead();
        }
        onUnstableTypeChange('');
        onOpenChange(false);
    };

    return (
        <>
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {description}
                        </p>
                    </div>
                    
                    <div className="space-y-3">
                        <Button
                            variant={unstableType === 'defective' ? 'default' : 'outline'}
                            className="w-full justify-start text-left h-auto p-4"
                            onClick={() => handleUnstableTypeSelection('defective')}
                        >
                            <div>
                                <div className="font-medium">Use Defective Parts</div>
                                <div className="text-xs text-muted-foreground">
                                    Increase defective parts quantity and reduce machine parts quantity
                                </div>
                            </div>
                        </Button>

                        <Button
                            variant={unstableType === 'borrowed' ? 'default' : 'outline'}
                            className="w-full justify-start text-left h-auto p-4"
                            onClick={() => handleUnstableTypeSelection('borrowed')}
                        >
                            <div>
                                <div className="font-medium">Borrow Parts (Temporary Transfer)</div>
                                <div className="text-xs text-muted-foreground">
                                    Create a temporary transfer order
                                </div>
                            </div>
                        </Button>

                        <Button
                            variant={unstableType === 'less' ? 'default' : 'outline'}
                            className="w-full justify-start text-left h-auto p-4"
                            onClick={() => handleUnstableTypeSelection('less')}
                        >
                            <div>
                                <div className="font-medium">Use Fewer Parts</div>
                                <div className="text-xs text-muted-foreground">
                                    Decrease machine parts and increase damaged parts
                                </div>
                            </div>
                        </Button>
                    </div>

                    {showMarkInactiveOption && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={handleMarkInactiveInstead}
                            >
                                Cancel (Mark Inactive Instead)
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>

        {/* Borrowing Configuration Dialog */}
        <Dialog open={showBorrowDialog} onOpenChange={setShowBorrowDialog}>
            <DialogContent className="max-w-md">
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium">Borrow Parts Configuration</h3>
                        <p className="text-sm text-muted-foreground">
                            Choose where to borrow the parts from to keep the machine running.
                        </p>
                    </div>

                    {/* Borrow Source Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Borrow From:</Label>
                        
                        <Button
                            variant={borrowSource === 'machine' ? 'default' : 'outline'}
                            className="w-full justify-start text-left h-auto p-4"
                            onClick={() => setBorrowSource('machine')}
                        >
                            <div>
                                <div className="font-medium">Another Machine</div>
                                <div className="text-xs text-muted-foreground">
                                    Borrow parts from a different machine
                                </div>
                            </div>
                        </Button>

                        <Button
                            variant={borrowSource === 'storage' ? 'default' : 'outline'}
                            className="w-full justify-start text-left h-auto p-4"
                            onClick={() => setBorrowSource('storage')}
                        >
                            <div>
                                <div className="font-medium">Factory Storage</div>
                                <div className="text-xs text-muted-foreground">
                                    Borrow parts from factory storage
                                </div>
                            </div>
                        </Button>
                    </div>

                    {/* Machine Selection Forms (when borrowing from machine) */}
                    {borrowSource === 'machine' && (
                        <div className="space-y-4">
                            {/* Factory Selection */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Select Factory:</Label>
                                <Select 
                                    value={borrowFactoryId?.toString() || ""} 
                                    onValueChange={(value) => {
                                        const factoryId = value ? parseInt(value) : null;
                                        setBorrowFactoryId(factoryId);
                                        setBorrowFactorySectionId(null);
                                        setSelectedBorrowMachine(null);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose factory" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {factories.map((factory) => (
                                            <SelectItem key={factory.id} value={factory.id.toString()}>
                                                {factory.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Factory Section Selection */}
                            {borrowFactoryId && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Select Factory Section:</Label>
                                    <Select 
                                        value={borrowFactorySectionId?.toString() || ""} 
                                        onValueChange={(value) => {
                                            const sectionId = value ? parseInt(value) : null;
                                            setBorrowFactorySectionId(sectionId);
                                            setSelectedBorrowMachine(null);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose factory section" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {borrowFactorySections.map((section) => (
                                                <SelectItem key={section.id} value={section.id.toString()}>
                                                    {section.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Machine Selection */}
                            {borrowFactorySectionId && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Select Machine:</Label>
                                    <Select 
                                        value={selectedBorrowMachine?.toString() || ""} 
                                        onValueChange={(value) => setSelectedBorrowMachine(value ? parseInt(value) : null)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose machine to borrow from" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(() => {
                                                const filteredMachines = borrowMachines.filter(machine => machine.id !== currentMachineId);
                                                console.log("Available machines for borrowing:", filteredMachines);
                                                console.log("Current machine ID to exclude:", currentMachineId);
                                                
                                                return filteredMachines
                                                    .sort((a, b) => {
                                                        // Simple alphabetical sorting to debug
                                                        return a.name.localeCompare(b.name);
                                                    })
                                                    .map((machine) => (
                                                        <SelectItem 
                                                            key={machine.id} 
                                                            value={machine.id.toString()}
                                                        >
                                                            {machine.name}
                                                        </SelectItem>
                                                    ));
                                            })()}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Factory Selection (when borrowing from storage) */}
                    {borrowSource === 'storage' && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Select Factory Storage:</Label>
                            <Select 
                                value={selectedBorrowFactory?.toString() || ""} 
                                onValueChange={(value) => setSelectedBorrowFactory(parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose factory storage" />
                                </SelectTrigger>
                                <SelectContent>
                                    {factories.map((factory) => (
                                        <SelectItem 
                                            key={factory.id} 
                                            value={factory.id.toString()}
                                        >
                                            {factory.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleCancelBorrowing}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={handleConfirmBorrowing}
                            disabled={
                                (borrowSource === 'machine' && (!borrowFactoryId || !borrowFactorySectionId || !selectedBorrowMachine)) ||
                                (borrowSource === 'storage' && !selectedBorrowFactory)
                            }
                        >
                            Confirm Borrowing
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
        </>
    );
};

export default MachineUnstabilityForm;
