import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useState } from "react";
import toast from "react-hot-toast";
import { updateDamagePartQuantity } from "@/services/DamagedGoodsService"; // Assuming you have this service to handle saving
import { DamagedPart } from "@/types";

interface DamagedPartsRowProp {
  damagedPart: DamagedPart;
}

const DamagedPartsRow: React.FC<DamagedPartsRowProp> = ({ damagedPart }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [qty, setQty] = useState<number>(damagedPart.qty);
  const [isLoading, setIsLoading] = useState(false); // State for loading spinner

  const handleUpdate = async () => {
    if (qty===damagedPart.qty) {
        toast.error("There is no change in value to save")
    }
    else{
        setIsLoading(true); // Start loading
        try {
          await updateDamagePartQuantity(damagedPart.factory_id, damagedPart.part_id, qty);
          setIsEditing(false);
          toast.success("Quantity updated successfully.");
        } catch (error) {
          toast.error("Failed to update quantity.");
        } finally {
          setIsLoading(false); // Stop loading
        }
    }

  };

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQty = Number(e.target.value);
    if (newQty <= damagedPart.qty) {
      setQty(newQty);
    } else {
      toast.error("You can only lower the quantity.");
    }
  };

  return (
    <TableRow>
      <TableCell className="whitespace-nowrap">{damagedPart.parts.id}</TableCell>
      <TableCell className="whitespace-nowrap">
        <a className="hover:underline" target="_blank" href={`/viewpart/${damagedPart.parts.name}`}>
          {damagedPart.parts.name}
        </a>
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            type="number"
            value={qty}
            onChange={handleQtyChange}
            className="border p-1 rounded w-20"
            min={0}
          />
        ) : (
          <span>{qty}</span>
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <>
            <Button onClick={handleUpdate} className="ml-2" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <span className="loader mr-2" />
                  Saving...
                </div>
              ) : (
                "Save"
              )}
            </Button>
            <Button onClick={() => setIsEditing(false)} className="ml-2" disabled={isLoading}>
              Cancel
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)} className="ml-2">
            Dispose
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

export default DamagedPartsRow;
