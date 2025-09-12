import React from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";

// Import types for navigation only
interface ProjectComponent {
  id: number;
  name: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  progress: number;
  budget: number;
  totalCost: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: string;
  endDate?: string;
  deadline: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  factoryId: number;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  deadline: string;
  progress: number;
  components: ProjectComponent[];
  budget: number;
  totalCost: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeElapsed: number;
}

interface ComponentNavigatorProps {
  selectedProject: Project | undefined;
  selectedComponentId: number | undefined;
  isComponentInfoExpanded: boolean;
  onComponentSelect: (componentId: number) => void;
  onComponentDeselect: () => void;
  onToggleComponentInfo: () => void;
}

const ComponentNavigator: React.FC<ComponentNavigatorProps> = ({
  selectedProject,
  selectedComponentId,
  isComponentInfoExpanded,
  onComponentSelect,
  onComponentDeselect,
  onToggleComponentInfo,
}) => {
  // Get selected component
  const selectedComponent = selectedProject?.components.find(
    component => component.id === selectedComponentId
  );

  // Get project priority color
  const getProjectPriorityColor = (priority: ProjectComponent['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!selectedProject) {
    return null;
  }

  return (
    <div className="border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-gray-900">Component</h2>
        <div className="flex items-center gap-1">
          <button className="text-muted-foreground hover:text-blue-500 transition-colors p-1" title="Add component">
            +
          </button>
        </div>
      </div>

      {selectedComponentId ? (
        // Show selected component information
        <div className="space-y-3">
          {selectedComponent && (
            <div className="space-y-3">
              {/* Component Header */}
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
                    <button className="text-muted-foreground hover:text-gray-700 transition-colors p-1" title="More options">
                      ⋯
                    </button>
                    <button
                      onClick={onComponentDeselect}
                      className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                      title="Back to component selection"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedComponent.description}</p>
              </div>

              {/* Component Details */}
              {isComponentInfoExpanded && (
                <div className="space-y-3">
                  {/* Budget and Cost */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground block">Budget</span>
                      <div className="font-semibold text-green-600">{formatCurrency(selectedComponent.budget)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Total Cost</span>
                      <div className="font-semibold text-blue-600">{formatCurrency(selectedComponent.totalCost)}</div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground block">Start Date</span>
                      <div className="font-medium">{selectedComponent.startDate}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">End Date</span>
                      <div className="font-medium">{selectedComponent.endDate || 'TBD'}</div>
                    </div>
                  </div>

                  {/* Deadline and Priority */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground block">Deadline</span>
                      <div className="font-medium text-red-600">{selectedComponent.deadline}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Priority</span>
                      <Badge className={`text-sm ${getProjectPriorityColor(selectedComponent.priority)}`}>
                        {selectedComponent.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // Show component selection cards
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {selectedProject.components.map((component) => (
            <div
              key={component.id}
              className="p-3 border rounded-lg cursor-pointer transition-all duration-200 bg-white hover:bg-gray-50 border-gray-200"
              onClick={() => onComponentSelect(component.id)}
            >
              <h4 className="font-medium text-base mb-2">
                {component.name}
              </h4>
              <p className="text-sm text-muted-foreground truncate">
                {component.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComponentNavigator;
