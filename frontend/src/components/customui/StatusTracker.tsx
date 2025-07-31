import { MoveDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "../ui/card";
import { StatusTrackerItem, StatusTrackerItemProp } from "./StatusTrackerItem";
import { useEffect, useState } from "react";
import { fetchStatuses } from "@/services/StatusesService";
import { fetchStatusTrackerByID } from "@/services/StatusTrackerService";
import {
  getStatusDataForWorkflow,
  getStatusDurations,
  getWorkflowProgress
} from "@/services/helper";
import { supabase_client } from "@/services/SupabaseClient";
import { Order } from "@/types";

interface StatusTrackerProp {
  order: Order;
}

const StatusTracker: React.FC<StatusTrackerProp> = ({ order }) => {
  const [mergedStatuses, setMergedStatuses] = useState<StatusTrackerItemProp[]>([]);

  const fetchData = async () => {
    const allStatuses = await fetchStatuses();
    const statusTracker = await fetchStatusTrackerByID(order.id);
    const merged = getStatusDataForWorkflow(
      allStatuses,
      statusTracker,
      order.order_workflows.status_sequence
    );
    setMergedStatuses(merged);
  };

  useEffect(() => {
    const channel = supabase_client
      .channel("status_tracker-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "status_tracker"
        },
        () => {
          console.log("Status Tracker Change Detected – Refetching");
          fetchData();
        }
      )
      .subscribe();

    fetchData();

    return () => {
      supabase_client.removeChannel(channel);
    };
  }, [order.id]);

  const { elapsedDays, totalDaysToCompletion } = getStatusDurations(mergedStatuses);
  const { completedCount, totalCount } = getWorkflowProgress(
    order.order_workflows.status_sequence,
    order.current_status_id
  );

  return (
    <Card className="h-[60vh] flex flex-col border shadow-sm overflow-hidden">
      <CardHeader className="sticky top-0 z-10 bg-muted border-b px-6 py-5 space-y-2">
        <div className="grid grid-cols-2 gap-4 items-start">
          <div>
            <CardTitle className="text-xl font-bold whitespace-nowrap">
              Status Tracker
            </CardTitle>
            <CardDescription className="whitespace-nowrap">
              {(totalDaysToCompletion !== null || elapsedDays !== null) && (
                <div className="text-sm text-muted-foreground pt-2">
                  {totalDaysToCompletion !== null ? (
                    <>✅ Completed in <strong>{totalDaysToCompletion}</strong> day{totalDaysToCompletion !== 1 ? "s" : ""}</>
                  ) : (
                    <>⏳ <strong>{elapsedDays}</strong> day{elapsedDays !== 1 ? "s" : ""} since started</>
                  )}
                </div>
              )}
            </CardDescription>
          </div>
          {totalCount > 0 && (
            <div className="text-right">
              <div className="text-3xl font-medium text-primary leading-none">
                {completedCount} / {totalCount}
              </div>
              <div className="text-sm text-muted-foreground mt-1">completed</div>
            </div>
          )}
        </div>
      </CardHeader>





      {/* Status List */}
      <CardContent className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {mergedStatuses.map((status, index) => (
          <div key={index} className="relative">
            <StatusTrackerItem
              status={status.status}
              action_at={status.action_at}
              action_by={status.action_by}
              complete={status.complete}
            />
            {index < mergedStatuses.length - 1 && (
              <div className="flex justify-center my-2">
                <MoveDown className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default StatusTracker;
