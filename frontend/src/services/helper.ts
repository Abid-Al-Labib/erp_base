import { OrderedPart, Status, StatusTracker } from "@/types";

export function mergeStatusWithTracker(statuses: Status[],statusTracker: StatusTracker[])
{
  const sortedStatuses = statuses.sort((a, b) => a.id - b.id);
  const sortedStatusTracker = statusTracker.sort((a, b) => a.statuses.id - b.statuses.id);  
  return sortedStatuses.map((status) => {
        const trackerItem = sortedStatusTracker.find(
            (item) => item.statuses.id === status.id
        );

        if (trackerItem) {
            return {
                status: status.name,
                action_at: trackerItem.action_at,
                action_by: trackerItem.profiles.name,
                complete: true,
            };
        } else {
            return {
                status: status.name,
                action_at: null,
                action_by: null,
                complete: false,
            };
        }
    });
}


export const convertUtcToBDTime = (utcTimestamp: string): string => {
    // Create a Date object from the UTC timestamp
    const offset = 0
    const date = new Date(utcTimestamp);

    // Apply the offset in hours
    const localDate = new Date(date.getTime() + offset * 60 * 60 * 1000);

    // Format the local date and time
    return localDate.toLocaleString('en-GB', {
        year: 'numeric', // "2024"
        month: 'short', // "Aug"
        day: 'numeric', // "16"
        // below code commented out as we only need to display date for this system
        // hour: '2-digit', // "01"
        // minute: '2-digit', // "21"
        // hour12: true // Use 12-hour clock format
    });
};


export const isChangeStatusAllowed = (ordered_parts: OrderedPart[], current_status: string): boolean => {
    switch (current_status) {
      case "Pending":
        return ordered_parts.every(part => part.approved_pending_order === true);
  
      case "Order Sent To Head Office":
        return ordered_parts.every(part => part.approved_office_order === true);
  
      case "Waiting For Quotation":
        return ordered_parts.every(part => part.vendor !== null && part.unit_cost !== null);
  
      case "Budget Released":
        return ordered_parts.every(part => part.approved_budget === true);
  
      case "Waiting For Purchase":
        return ordered_parts.every(part => part.part_purchased_date !== null);
  
      case "Purchase Complete":
        return ordered_parts.every(part => part.part_sent_by_office_date !== null);
  
      case "Parts Sent To Factory":
        return ordered_parts.every(part => part.part_received_by_factory_date !== null);
      default:
        return false; 
    }
};

export const managePermission = (status: string, role: string): boolean => {
    switch (status) {
      case "Pending":
        if (role === "xyz") {
          return true;
        } else if (role === "xyz") {
          return true;
        } else if (role === "xyz") {
          return true;
        }
        break;
  
      case "Order Sent To Head Office":
        if (role === "xyz") {
          return true;
        } else if (role === "xyz") {
          return true;
        } else if (role === "xyz") {
          return true;
        }
        break;
  
      case "Waiting For Quotation":
        if (role === "xyz") {
          return true;
        } else if (role === "xyz") {
          return true;
        } else if (role === "xyz") {
          return true;
        }
        break;
  
      case "Budget Released":
        if (role === "xyz") {
          return true;
        } else if (role === "xyz") {
          return true;
        } else if (role === "xyz") {
          return true;
        }
        break;
  
      case "Waiting For Purchase":
        if (role === "xyz") {
          return true;
        } else if (role === "xyz") {
          return true;
        } else if (role === "xyz") {
          return true;
        }
        break;
  
      case "Purchase Complete":
        if (role === "xyz") {
          return true;
        } else if (role === "xyz") {
          return true;
        } else if (role === "xyz") {
          return true;
        }
        break;
  
      case "Parts Sent To Factory":
        if (role === "xyz") {
          return true;
        } else if (role === "xyz") {
          return true;
        } else if (role === "xyz") {
          return true;
        }
        break;
  
      case "Parts Received":
        if (role === "xyz") {
          return true;
        } else if (role === "xyz") {
          return true;
        } else if (role === "xyz") {
          return true;
        }
        break;
  
      default:
        return false;
    }
  
    return false;
  };
