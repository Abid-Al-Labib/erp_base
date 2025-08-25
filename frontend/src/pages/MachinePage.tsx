// MachinePage.tsx
import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fetchFactories, fetchFactorySections } from "@/services/FactoriesService";
import { fetchMachineParts } from "@/services/MachinePartsService";
import { fetchMachineById, fetchAllMachineIdNames } from "@/services/MachineServices";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import MachinePartsTable from "@/components/customui/MachinePartsTable";
import NavigationBar from "@/components/customui/NavigationBar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Machine, MachinePart } from "@/types";
import MachineStatus from "@/components/customui/MachineStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AllMachinesStatus from "@/components/customui/AllMachineStatus";
import RunningOrders from "@/components/customui/RunningOrders";

const MachinePartsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [MachineParts, setMachineParts] = useState<MachinePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});
  const [factories, setFactories] = useState<{ id: number; name: string }[]>([]);
  const [factorySections, setFactorySections] = useState<{ id: number; name: string }[]>([]);
  const [machines, setMachines] = useState<{ id: number; name: string }[]>([]);
  
  // Add loading states for better UX
  const [machinesLoading, setMachinesLoading] = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [factoryLoading, setFactoryLoading] = useState(false);
  
  // Initialize state from URL parameters
  const [selectedFactoryId, setSelectedFactoryId] = useState<number | undefined>(() => {
    const factoryParam = searchParams.get('factory');
    return factoryParam ? Number(factoryParam) : undefined;
  });
  const [selectedFactorySectionId, setSelectedFactorySectionId] = useState<number | undefined>(() => {
    const sectionParam = searchParams.get('section');
    return sectionParam ? Number(sectionParam) : undefined;
  });
  const [selectedMachineId, setSelectedMachineId] = useState<number | undefined>(() => {
    const machineParam = searchParams.get('machine');
    return machineParam ? Number(machineParam) : undefined;
  });
  
  const [selectedMachine, setSelectedMachine] = useState<Machine>();

  // Add simple caching for machines to prevent refetching
  const machinesCache = useRef<Map<number, { id: number; name: string }[]>>(new Map());
  const sectionsCache = useRef<Map<number, { id: number; name: string }[]>>(new Map());
  
  // Function to clear cache
  const clearCache = useCallback(() => {
    machinesCache.current.clear();
    sectionsCache.current.clear();
  }, []);
  
  // Memoize sorted machines to prevent unnecessary re-sorting
  const sortedMachines = useMemo(() => {
    return [...machines].sort((a, b) => a.id - b.id);
  }, [machines]);
  
  // Load machines immediately without debouncing for better performance
  const loadMachines = useCallback(async (factorySectionId: number | undefined) => {
    if (factorySectionId !== undefined && factorySectionId !== -1) {
      try {
        // Check cache first
        if (machinesCache.current.has(factorySectionId)) {
          const cachedMachines = machinesCache.current.get(factorySectionId);
          if (cachedMachines) {
            setMachines(cachedMachines);
            if (!searchParams.get('machine')) {
              setSelectedMachineId(undefined);
            }
            return;
          }
        }
        
        setMachinesLoading(true);
        const fetchedMachines = await fetchAllMachineIdNames(factorySectionId);
        setMachines(fetchedMachines);
        
        // Cache the result
        machinesCache.current.set(factorySectionId, fetchedMachines);
        
        // Only reset machine selection if not loading from URL
        if (!searchParams.get('machine')) {
          setSelectedMachineId(undefined);
        }
      } catch (error) {
        toast.error("Failed to load machines");
      } finally {
        setMachinesLoading(false);
      }
    } else {
      setMachines([]);
      setMachinesLoading(false);
      if (!searchParams.get('machine')) {
        setSelectedMachineId(undefined);
      }
    }
  }, [searchParams]);
  
  // Update URL parameters when selections change
  const updateUrlParams = useCallback((factory?: number, section?: number, machine?: number) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      
      if (factory !== undefined) {
        newParams.set('factory', factory.toString());
      } else {
        newParams.delete('factory');
      }
      
      if (section !== undefined) {
        newParams.set('section', section.toString());
      } else {
        newParams.delete('section');
      }
      
      if (machine !== undefined) {
        newParams.set('machine', machine.toString());
      } else {
        newParams.delete('machine');
      }
      
      return newParams;
    });
  }, [setSearchParams]);

  
  const refreshComponents = useCallback(async () => {
    if (!selectedMachineId) return;

    try {
      setLoading(true);

      // Reset the machine parts and selected machine to blank or initial states
      setMachineParts([]); // Clear machine parts
      setSelectedMachine(undefined); // Reset the selected machine

      // Fetch the machine details and handle null by converting to undefined
      const machine = await fetchMachineById(selectedMachineId);
      setSelectedMachine(machine ?? undefined); // Set the machine details
      if(selectedMachine){
        const fetchedParts = await fetchMachineParts(
          selectedMachineId,
          filters.partIdQuery || undefined,
          filters.partNameQuery || undefined
        );

        const processedParts = fetchedParts.map((record: any) => ({
          id: record.id,
          machine_id: record.machine_id,
          part_id: record.parts.id,
          qty: record.qty,
          req_qty: record.req_qty ?? -1,
          defective_qty: record.defective_qty ?? 0,
          parts: record.parts,
          machines: record.machines,
        }));

        setMachineParts(processedParts);

      }

    } catch (error) {
      toast.error("Failed to refresh components");
    } finally {
      setLoading(false);
    }
  }, [selectedMachineId, filters]);

  // Handle initial URL parameter loading
  useEffect(() => {
    const factoryParam = searchParams.get('factory');
    if (factoryParam && factories.length > 0) {
      const factoryId = Number(factoryParam);
      if (factories.some(f => f.id === factoryId)) {
        setSelectedFactoryId(factoryId);
      }
    }
  }, [searchParams, factories]);

  // Load sections when factory is selected from URL
  useEffect(() => {
    const loadSectionsFromUrl = async () => {
      const sectionParam = searchParams.get('section');
      if (selectedFactoryId && sectionParam) {
        try {
          const sections = await fetchFactorySections(selectedFactoryId);
          setFactorySections(sections);
          
          const sectionId = Number(sectionParam);
          if (sections.some(s => s.id === sectionId)) {
            setSelectedFactorySectionId(sectionId);
          }
        } catch (error) {
          console.error("Failed to load factory sections from URL");
        }
      }
    };
    loadSectionsFromUrl();
  }, [selectedFactoryId, searchParams]);

  // Load machines when section is selected from URL
  useEffect(() => {
    const loadMachinesFromUrl = async () => {
      const machineParam = searchParams.get('machine');
      if (selectedFactorySectionId && machineParam) {
        try {
          const machinesList = await fetchAllMachineIdNames(selectedFactorySectionId);
          setMachines(machinesList);
          
          const machineId = Number(machineParam);
          if (machinesList.some(m => m.id === machineId)) {
            setSelectedMachineId(machineId);
          }
        } catch (error) {
          console.error("Failed to load machines from URL");
        }
      }
    };
    loadMachinesFromUrl();
  }, [selectedFactorySectionId, searchParams]);

  // Load machine details when selectedMachineId changes
  useEffect(() => {
    const loadMachineData = async () => {
      if (!selectedMachineId) {
        setSelectedMachine(undefined);
        return;
      }

      try {
        const machine = await fetchMachineById(selectedMachineId);
        if (machine) {
          setSelectedMachine(machine);
        }
      } catch (error) {
        console.error("Error fetching machine:", error);
        setSelectedMachine(undefined);
      }
    };

    loadMachineData();
  }, [selectedMachineId]);

  useEffect(() => {
    // Fetch factories when the component mounts
    const loadFactories = async () => {
      try {
        const fetchedFactories = await fetchFactories();
        setFactories(fetchedFactories);
      } catch (error) {
        toast.error("Failed to load factories");
      }
    };
    loadFactories();
  }, []);

  useEffect(() => {
    // Fetch factory sections when a factory is selected
    const loadFactorySections = async () => {
      if (selectedFactoryId === undefined) {
        setFactorySections([]);
        setSectionsLoading(false);
        // Only reset section if not loading from URL
        if (!searchParams.get('section')) {
          setSelectedFactorySectionId(undefined);
        }
        return;
      }
      
      // Load factory sections immediately for better performance
      try {
        // Check cache first
        if (sectionsCache.current.has(selectedFactoryId)) {
          const cachedSections = sectionsCache.current.get(selectedFactoryId);
          if (cachedSections) {
            setFactorySections(cachedSections);
            setSectionsLoading(false);
            return;
          }
        }
        
        setSectionsLoading(true);
        const fetchedSections = await fetchFactorySections(selectedFactoryId);
        setFactorySections(fetchedSections);
        
        // Cache the result
        sectionsCache.current.set(selectedFactoryId, fetchedSections);
      } catch (error) {
        toast.error("Failed to load factory sections");
      } finally {
        setSectionsLoading(false);
      }
    };
    
    loadFactorySections();
  }, [selectedFactoryId, searchParams]);

  useEffect(() => {
    const loadMachinesEffect = async () => {
      loadMachines(selectedFactorySectionId);
    };
    loadMachinesEffect();
  }, [selectedFactorySectionId, loadMachines]);

  useEffect(() => {
    const loadParts = async () => {
      if (selectedMachineId == undefined) {
        setMachineParts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const fetchedParts = await fetchMachineParts(
          selectedMachineId,
          filters.partIdQuery || undefined,
          filters.partNameQuery || undefined
        );

        const processedParts = fetchedParts.map((record: any) => ({
          id: record.id,
          machine_id: record.machine_id,
          part_id: record.parts.id,
          qty: record.qty,
          req_qty: record.req_qty ?? -1,
          defective_qty: record.defective_qty ?? 0,
          parts: record.parts,
          machines: record.machines,
        }));

        setMachineParts(processedParts);
      } catch (error) {
        toast.error("Failed to fetch parts");
      } finally {
        setLoading(false);
      }
    };
    loadParts();
  }, [selectedMachineId, filters]);

  // New function to handle machine selection

  const handleRowSelection = (factoryId: number, factorySectionId: number, machineId: number) => {
    setSelectedFactoryId(factoryId);
    setSelectedFactorySectionId(factorySectionId);
    setSelectedMachineId(machineId);
    updateUrlParams(factoryId, factorySectionId, machineId);
    setMachineParts([]);
  };

  const handleSelectMachine = async (value: string) => {
    const machineId = value == "" ? undefined : Number(value);
    setSelectedMachineId(machineId);
    updateUrlParams(selectedFactoryId, selectedFactorySectionId, machineId);
    setMachineParts([]);
  };

  if (loading) {
    return (
      <div className="flex flex-row justify-center p-5">
        <Loader2 className="animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <>
      <NavigationBar />
      <div className="flex w-full flex-col bg-muted/40">
        <main className="mt-2 p-4 sm:px-6 sm:py-0">
          {/* Container for selections, machine status, and running orders */}
          <div className="flex flex-col sm:flex-row items-stretch gap-4 h-full">

            {/* Selections Section */}
            <div className="flex-none min-w-72 max-w-96 w-1/6"> {/* Roughly 1/6th of the width */}
              <Card className="mb-4 h-full">
                <CardHeader>
                  <CardTitle>Machine Details</CardTitle>
                </CardHeader>

                <CardContent>
                  {/* Factory Selection Dropdown */}
                  <div className="mb-4">
                    <Label className="mb-2">Select Factory</Label>
                    <Select
                      value={selectedFactoryId === undefined ? "" : selectedFactoryId.toString()}
                      onValueChange={async (value) => {
                        const factoryId = value === "" ? undefined : Number(value);
                        setFactoryLoading(true);
                        setSelectedFactoryId(factoryId);
                        setSelectedFactorySectionId(undefined);
                        setSelectedMachineId(undefined);
                        setMachineParts([]);
                        // clear any dependent data
                        setSelectedMachine(undefined);
                        updateUrlParams(factoryId, undefined, undefined);
                        setFactoryLoading(false);
                      }}
                      disabled={factoryLoading}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue>
                          {factoryLoading 
                            ? <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processing...</div>
                            : selectedFactoryId === undefined
                              ? "Select a Factory"
                              : factories.find((f) => f.id === selectedFactoryId)?.name}
                        </SelectValue>
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

                  {/* Factory Section Selection Dropdown */}
                 
                    <div className="mb-4">
                      <Label className="mb-2">Select Factory Section</Label>
                      <Select
                        value={selectedFactorySectionId === undefined ? "" : selectedFactorySectionId.toString()}
                        onValueChange={(value) => {
                          const sectionId = value === "" ? undefined : Number(value);
                          setSelectedFactorySectionId(sectionId);
                          setSelectedMachineId(undefined);
                          setMachineParts([]);
                          // clear any dependent data
                          setSelectedMachine(undefined);
                          updateUrlParams(selectedFactoryId, sectionId, undefined);
                        }}
                        disabled={sectionsLoading}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue>
                            {sectionsLoading 
                              ? <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading sections...</div>
                              : selectedFactorySectionId === undefined
                                ? "Select a Section"
                                : factorySections.find((s) => s.id === selectedFactorySectionId)?.name}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {factorySections.map((section) => (
                            <SelectItem key={section.id} value={section.id.toString()}>
                              {section.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  

                  {/* Machine Selection Dropdown */}
                  
                    <div className="mb-4">
                      <Label className="mb-2">Select Machine</Label>
                      <Select
                        value={selectedMachineId === undefined ? "" : selectedMachineId.toString()}
                        onValueChange={handleSelectMachine}
                        disabled={machinesLoading}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue>
                            {machinesLoading 
                              ? <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading machines...</div>
                              : selectedMachineId === undefined
                                ? "Select a Machine"
                                : machines.find((m) => m.id === selectedMachineId)?.name}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {sortedMachines.map((machine) => (
                            <SelectItem key={machine.id} value={machine.id.toString()}>
                              {machine.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                
                  {/* Reset Button */}
                  <Button
                    className="mt-4"
                    variant="outline"
                    onClick={() => {
                      // Reset all fields to their initial state
                      setSelectedFactoryId(undefined);
                      setSelectedFactorySectionId(undefined);
                      setSelectedMachineId(undefined);
                      setMachineParts([]);
                      setSearchParams({}); // Clear all URL parameters
                      clearCache(); // Clear cache on reset
                    }}
                  >
                    Reset And Show All Statuses
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Machine Status Section - Always visible */}
            <div className="w-80 flex-shrink-0">
              <MachineStatus machineId={selectedMachineId} />
            </div>
            
            {/* Running Orders Section */}
            <RunningOrders machine={selectedMachine} />
          </div>

          {
            selectedFactoryId === undefined ? (
              <div className="mt-3">
                <Card className="min-h-[350px]">
                  <CardHeader>
                    <CardTitle>Machine Status Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center items-center h-32 text-muted-foreground">
                      Please select a factory to view machine status
                    </div>
                  </CardContent>
                </Card>
              </div>
            ): selectedFactorySectionId === undefined ? (
                <AllMachinesStatus
                  factoryId={selectedFactoryId}
                  handleRowSelection={handleRowSelection}
                />
            ): selectedMachineId === undefined ? (
                <AllMachinesStatus
                  factoryId={selectedFactoryId}
                  factorySectionId={selectedFactorySectionId}
                  handleRowSelection={handleRowSelection}
                />         
            ) : (
              <div className="w-full mt-4">
                <MachinePartsTable
                  MachineParts={MachineParts}
                  onApplyFilters={setFilters}
                  onResetFilters={() => setFilters({})}
                  onRefresh={refreshComponents}
                  selectedMachine={selectedMachine}
                />
              </div>
          )}
        </main>
      </div>
    </>
  );
};

export default MachinePartsPage;
