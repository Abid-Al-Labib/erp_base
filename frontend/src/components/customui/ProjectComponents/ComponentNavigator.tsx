import React from "react";
import { ChevronDown, ChevronRight, MoreHorizontal, Edit, Save, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ProjectComponent as ProjectComponentType } from "@/types";
import { updateProjectComponent } from "@/services/ProjectComponentService";
import { convertUtcToBDTime } from "@/services/helper";
import CreateProjectComponent from "./CreateProjectComponent";
import toast from "react-hot-toast";

// Import types for navigation only
interface ProjectComponent {
  id: number;
  name: string;
  description: string;
  status: 'PLANNING' | 'STARTED' | 'COMPLETED';
  progress: number;
  budget: number;
  totalCost: number;
  startDate: string;
  endDate?: string;
  deadline: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  factoryId: number;
  status: 'PLANNING' | 'STARTED' | 'COMPLETED';
  startDate: string;
  endDate?: string;
  deadline: string;
  progress: number;
  components: ProjectComponent[];
  budget: number;
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
  onComponentCreated?: (component: ProjectComponentType) => void;
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
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [editFormData, setEditFormData] = React.useState({
    name: '',
    description: '',
    budget: '',
    start_date: '',
    end_date: '',
    deadline: '',
    status: 'PLANNING' as 'PLANNING' | 'STARTED' | 'COMPLETED'
  });
  // Get selected component
  const selectedComponent = selectedProject?.components.find(
    component => component.id === selectedComponentId
  );


  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date from existing convertUtcToBDTime function (remove time part)
  const formatDateOnly = (utcTimestamp: string | null | undefined): string => {
    if (!utcTimestamp) return 'TBD';
    
    try {
      const fullDateTime = convertUtcToBDTime(utcTimestamp);
      // The function returns format like "4 Oct 2024, 14:30"
      // We want only "4 Oct 2024" part
      return fullDateTime.split(',')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'TBD';
    }
  };

  // Convert UTC date to YYYY-MM-DD format for date inputs
  const formatDateForInput = (utcTimestamp: string | null | undefined): string => {
    if (!utcTimestamp) return '';
    
    try {
      // Parse UTC timestamp and convert to Bangladesh time
      const date = new Date(utcTimestamp);
      if (isNaN(date.getTime())) return '';
      
      // Bangladesh is UTC+6
      const bdOffset = 6 * 60 * 60 * 1000;
      const bdDate = new Date(date.getTime() + bdOffset);
      
      // Format as YYYY-MM-DD for date input
      const year = bdDate.getUTCFullYear();
      const month = String(bdDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(bdDate.getUTCDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date for input:', error);
      return '';
    }
  };

  // Handle edit mode
  const handleEditComponent = () => {
    if (selectedComponent) {
      // Populate form with current component data
      setEditFormData({
        name: selectedComponent.name,
        description: selectedComponent.description || '',
        budget: selectedComponent.budget?.toString() || '',
        start_date: formatDateForInput(selectedComponent.startDate),
        end_date: formatDateForInput(selectedComponent.endDate),
        deadline: formatDateForInput(selectedComponent.deadline),
        status: selectedComponent.status
      });
      setIsEditMode(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditFormData({
      name: '',
      description: '',
      budget: '',
      start_date: '',
      end_date: '',
      deadline: '',
      status: 'PLANNING'
    });
  };

  // Validate dates
  const validateDates = () => {
    const startDate = editFormData.start_date ? new Date(editFormData.start_date) : null;
    const endDate = editFormData.end_date ? new Date(editFormData.end_date) : null;
    const deadline = editFormData.deadline ? new Date(editFormData.deadline) : null;

    if (startDate && endDate && endDate <= startDate) {
      toast.error('End date must be after start date');
      return false;
    }

    if (startDate && deadline && deadline <= startDate) {
      toast.error('Deadline must be after start date');
      return false;
    }

    return true;
  };

  const handleSaveComponent = async () => {
    if (!selectedComponent) return;

    // Validate dates before saving
    if (!validateDates()) {
      return;
    }

    try {
      const updateData: Partial<ProjectComponentType> = {
        name: editFormData.name,
        description: editFormData.description || null,
        budget: editFormData.budget ? parseFloat(editFormData.budget) : null,
        start_date: editFormData.start_date || null,
        end_date: editFormData.end_date || null,
        deadline: editFormData.deadline || null,
        status: editFormData.status
      };

      const success = await updateProjectComponent(selectedComponent.id, updateData);
      
      if (success) {
        setIsEditMode(false);
        // Trigger refresh of components data
        if (onComponentUpdated) {
          onComponentUpdated();
        }
      }
    } catch (error) {
      console.error('Error updating component:', error);
      toast.error('Failed to update component');
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!selectedProject) {
    return null;
  }

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
                  {isEditMode ? (
                    <Input
                      value={editFormData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="font-semibold text-lg text-primary flex-1"
                      placeholder="Component name"
                    />
                  ) : (
                    <h3 
                      className="font-semibold text-lg text-primary flex-1 cursor-pointer hover:text-primary/80 transition-colors"
                      onClick={onToggleComponentInfo}
                    >
                      {selectedComponent.name}
                    </h3>
                  )}
                  <div className="flex items-center gap-1">
                    {isEditMode ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSaveComponent}
                          className="h-8 w-8 p-0"
                          title="Save changes"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="h-8 w-8 p-0"
                          title="Cancel edit"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
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
                          <DropdownMenuItem onClick={handleEditComponent}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Component
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    <button
                      onClick={onComponentDeselect}
                      className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                      title="Back to component selection"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                {isEditMode ? (
                  <Textarea
                    value={editFormData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    className="text-sm text-muted-foreground leading-relaxed min-h-[60px]"
                    placeholder="Component description"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedComponent.description}</p>
                )}
              </div>

              {/* Component Details */}
              {isComponentInfoExpanded && (
                <div className="space-y-3">
                  {/* Budget and Cost */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground block">Budget</span>
                      {isEditMode ? (
                        <Input
                          type="number"
                          value={editFormData.budget}
                          onChange={(e) => handleFormChange('budget', e.target.value)}
                          placeholder="0"
                          className="h-8 text-sm"
                        />
                      ) : (
                        <div className="font-semibold text-green-600">{formatCurrency(selectedComponent.budget)}</div>
                      )}
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
                      {isEditMode ? (
                        <Input
                          type="date"
                          value={editFormData.start_date}
                          onChange={(e) => handleFormChange('start_date', e.target.value)}
                          className="h-8 text-sm"
                        />
                      ) : (
                        <div className="font-medium">{formatDateOnly(selectedComponent.startDate)}</div>
                      )}
                    </div>
                    <div>
                      <span className="text-muted-foreground block">End Date</span>
                      {isEditMode ? (
                        <Input
                          type="date"
                          value={editFormData.end_date}
                          onChange={(e) => handleFormChange('end_date', e.target.value)}
                          className="h-8 text-sm"
                        />
                      ) : (
                        <div className="font-medium">{formatDateOnly(selectedComponent.endDate)}</div>
                      )}
                    </div>
                  </div>

                  {/* Deadline and Status */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground block">Deadline</span>
                      {isEditMode ? (
                        <Input
                          type="date"
                          value={editFormData.deadline}
                          onChange={(e) => handleFormChange('deadline', e.target.value)}
                          className="h-8 text-sm"
                        />
                      ) : (
                        <div className="font-medium text-red-600">{formatDateOnly(selectedComponent.deadline)}</div>
                      )}
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Status</span>
                      {isEditMode ? (
                        <Select value={editFormData.status} onValueChange={(value: 'PLANNING' | 'STARTED' | 'COMPLETED') => handleFormChange('status', value)}>
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PLANNING">PLANNING</SelectItem>
                            <SelectItem value="STARTED">STARTED</SelectItem>
                            <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="font-medium">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            selectedComponent.status === 'PLANNING' ? 'bg-blue-100 text-blue-800' :
                            selectedComponent.status === 'STARTED' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedComponent.status}
                          </span>
                        </div>
                      )}
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

      {/* Create Component Modal */}
      <CreateProjectComponent
        isOpen={isCreateComponentOpen}
        onClose={() => setIsCreateComponentOpen(false)}
        projectId={selectedProject.id}
        onComponentCreated={onComponentCreated}
      />
    </div>
  );
};

export default ComponentNavigator;
