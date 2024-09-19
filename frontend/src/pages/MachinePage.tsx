// MachinePartsPage.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fetchFactories } from "@/services/FactoriesService";
import { fetchMachineParts } from "@/services/MachinePartsService";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import MachinePartsTable from "@/components/customui/MachinePartsTable";
import NavigationBar from "@/components/customui/NavigationBar";

type MachinePart = {
  machinePartId: number;
  id: number;
  name: string;
  description: string;
  qty: number;
  machine_name: string;
};

const MachinePartsPage = () => {
  const [parts, setParts] = useState<MachinePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    const loadParts = async () => {
      try {

        const fetchedParts = await fetchMachineParts(
          filters.selectedMachineId || undefined,
          filters.partIdQuery || undefined,
          filters.partNameQuery || undefined,

        );

        const processedParts = fetchedParts.map((record: any) => ({
          machinePartId: record.id,
          id: record.parts.id,
          name: record.parts.name,
          description: record.parts.description,
          qty: record.qty,
          machine_name: record.machine_id, // adjust if machine_name is available
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
            <MachinePartsTable
              parts={parts}
              onApplyFilters={setFilters}
              onResetFilters={() => setFilters({})}
            />
          )}
        </main>
        <div className="flex justify-end">
          <div className="my-3 mx-3">
            <Link to={'/machines'}>
              <Button>Back To Machines</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default MachinePartsPage;
