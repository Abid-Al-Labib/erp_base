import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Folder, ChevronDown, ChevronRight, MoreHorizontal, Edit, Save, ArrowLeft } from "lucide-react";
import { Factory, Project as ProjectType, ProjectComponent as ProjectComponentType } from "@/types";
import { updateProject } from "@/services/ProjectsService";
import { convertUtcToBDTime } from "@/services/helper";
import ComponentNavigator from "./ComponentNavigator";
import CreateProject from "./CreateProject";
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

interface ProjectNavigatorProps {
  factories: Factory[];
  selectedFactoryId: number | undefined;
  selectedProjectId: number | undefined;
  selectedComponentId: number | undefined;
  filteredProjects: Project[];
  selectedProject: Project | undefined;
  isProjectInfoExpanded: boolean;
  isComponentInfoExpanded: boolean;
  onFactorySelect: (factoryId: string) => void;
  onProjectSelect: (projectId: number) => void;
  onProjectDeselect: () => void;
  onComponentSelect: (componentId: number) => void;
  onComponentDeselect: () => void;
  onToggleProjectInfo: () => void;
  onToggleComponentInfo: () => void;
  onProjectCreated?: (project: ProjectType) => void;
  onComponentCreated?: (component: ProjectComponentType) => void;
  onProjectUpdated?: () => void;
  onComponentUpdated?: () => void;
}

const ProjectNavigator: React.FC<ProjectNavigatorProps> = ({
  factories,
  selectedFactoryId,
  selectedProjectId,
  selectedComponentId,
  filteredProjects,
  selectedProject,
  isProjectInfoExpanded,
  isComponentInfoExpanded,
  onFactorySelect,
  onProjectSelect,
  onProjectDeselect,
  onComponentSelect,
  onComponentDeselect,
  onToggleProjectInfo,
  onToggleComponentInfo,
  onProjectCreated,
  onComponentCreated,
  onProjectUpdated,
  onComponentUpdated,
}) => {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [editFormData, setEditFormData] = React.useState({
    name: '',
    description: '',
    budget: '',
    start_date: '',
    end_date: '',
    deadline: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    status: 'PLANNING' as 'PLANNING' | 'STARTED' | 'COMPLETED'
  });
  // Get status color for projects
  const getProjectStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'PLANNING': return 'bg-blue-100 text-blue-800';
      case 'STARTED': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get project priority color
  const getProjectPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-gray-100 text-gray-800';
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

  // Handle edit mode
  const handleEditProject = () => {
    if (selectedProject) {
      // Populate form with current project data
      setEditFormData({
        name: selectedProject.name,
        description: selectedProject.description,
        budget: selectedProject.budget?.toString() || '',
        start_date: formatDateForInput(selectedProject.startDate),
        end_date: formatDateForInput(selectedProject.endDate),
        deadline: formatDateForInput(selectedProject.deadline),
        priority: selectedProject.priority,
        status: selectedProject.status
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
      priority: 'MEDIUM',
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

  const handleSaveProject = async () => {
    if (!selectedProject) return;

    // Validate dates before saving
    if (!validateDates()) {
      return;
    }

    try {
      const updateData: Partial<ProjectType> = {
        name: editFormData.name,
        description: editFormData.description,
        budget: editFormData.budget ? parseFloat(editFormData.budget) : null,
        start_date: editFormData.start_date || null,
        end_date: editFormData.end_date || null,
        deadline: editFormData.deadline || null,
        priority: editFormData.priority,
        status: editFormData.status
      };

      const success = await updateProject(selectedProject.id, updateData);
      
      if (success) {
        setIsEditMode(false);
        // Trigger refresh of projects data
        if (onProjectUpdated) {
          onProjectUpdated();
        }
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  return (
    <div className="flex-none min-w-80 max-w-96 w-full lg:w-1/4 h-full">
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Project Navigator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 overflow-y-auto">
          
          {/* Factory Selection */}
          <div>
            <Label className="mb-2 text-base font-medium">Factory</Label>
            <Select
              value={selectedFactoryId?.toString() || ""}
              onValueChange={onFactorySelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose factory..." />
              </SelectTrigger>
              <SelectContent>
                {factories.map((factory) => (
                  <SelectItem key={factory.id} value={factory.id.toString()}>
                    {factory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Project Section */}
          {selectedFactoryId && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-gray-900">Project</h2>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setIsCreateProjectOpen(true)}
                    className="text-muted-foreground hover:text-blue-500 transition-colors p-1" 
                    title="Add project"
                    disabled={!selectedFactoryId}
                  >
                    +
                  </button>
                </div>
              </div>
              
              {selectedProjectId ? (
                // Show selected project information
                <div className="space-y-3">
                  {filteredProjects
                    .filter(project => project.id === selectedProjectId)
                    .map((project) => (
                      <div key={project.id} className="space-y-3">
                        {/* Project Header */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <button
                              onClick={onToggleProjectInfo}
                              className="text-primary hover:text-primary/80 transition-colors"
                            >
                              {isProjectInfoExpanded ? (
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
                                placeholder="Project name"
                              />
                            ) : (
                              <h3 
                                className="font-semibold text-lg text-primary flex-1 cursor-pointer hover:text-primary/80 transition-colors"
                                onClick={onToggleProjectInfo}
                              >
                                {project.name}
                              </h3>
                            )}
                            <div className="flex items-center gap-1">
                              {isEditMode ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleSaveProject}
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
                                    <DropdownMenuItem onClick={handleEditProject}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Project
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                              <button
                                onClick={onProjectDeselect}
                                className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                                title="Back to project selection"
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
                              placeholder="Project description"
                            />
                          ) : (
                            <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
                          )}
                        </div>

                        {/* Project Details */}
                        {isProjectInfoExpanded && (
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
                                  <div className="font-semibold text-green-600">{formatCurrency(project.budget)}</div>
                                )}
                              </div>
                              <div>
                                <span className="text-muted-foreground block">Total Cost</span>
                                <div className="font-semibold text-blue-600">{formatCurrency(project.totalCost)}</div>
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
                                  <div className="font-medium">{formatDateOnly(project.startDate)}</div>
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
                                  <div className="font-medium">{formatDateOnly(project.endDate)}</div>
                                )}
                              </div>
                            </div>

                            {/* Deadline and Priority */}
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
                                  <div className="font-medium text-red-600">{formatDateOnly(project.deadline)}</div>
                                )}
                              </div>
                              <div>
                                <span className="text-muted-foreground block">Priority</span>
                                {isEditMode ? (
                                  <Select value={editFormData.priority} onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH') => handleFormChange('priority', value)}>
                                    <SelectTrigger className="h-8 text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="LOW">LOW</SelectItem>
                                      <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                                      <SelectItem value="HIGH">HIGH</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Badge className={`text-sm ${getProjectPriorityColor(project.priority)}`}>
                                    {project.priority}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Status and Time */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
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
                                  <Badge className={`text-sm ${getProjectStatusColor(project.status)}`}>
                                    {project.status}
                                  </Badge>
                                )}
                              </div>
                              <div>
                                <span className="text-muted-foreground block">Time Elapsed</span>
                                <div className="font-medium">{project.timeElapsed} days</div>
                              </div>
                            </div>

                            {/* Components Progress */}
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Components Completed</span>
                                      <span className="font-medium text-primary">
                                        {project.components.filter(c => c.status === 'COMPLETED').length}/{project.components.length}
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                                        style={{ width: `${(project.components.filter(c => c.status === 'COMPLETED').length / project.components.length) * 100}%` }}
                                      ></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  }
                </div>
              ) : (
                // Show project selection cards
                <div className={`space-y-2 overflow-y-auto ${selectedProject ? 'max-h-64' : 'max-h-96'}`}>
                  {filteredProjects.length === 0 ? (
                    // Show skeleton cards when no projects
                    <>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-3 border rounded-lg bg-gray-50 animate-pulse">
                          <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
                          <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                        </div>
                      ))}
                    </>
                  ) : (
                    // Show all projects for selection
                    filteredProjects.map((project) => (
                      <div 
                        key={project.id} 
                        className="p-3 border rounded-lg cursor-pointer transition-all duration-200 bg-white hover:bg-gray-50 border-gray-200"
                        onClick={() => onProjectSelect(project.id)}
                      >
                        <h4 className="font-medium text-base mb-2">
                          {project.name}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {project.description}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Project Selection Skeleton when no factory selected */}
          {!selectedFactoryId && (
            <div>
              <Label className="mb-2 text-base font-medium">Project</Label>
              <div className={`space-y-2 overflow-y-auto ${selectedProject ? 'max-h-64' : 'max-h-96'}`}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 border rounded-lg bg-gray-50 animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Component Navigator - Only show when project is selected */}
          {selectedProject && (
            <ComponentNavigator
              selectedProject={selectedProject}
              selectedComponentId={selectedComponentId}
              isComponentInfoExpanded={isComponentInfoExpanded}
              onComponentSelect={onComponentSelect}
              onComponentDeselect={onComponentDeselect}
              onToggleComponentInfo={onToggleComponentInfo}
              onComponentCreated={onComponentCreated}
              onComponentUpdated={onComponentUpdated}
            />
          )}

        </CardContent>
      </Card>

      {/* Create Project Modal */}
      {selectedFactoryId && (
        <CreateProject
          isOpen={isCreateProjectOpen}
          onClose={() => setIsCreateProjectOpen(false)}
          factoryId={selectedFactoryId}
          onProjectCreated={onProjectCreated}
        />
      )}
    </div>
  );
};

export default ProjectNavigator;
