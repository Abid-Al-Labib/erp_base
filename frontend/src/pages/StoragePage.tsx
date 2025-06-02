import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchStorageParts } from "@/services/StorageService";
import { fetchDamagedPartsByFactoryID } from "@/services/DamagedGoodsService";
import { fetchFactories } from "@/services/FactoriesService";
import { Factory, StoragePart } from "@/types";
import SearchAndFilter from "@/components/customui/SearchAndFilter";
import StoragePartsRow from "@/components/customui/StoragePartsRow";
import NavigationBar from "@/components/customui/NavigationBar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 10;

const StoragePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [storageParts, setStorageParts] = useState<StoragePart[]>([]);
  const [damagedParts, setDamagedParts] = useState<StoragePart[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loadingStorage, setLoadingStorage] = useState(false);
  const [loadingDamaged, setLoadingDamaged] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "storage");
  const [selectedFactoryId, setSelectedFactoryId] = useState<number | undefined>(
    searchParams.get("factory") ? Number(searchParams.get("factory")) : undefined
  );
  const [totalItems, setTotalItems] = useState(0);

  // Load factories on component mount
  useEffect(() => {
    const loadFactories = async () => {
      try {
        const factoriesData = await fetchFactories();
        setFactories(factoriesData);
      } catch (error) {
        console.error("Error loading factories:", error);
      }
    };
    loadFactories();
  }, []);

  // Update URL when factory or tab changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (selectedFactoryId) {
      params.set("factory", selectedFactoryId.toString());
    } else {
      params.delete("factory");
    }
    params.set("tab", activeTab);
    setSearchParams(params);
  }, [selectedFactoryId, activeTab]);

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

      if (activeTab === "storage") {
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
      } else {
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
    };

    loadPartsData();
  }, [selectedFactoryId, activeTab, searchParams]);

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

  const currentPage = Number(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <>
      <NavigationBar />
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <main className="p-4 sm:px-6 sm:py-0 mt-2">
          {/* Factory Selection Dropdown */}
          <div className="mb-4">
            <Label className="mb-2">Select Factory</Label>
            <Select
              value={selectedFactoryId === undefined ? "" : selectedFactoryId.toString()}
              onValueChange={(value) => setSelectedFactoryId(value === "" ? undefined : Number(value))}
            >
              <SelectTrigger className="w-[220px] mt-2">
                <SelectValue>
                  {selectedFactoryId === undefined ? "Select a Factory" : factories.find(f => f.id === selectedFactoryId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {factories.map(factory => (
                  <SelectItem key={factory.id} value={factory.id.toString()}>
                    {factory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedFactoryId === undefined ? (
            <div className="text-center text-lg">Please select a factory to view parts</div>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <CardTitle>{activeTab === "storage" ? "Storage Parts" : "Damaged Parts"}</CardTitle>
                    <CardDescription>
                      {activeTab === "storage" ? "View and manage parts in storage" : "View and manage damaged parts"}
                    </CardDescription>
                  </div>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="inline-flex h-10 w-[300px] items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      <TabsTrigger value="storage" className="w-[140px]">Storage Parts</TabsTrigger>
                      <TabsTrigger value="damaged" className="w-[140px]">Damaged Parts</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <SearchAndFilter 
                  filterConfig={[
                    { type: 'partName', label: 'Part Name' },
                    { type: 'partId', label: 'Part ID' },
                  ]}
                />
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
                    {(activeTab === "storage" ? loadingStorage : loadingDamaged) ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Loading {activeTab === "storage" ? "storage" : "damaged"} parts...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      (activeTab === "storage" ? storageParts : damagedParts).map((part) => (
                        <StoragePartsRow key={part.id} part={part} isDamaged={activeTab === "damaged"} />
                      ))
                    )}
                  </TableBody>
                </Table>
                {!(activeTab === "storage" ? loadingStorage : loadingDamaged) && totalPages > 1 && (
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
        </main>
      </div>
    </>
  );
};

export default StoragePage;