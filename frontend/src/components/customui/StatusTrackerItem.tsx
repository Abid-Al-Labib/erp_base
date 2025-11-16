import { convertUtcToBDTime } from "@/services/helper";
import { Check, X } from "lucide-react";

export interface StatusTrackerItemProp {
  status: string;
  action_at: string | null;
  action_by: string | null;
  complete: boolean;
  isCurrent?: boolean;
}

export const StatusTrackerItem: React.FC<StatusTrackerItemProp> = ({
  status,
  action_at,
  action_by,
  complete,
  isCurrent,
}) => {
  const borderClass = complete
    ? "border-green-500 dark:border-green-600"
    : isCurrent
    ? "border-yellow-500 dark:border-yellow-600"
    : "border-destructive";

  return (
    <div className={`grid gap-1 rounded-lg p-2 border-2 ${borderClass}`}>
      <div className="font-semibold flex justify-between text-sm">
        {status}
        {complete ? (
          <Check className="text-green-500 dark:text-green-400 mr-1 w-4 h-4" />
        ) : isCurrent ? (
          <div className="rounded-full bg-yellow-400 dark:bg-yellow-500 w-3 h-3 mr-1" />
        ) : (
          <X className="text-destructive mr-1 w-4 h-4" />
        )}
      </div>

      <ul className="grid gap-1">
        {action_at && (
          <li className="flex items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground whitespace-nowrap">Action at</span>
            <span className="whitespace-nowrap">{convertUtcToBDTime(action_at)}</span>
          </li>
        )}
        {action_by && (
          <li className="flex items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground whitespace-nowrap">Action by</span>
            <span className="whitespace-nowrap">{action_by}</span>
          </li>
        )}
      </ul>
    </div>
  );
};
