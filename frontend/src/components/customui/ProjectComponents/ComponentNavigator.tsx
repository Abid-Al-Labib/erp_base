import React from "react";
import { ChevronDown, ChevronRight, MoreHorizontal, Edit, Save, ArrowLeft, Play, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { convertUtcToBDTime } from "@/services/helper";
import CreateProjectComponent from "./CreateProjectComponent";
import EditComponentModal from "./EditComponentModal";
import StartComponentModal from "./StartComponentModal";
import CompleteComponentModal from "./CompleteComponentModal";

// Local-only types for rendering
interface ProjectComponent {
  id: number;
  name: string;
  description: string | null;
  status: 'PLANNING' | 'STARTED' | 'COMPLETED';
  progress: number;
  budget: number | null;
  totalCost: number | null;
  startDate: string | null;
  endDate?: string | null;
  deadline: string | null;
  // Optional: allow priority if you add it in DB later
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface Project {
  id: number;
  name: string;
  description: string;
  factoryId: number;
  status: 'PLANNING' | 'STARTED' | 'COMPLETED';
  startDate: string | null;
  endDate?: string | null;
  deadline: string | null;
  progress: number;
  components: ProjectComponent[];
  budget: number | null;
  totalCost: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  timeElapsed: number;
}

interface ComponentNavigatorProps {
  selectedProject: Project | undefined;
  selectedComponentId: number | undefined;
  isComponentInfoExpanded: boolean;
  onComponentSelect: (componentId: number) => void;
  onComponentDeselect: () => void;
  onToggleComponentInfo: () => void;
  onComponentCreated?: (component: any) => void;
  onComponentUpdated?: () => void;
}

const ComponentNavigator: React.FC<ComponentNavigatorProps> = ({
  selectedProject,
  selectedComponentId,
  isComponentInfoExpanded,
  onComponentSelect,
  onComponentDeselect,
  onToggleComponentInfo,
  onComponentCreated,
  onComponentUpdated,
}) => {
  const [isCreateComponentOpen, setIsCreateComponentOpen] = React.useState(false);

  // New modals (edit/start/complete)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isStartModalOpen, setIsStartModalOpen] = React.useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = React.useState(false);

  // Get selected component
  const selectedComponent = selectedProject?.components.find(
    (component) => component.id === selectedComponentId
  );

  // Utilities
  const formatCurrency = (amount: number | null | undefined) => {
    const val = amount ?? 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDateOnly = (utcTimestamp: string | null | undefined): string => {
    if (!utcTimestamp) return "TBD";
    try {
      const fullDateTime = convertUtcToBDTime(utcTimestamp);
      return fullDateTime.split(",")[0];
    } catch {
      return "TBD";
    }
  };

  const formatDateForInput = (utcTimestamp: string | null | undefined): string => {
    if (!utcTimestamp) return "";
    try {
      const date = new Date(utcTimestamp);
      if (isNaN(date.getTime())) return "";
      const bdOffset = 6 * 60 * 60 * 1000;
      const bdDate = new Date(date.getTime() + bdOffset);
      const year = bdDate.getUTCFullYear();
      const month = String(bdDate.getUTCMonth() + 1).padStart(2, "0");
      const day = String(bdDate.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  const getComponentStatusBadge = (status: ProjectComponent["status"]) => {
    const base = "px-2 py-1 rounded text-xs font-medium";
    switch (status) {
      case "PLANNING":
        return `${base} bg-blue-100 text-blue-800`;
      case "STARTED":
        return `${base} bg-green-100 text-green-800`;
      case "COMPLETED":
      default:
        return `${base} bg-gray-100 text-gray-800`;
    }
  };

  const getPriorityBadge = (p?: ProjectComponent["priority"]) => {
    const base = "px-2 py-1 rounded text-xs font-medium";
    if (!p) return `${base} bg-gray-100 text-gray-800`;
    if (p === "HIGH") return `${base} bg-red-100 text-red-800`;
    if (p === "MEDIUM") return `${base} bg-yellow-100 text-yellow-800`;
    return `${base} bg-gray-100 text-gray-800`;
  };

  if (!selectedProject) return null;

  return (
    <div className="border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-gray-900">
          Components ({selectedProject.components.length})
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCreateComponentOpen(true)}
            className="text-muted-foreground hover:text-blue-500 transition-colors p-1"
            title="Add component"
          >
            +
          </button>
        </div>
      </div>

      {selectedComponentId ? (
        <div className="space-y-3">
          {selectedComponent && (
            <div className="space-y-3">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={onToggleComponentInfo}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    {isComponentInfoExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  <h3
                    className="font-semibold text-lg text-primary flex-1 cursor-pointer hover:text-primary/80 transition-colors"
                    onClick={onToggleComponentInfo}
                  >
                    {selectedComponent.name}
                  </h3>

                  <div className="flex items-center gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="More options"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Component
                        </DropdownMenuItem>

                        {selectedComponent.status === "PLANNING" && (
                          <DropdownMenuItem onClick={() => setIsStartModalOpen(true)}>
                            <Play className="mr-2 h-4 w-4" />
                            Start Component
                          </DropdownMenuItem>
                        )}

                        {selectedComponent.status === "STARTED" && (
                          <DropdownMenuItem onClick={() => setIsCompleteModalOpen(true)}>
                            <Check className="mr-2 h-4 w-4" />
                            Complete Component
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <button
                      onClick={onComponentDeselect}
                      className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                      title="Back to component selection"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedComponent.description}
                </p>
              </div>

              {/* Details (read-only) */}
              {isComponentInfoExpanded && (
                <div className="space-y-3">
                  {/* Budget and Cost */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground block">Budget</span>
                      <div className="font-semibold text-green-600">{selectedComponent.budget?formatCurrency(selectedComponent.budget):'TBD'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Total Cost</span>
                      <div className="font-semibold text-blue-600">{selectedComponent.totalCost?formatCurrency(selectedComponent.totalCost):'TBD'}</div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground block">Start Date</span>
                      <div className="font-medium">{formatDateOnly(selectedComponent.startDate)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">End Date</span>
                      <div className="font-medium">{formatDateOnly(selectedComponent.endDate)}</div>
                    </div>
                  </div>

                  {/* Deadline and Status */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground block">Deadline</span>
                      <div className="font-medium text-red-600">{formatDateOnly(selectedComponent.deadline)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Status</span>
                      <div className={getComponentStatusBadge(selectedComponent.status)}>
                        {selectedComponent.status}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // Grid of components to select
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {selectedProject.components.map((component) => (
            <div
              key={component.id}
              className="p-3 border rounded-lg cursor-pointer transition-all duration-200 bg-white hover:bg-gray-50 border-gray-200"
              onClick={() => onComponentSelect(component.id)}
            >
              <h4 className="font-medium text-base mb-2">{component.name}</h4>
              <p className="text-sm text-muted-foreground truncate">
                {component.description || ""}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create Component Modal */}
      <CreateProjectComponent
        isOpen={isCreateComponentOpen}
        onClose={() => setIsCreateComponentOpen(false)}
        projectId={selectedProject.id}
        onComponentCreated={onComponentCreated}
      />

      {/* Edit / Start / Complete Modals for the selected component */}
      {selectedComponent && (
        <>
          <EditComponentModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            componentId={selectedComponent.id}
            initialName={selectedComponent.name}
            initialDescription={selectedComponent.description || ""}
            onComponentUpdated={onComponentUpdated}
          />

          <StartComponentModal
            isOpen={isStartModalOpen}
            onClose={() => setIsStartModalOpen(false)}
            componentId={selectedComponent.id}
            componentName={selectedComponent.name}
            defaultStartDate={formatDateForInput(selectedComponent.startDate)}
            onComponentUpdated={onComponentUpdated}
          />

          <CompleteComponentModal
            isOpen={isCompleteModalOpen}
            onClose={() => setIsCompleteModalOpen(false)}
            componentId={selectedComponent.id}
            componentName={selectedComponent.name}
            defaultStartDate={formatDateForInput(selectedComponent.startDate)}
            onComponentUpdated={onComponentUpdated}
          />
        </>
      )}
    </div>
  );
};

export default ComponentNavigator;
