// MachinePage.tsx
import { useCallback, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fetchFactories, fetchFactorySections, fetchAllFactorySections } from "@/services/FactoriesService";
import { fetchMachineParts } from "@/services/MachinePartsService";
import { fetchMachineById, fetchAllMachines } from "@/services/MachineServices";
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
  const [partsLoading, setPartsLoading] = useState(false);
  const [machineDetailsLoading, setMachineDetailsLoading] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [factories, setFactories] = useState<{ id: number; name: string }[]>([]);
  const [factorySections, setFactorySections] = useState<{ id: number; name: string }[]>([]);
  const [allSections, setAllSections] = useState<{ id: number; name: string; factory_id: number }[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [machineList, setMachineList] = useState<{ id: number; name: string }[]>([]);
  
  // Add loading states for better UX
  const [machinesLoading] = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [factoryLoading, setFactoryLoading] = useState(false);
  const [overviewLoading, setOverviewLoading] = useState<"factory" | "section" | null>(null);
  
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

  // Cache removed per updated requirements
  
  // Memoize sorted machine list to prevent unnecessary re-sorting
  const sortedMachineList = useMemo(() => {
    return [...machineList].sort((a, b) => a.id - b.id);
  }, [machineList]);
  
  // Reserve 'machines' for future enriched data; keep dependency to avoid linter warnings
  useEffect(() => {
    // no-op: machines will be enriched and used in future updates
  }, [machines]);
  
  // Build machine list from preloaded machines
  const loadMachines = useCallback((factorySectionId: number | undefined) => {
    if (factorySectionId !== undefined && factorySectionId !== -1) {
      const list = machines
        .filter((m) => m.factory_section_id === factorySectionId)
        .map((m) => ({ id: m.id, name: m.name }));
      setMachineList(list);
      if (!searchParams.get('machine')) {
        setSelectedMachineId(undefined);
      }
    } else {
      setMachineList([]);
      if (!searchParams.get('machine')) {
        setSelectedMachineId(undefined);
      }
    }
  }, [machines, searchParams]);
  
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
      setMachineDetailsLoading(true);

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
      setMachineDetailsLoading(false);
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

  // Clear overview loaders when relevant data is ready (handled in effects below)

  // Load sections when factory is selected from URL
  useEffect(() => {
    const loadSectionsFromUrl = async () => {
      const sectionParam = searchParams.get('section');
      if (selectedFactoryId && sectionParam) {
        try {
          let sections: { id: number; name: string }[] = [];
          if (allSections.length > 0) {
            sections = allSections.filter(s => s.factory_id === selectedFactoryId).map(s => ({ id: s.id, name: s.name }));
          } else {
            const fetched = await fetchFactorySections(selectedFactoryId);
            sections = fetched;
          }
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
  }, [selectedFactoryId, searchParams, allSections]);

  // Load machines when section is selected from URL
  useEffect(() => {
    const loadMachinesFromUrl = async () => {
      const machineParam = searchParams.get('machine');
      if (selectedFactorySectionId && machineParam) {
        try {
          // Build from preloaded machines
          const machinesList = machines
            .filter((m) => m.factory_section_id === selectedFactorySectionId)
            .map((m) => ({ id: m.id, name: m.name }));
          setMachineList(machinesList);
          
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
  }, [selectedFactorySectionId, searchParams, machines]);

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
    // Preload factories, sections, and machines on mount
    const preloadAll = async () => {
      try {
        const [fetchedFactories, fetchedSections, fetchedMachines] = await Promise.all([
          fetchFactories(),
          fetchAllFactorySections(),
          fetchAllMachines(),
        ]);
        setFactories(fetchedFactories);
        setAllSections(fetchedSections as { id: number; name: string; factory_id: number }[]);
        setMachines(fetchedMachines);
      } catch (error) {
        toast.error("Failed to preload data");
      }
    };
    preloadAll();
  }, []);

  useEffect(() => {
    // Filter sections client-side when a factory is selected
    if (selectedFactoryId === undefined) {
      setFactorySections([]);
      setSectionsLoading(false);
      if (!searchParams.get('section')) {
        setSelectedFactorySectionId(undefined);
      }
      return;
    }
    const filtered = allSections
      .filter((s) => s.factory_id === selectedFactoryId)
      .map((s) => ({ id: s.id, name: s.name }));
    setFactorySections(filtered);
    // sections ready; clear factory overview loader
    if (overviewLoading === "factory") setOverviewLoading(null);
  }, [selectedFactoryId, searchParams, allSections]);

  useEffect(() => {
    // Recompute machine list client-side when section changes
    loadMachines(selectedFactorySectionId);
    // machine list ready; clear section overview loader
    if (overviewLoading === "section") setOverviewLoading(null);
  }, [selectedFactorySectionId, loadMachines]);

  useEffect(() => {
    const loadParts = async () => {
      if (selectedMachineId == undefined) {
        setMachineParts([]);
        setPartsLoading(false);
        return;
      }

      setPartsLoading(true);
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
        setPartsLoading(false);
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
                        setOverviewLoading(factoryId ? "factory" : null);
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
                          setOverviewLoading(sectionId ? "section" : null);
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
                                : machineList.find((m) => m.id === selectedMachineId)?.name}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {sortedMachineList.map((machine) => (
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
                    }}
                  >
                    Reset And Show All Statuses
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Machine Status Section - Always visible */}
            <div className="w-80 flex-shrink-0">
              {machineDetailsLoading ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading machine status...
                </div>
              ) : (
                <MachineStatus machineId={selectedMachineId} />
              )}
            </div>
            
            {/* Running Orders Section */}
            {machineDetailsLoading ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading running orders...
              </div>
            ) : (
              <RunningOrders machine={selectedMachine} />
            )}
          </div>

          {selectedMachineId === undefined ? (
              <div className="mt-3">
                <AllMachinesStatus
                  factoryId={selectedFactoryId}
                  factorySectionId={selectedFactorySectionId}
                  handleRowSelection={handleRowSelection}
                  loadingMessage={overviewLoading === "factory" ? "Loading Factory Details" : overviewLoading === "section" ? "Loading Section Details" : undefined}
                />
              </div>
            ) : (
              <div className="w-full mt-4">
                
                  <MachinePartsTable
                    MachineParts={MachineParts}
                    onApplyFilters={setFilters}
                    onResetFilters={() => setFilters({})}
                    onRefresh={refreshComponents}
                    selectedMachine={selectedMachine}
                    loading={partsLoading}
                  />
                
              </div>
            )
          }
        </main>
      </div>
    </>
  );
};

export default MachinePartsPage;
