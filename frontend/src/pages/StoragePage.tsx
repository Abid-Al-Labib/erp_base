import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fetchFactories } from "@/services/FactoriesService";
import { fetchStorageParts } from "@/services/StorageService";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import StoragePartsTable from "@/components/customui/StoragePartsTable";
import NavigationBar from "@/components/customui/NavigationBar";

type StoragePart = {
  storageId: number;
  id: number;
  name: string;
  description: string;
  qty: number;
  factory_name: string;
};

const StoragePage = () => {
  const [parts, setParts] = useState<StoragePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    const loadParts = async () => {
      try {
        const factories = await fetchFactories();
        const factoryMap: { [key: number]: string } = {};
        factories.forEach((factory: { id: number; name: string }) => {
          factoryMap[factory.id] = factory.name;
        });

        const fetchedParts = await fetchStorageParts(
          filters.selectedFactoryId || undefined,
          filters.storageIdQuery || undefined,
          filters.partNameQuery || undefined,
          filters.partIdQuery || undefined
        );

        const processedParts = fetchedParts.map((record: any) => ({
          storageId: record.id,
          id: record.parts.id,
          name: record.parts.name,
          description: record.parts.description,
          qty: record.qty,
          factory_name: factoryMap[record.factory_id],
        }));

        if (processedParts.length > 0) {
          setParts(processedParts);
        } else {
          toast.error("No parts found");
        }
      } catch (error) {
        toast.error("Failed to fetch parts");
      } finally {
        setLoading(false);
      }
    };

    loadParts();
  }, [filters]);

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
      <div className="flex w-full flex-col bg-muted/40 mt-2">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0">
          {parts.length === 0 ? (
            <div>No parts found</div>
          ) : (
            <StoragePartsTable
              parts={parts}
              onApplyFilters={setFilters} // Filters are managed within StoragePartsTable
              onResetFilters={() => setFilters({})}
            />
          )}
        </main>
        <div className="flex justify-end">
          <div className="my-3 mx-3">
            <Link to={'/factories'}>
              <Button>Back To Factories</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default StoragePage;
