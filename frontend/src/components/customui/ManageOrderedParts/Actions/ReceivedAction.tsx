import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { updateMachinePartQty } from "@/services/MachinePartsService"
import { updateReceivedByFactoryDateByID } from "@/services/OrderedPartsService"
import { updateStoragePartQty } from "@/services/StorageService"
import { OrderedPart } from "@/types"
import { useState } from "react"
import toast from "react-hot-toast"

interface ReceivedActionProps {
  openThisActionDialog: boolean
  setOpenThisActionDialog: (v: boolean) => void
  setActionMenuOpen: (v: boolean) => void
  orderedPartInfo: OrderedPart
  order_type: string
  factory_id: number
  machine_id: number
}

const ReceivedAction: React.FC<ReceivedActionProps> = ({
  openThisActionDialog,
  setOpenThisActionDialog,
  setActionMenuOpen,
  orderedPartInfo,
  order_type,
  factory_id,
  machine_id
}) => {
  const [dateReceived, setDateReceived] = useState<Date | undefined>(
    orderedPartInfo.part_received_by_factory_date
      ? new Date(orderedPartInfo.part_received_by_factory_date)
      : new Date()
  )

  const handleUpdateReceivedDate = () => {
    const updateReceivedDate = async () => {
      if (dateReceived && orderedPartInfo.part_sent_by_office_date) {
        const receivedDateStr = new Date(dateReceived).toDateString()
        const sentDateStr = new Date(orderedPartInfo.part_sent_by_office_date).toDateString()

        if (receivedDateStr >= sentDateStr) {
          try {
            await updateReceivedByFactoryDateByID(orderedPartInfo.id, dateReceived)
            toast.success("Part received by factory date set!")

            if (order_type === "Storage") {
              await updateStoragePartQty(orderedPartInfo.part_id,factory_id,orderedPartInfo.qty,"add")
            }

            if (order_type === "Machine") {
              await updateMachinePartQty(machine_id,orderedPartInfo.part_id,orderedPartInfo.qty,"add")
            }
          } catch (error) {
            toast.error("Error occurred, could not complete action")
          }
        } else {
          toast.error("Received date must be after or equal to sent date")
        }
      } else {
        toast.error("Received date or sent date was not found")
      }
    }

    updateReceivedDate()
    setOpenThisActionDialog(false)
    setActionMenuOpen(false)
  }

  return (
    <Dialog open={openThisActionDialog} onOpenChange={setOpenThisActionDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>Date when part was received at Factory</DialogTitle>
        <DialogDescription>
          <span className="text-sm">{orderedPartInfo.parts.name}</span>
        </DialogDescription>
        <Calendar
          mode="single"
          selected={dateReceived}
          onSelect={setDateReceived}
          className="rounded-md border"
        />
        <Button onClick={handleUpdateReceivedDate}>Confirm</Button>
      </DialogContent>
    </Dialog>
  )
}

export default ReceivedAction
