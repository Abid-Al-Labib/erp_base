import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { fetchStorageParts, upsertStoragePart } from "@/services/StorageService";
import { fetchDamagedPartsByFactoryID, upsertDamagedPart } from "@/services/DamagedGoodsService";
import { fetchFactories } from "@/services/FactoriesService";
import { fetchAllParts, searchPartsByName } from "@/services/PartsService";
import { Factory, StoragePart, Part } from "@/types";
import SearchAndFilter from "@/components/customui/SearchAndFilter";
import StoragePartsRow from "@/components/customui/StoragePartsRow";
import NavigationBar from "@/components/customui/NavigationBar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import AsyncSelect from 'react-select/async';

const ITEMS_PER_PAGE = 10;

const StoragePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [storageParts, setStorageParts] = useState<StoragePart[]>([]);
  const [damagedParts, setDamagedParts] = useState<StoragePart[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [allParts, setAllParts] = useState<Part[]>([]);
  const [loadingStorage, setLoadingStorage] = useState(false);
  const [loadingDamaged, setLoadingDamaged] = useState(false);
  
  // Main tab state - storage, damaged, or repair
  const [mainTab, setMainTab] = useState(searchParams.get("mainTab") || "storage");
  
  const [selectedFactoryId, setSelectedFactoryId] = useState<number | undefined>(
    searchParams.get("factory") ? Number(searchParams.get("factory")) : undefined
  );
  const [totalItems, setTotalItems] = useState(0);

  // Add part to storage dialog state
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | undefined>();
  const [quantity, setQuantity] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingParts, setIsLoadingParts] = useState(false);

  // Load factories and parts on component mount
  useEffect(() => {
    const loadFactories = async () => {
      try {
        const factoriesData = await fetchFactories();
        setFactories(factoriesData);
      } catch (error) {
        console.error("Error loading factories:", error);
      }
    };

    const loadAllParts = async () => {
      try {
        const partsData = await fetchAllParts();
        setAllParts(partsData);
      } catch (error) {
        console.error("Error loading parts:", error);
      }
    };

    loadFactories();
    loadAllParts();
  }, []);

  // Update URL when factory or tab changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (selectedFactoryId) {
      params.set("factory", selectedFactoryId.toString());
    } else {
      params.delete("factory");
    }
    params.set("mainTab", mainTab);
    setSearchParams(params);
  }, [selectedFactoryId, mainTab]);

  // Load parts data when factory is selected, tab changes, or search params change
  useEffect(() => {
    const loadPartsData = async () => {
      if (!selectedFactoryId) {
        setStorageParts([]);
        setDamagedParts([]);
        return;
      }

      const page = Number(searchParams.get("page")) || 1;
      const partName = searchParams.get("partName") || undefined;
      const partId = searchParams.get("partId") ? Number(searchParams.get("partId")) : undefined;

      if (mainTab === "storage") {
        setLoadingStorage(true);
        try {
          const { data, count } = await fetchStorageParts({
            factoryId: selectedFactoryId,
            partName,
            partId,
            page,
            limit: ITEMS_PER_PAGE
          });
          setStorageParts(data);
          setTotalItems(count || 0);
        } catch (error) {
          console.error("Error loading storage parts:", error);
        } finally {
          setLoadingStorage(false);
        }
      } else if (mainTab === "damaged") {
        setLoadingDamaged(true);
        try {
          const { data, count } = await fetchDamagedPartsByFactoryID({
            factoryId: selectedFactoryId,
            partName: partName || null,
            partId: partId || null,
            page,
            limit: ITEMS_PER_PAGE
          });
          setDamagedParts(data);
          setTotalItems(count || 0);
        } catch (error) {
          console.error("Error loading damaged parts:", error);
        } finally {
          setLoadingDamaged(false);
        }
      }
      // Note: Repair management will have its own data loading logic when implemented
    };

    loadPartsData();
  }, [selectedFactoryId, mainTab, searchParams]);

  const handleSearch = async (partName: string | null, partId: number | null) => {
    if (!selectedFactoryId) return;

    const params = new URLSearchParams(searchParams);
    if (partName) params.set("partName", partName);
    else params.delete("partName");
    if (partId) params.set("partId", partId.toString());
    else params.delete("partId");
    params.set("page", "1"); // Reset to first page on new search
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
  };

  const handleAddPartToStorage = async () => {
    if (!selectedPart || !quantity || !selectedFactoryId) {
      toast.error("Please select a part and enter quantity");
      return;
    }

    const quantityNum = Number(quantity);
    if (quantityNum <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mainTab === "storage") {
        await upsertStoragePart(selectedPart.id, selectedFactoryId, quantityNum);
        toast.success("Part added to storage successfully");
      } else if (mainTab === "damaged") {
        await upsertDamagedPart(selectedPart.id, selectedFactoryId, quantityNum);
        toast.success("Part added to damaged parts successfully");
      }
      
      // Reset form
      setSelectedPart(undefined);
      setQuantity("");
      setIsAddPartDialogOpen(false);
      
      // Reload current tab data
      refreshCurrentData();
    } catch (error) {
      console.error("Error adding part:", error);
      toast.error(`Failed to add part to ${mainTab === "storage" ? "storage" : "damaged parts"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create default options for AsyncSelect - sorted alphabetically
  const allPartOptions = allParts
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((part) => ({
      value: part,
      label: `${part.name} (${part.unit || 'units'})`,
    }));

  const currentPage = Number(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Add this function to refresh the current data
  const refreshCurrentData = async () => {
    if (!selectedFactoryId) return;

    const page = Number(searchParams.get("page")) || 1;
    const partName = searchParams.get("partName") || undefined;
    const partId = searchParams.get("partId") ? Number(searchParams.get("partId")) : undefined;

    if (mainTab === "storage") {
      setLoadingStorage(true);
      try {
        const { data, count } = await fetchStorageParts({
          factoryId: selectedFactoryId,
          partName,
          partId,
          page,
          limit: ITEMS_PER_PAGE
        });
        setStorageParts(data);
        setTotalItems(count || 0);
      } catch (error) {
        console.error("Error reloading storage parts:", error);
      } finally {
        setLoadingStorage(false);
      }
    } else if (mainTab === "damaged") {
      setLoadingDamaged(true);
      try {
        const { data, count } = await fetchDamagedPartsByFactoryID({
          factoryId: selectedFactoryId,
          partName: partName || null,
          partId: partId || null,
          page,
          limit: ITEMS_PER_PAGE
        });
        setDamagedParts(data);
        setTotalItems(count || 0);
      } catch (error) {
        console.error("Error reloading damaged parts:", error);
      } finally {
        setLoadingDamaged(false);
      }
    }
  };

  return (
    <>
      <NavigationBar />
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <main className="p-4 sm:px-6 sm:py-0 mt-2">
          {/* Top Level Controls */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              {/* Main Tab Switcher */}
              <Tabs value={mainTab} onValueChange={setMainTab}>
                <TabsList className="inline-flex h-12 w-[600px] items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <TabsTrigger value="storage" className="w-[190px] text-base">Storage Management</TabsTrigger>
                  <TabsTrigger value="damaged" className="w-[190px] text-base">Damaged Management</TabsTrigger>
                  <TabsTrigger value="repair" className="w-[190px] text-base">Repair Management</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Factory Selection */}
              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">
                  {mainTab === "repair" ? "Factory Filter:" : "Select Factory:"}
                </Label>
                <Select
                  value={selectedFactoryId === undefined ? (mainTab === "repair" ? "all" : "") : selectedFactoryId.toString()}
                  onValueChange={(value) => setSelectedFactoryId(value === "" || value === "all" ? undefined : Number(value))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue>
                      {selectedFactoryId === undefined ? 
                        (mainTab === "repair" ? "All Factories" : "Select a Factory") : 
                        factories.find(f => f.id === selectedFactoryId)?.name
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {mainTab === "repair" && <SelectItem value="all">All Factories</SelectItem>}
                    {factories.map(factory => (
                      <SelectItem key={factory.id} value={factory.id.toString()}>
                        {factory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

                    {(mainTab === "storage" || mainTab === "damaged") && selectedFactoryId === undefined ? (
            <div className="text-center text-lg">Please select a factory to view parts</div>
          ) : (
            <>
              {/* Storage Management Section */}
              {mainTab === "storage" && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <CardTitle>Storage Parts</CardTitle>
                        <CardDescription>View and manage parts in storage</CardDescription>
                      </div>
                      <SearchAndFilter 
                        filterConfig={[
                          { type: 'partName', label: 'Part Name' },
                          { type: 'partId', label: 'Part ID' },
                        ]}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <Button 
                        onClick={() => setIsAddPartDialogOpen(true)}
                        className="bg-blue-700 hover:bg-blue-800"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Part
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Part ID</TableHead>
                          <TableHead>Part Name</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead className="text-right">
                            <span className="sr-only">Actions</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingStorage ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Loading storage parts...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          storageParts.map((part) => (
                            <StoragePartsRow 
                              key={part.id} 
                              part={part} 
                              isDamaged={false} 
                              onDelete={refreshCurrentData}
                            />
                          ))
                        )}
                      </TableBody>
                    </Table>
                    {!loadingStorage && totalPages > 1 && (
                      <div className="flex items-center justify-center space-x-2 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Damaged Parts Section */}
              {mainTab === "damaged" && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <CardTitle>Damaged Parts</CardTitle>
                        <CardDescription>View and manage damaged parts</CardDescription>
                      </div>
                      <SearchAndFilter 
                        filterConfig={[
                          { type: 'partName', label: 'Part Name' },
                          { type: 'partId', label: 'Part ID' },
                        ]}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <Button 
                        onClick={() => setIsAddPartDialogOpen(true)}
                        className="bg-blue-700 hover:bg-blue-800"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Damaged Part
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Part ID</TableHead>
                          <TableHead>Part Name</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead className="text-right">
                            <span className="sr-only">Actions</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingDamaged ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Loading damaged parts...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          damagedParts.map((part) => (
                            <StoragePartsRow 
                              key={part.id} 
                              part={part} 
                              isDamaged={true} 
                              onDelete={refreshCurrentData}
                            />
                          ))
                        )}
                      </TableBody>
                    </Table>
                    {!loadingDamaged && totalPages > 1 && (
                      <div className="flex items-center justify-center space-x-2 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Repair Management Section */}
              {mainTab === "repair" && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Repair Orders Management</CardTitle>
                      <CardDescription>Track ongoing repairs and manage repair status across all factories</CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button 
                        onClick={() => {/* TODO: Create new repair order */}}
                        className="bg-green-700 hover:bg-green-800"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Repair Order
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Factory</TableHead>
                          <TableHead>Part Name</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created Date</TableHead>
                          <TableHead>Expected Completion</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Placeholder data - this will be replaced with actual repair orders */}
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex flex-col items-center space-y-2 text-muted-foreground">
                              <div className="text-lg">No repair orders found</div>
                              <div className="text-sm">Repair orders will appear here once the backend functionality is implemented</div>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </main>
      </div>

      {/* Add Part Dialog */}
      <Dialog open={isAddPartDialogOpen} onOpenChange={setIsAddPartDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {mainTab === "storage" ? "Add Part to Storage" : "Add Damaged Part"}
            </DialogTitle>
            <DialogDescription>
              Add a part to the {mainTab === "storage" ? "storage" : "damaged parts"} of {factories.find(f => f.id === selectedFactoryId)?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="part-select">Select Part</Label>
              <AsyncSelect
                id="part-select"
                cacheOptions
                defaultOptions={allPartOptions}
                loadOptions={async (inputValue: string) => {
                  if (!inputValue) {
                    return allPartOptions;
                  }
                  
                  setIsLoadingParts(true);
                  try {
                    const response = await searchPartsByName(inputValue);
                    return response
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((part) => ({
                        value: part,
                        label: `${part.name} (${part.unit || 'units'})`,
                      }));
                  } catch (error) {
                    console.error("Error searching parts:", error);
                    return [];
                  } finally {
                    setIsLoadingParts(false);
                  }
                }}
                onChange={(selectedOption) => {
                  setSelectedPart(selectedOption?.value);
                }}
                placeholder="Search or Select a Part"
                className="mt-1"
                isSearchable
                isLoading={isLoadingParts}
                value={selectedPart ? { value: selectedPart, label: `${selectedPart.name} (${selectedPart.unit || 'units'})` } : null}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="quantity">
                Quantity{selectedPart ? ` (${selectedPart.unit || 'units'})` : ''}
              </Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddPartDialogOpen(false);
                setSelectedPart(undefined);
                setQuantity("");
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddPartToStorage}
              disabled={isSubmitting || !selectedPart || !quantity}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                `Add to ${mainTab === "storage" ? "Storage" : "Damaged Parts"}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StoragePage;