import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Folder, ChevronDown, ChevronRight } from "lucide-react";
import { Factory } from "@/types";
import ComponentNavigator from "./ComponentNavigator";

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
}) => {
  // Get status color for projects
  const getProjectStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get project priority color
  const getProjectPriorityColor = (priority: Project['priority']) => {
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
                  <button className="text-muted-foreground hover:text-blue-500 transition-colors p-1" title="Add project">
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
                            <h3 
                              className="font-semibold text-lg text-primary flex-1 cursor-pointer hover:text-primary/80 transition-colors"
                              onClick={onToggleProjectInfo}
                            >
                              {project.name}
                            </h3>
                            <div className="flex items-center gap-1">
                              <button className="text-muted-foreground hover:text-gray-700 transition-colors p-1" title="More options">
                                ⋯
                              </button>
                              <button
                                onClick={onProjectDeselect}
                                className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                                title="Back to project selection"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
                        </div>

                        {/* Project Details */}
                        {isProjectInfoExpanded && (
                          <div className="space-y-3">
                            {/* Budget and Cost */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-muted-foreground block">Budget</span>
                                <div className="font-semibold text-green-600">{formatCurrency(project.budget)}</div>
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
                                <div className="font-medium">{project.startDate}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground block">End Date</span>
                                <div className="font-medium">{project.endDate || 'TBD'}</div>
                              </div>
                            </div>

                            {/* Deadline and Priority */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-muted-foreground block">Deadline</span>
                                <div className="font-medium text-red-600">{project.deadline}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground block">Priority</span>
                                <Badge className={`text-sm ${getProjectPriorityColor(project.priority)}`}>
                                  {project.priority}
                                </Badge>
                              </div>
                            </div>

                            {/* Status and Time */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-muted-foreground block">Status</span>
                                <Badge className={`text-sm ${getProjectStatusColor(project.status)}`}>
                                  {project.status}
                                </Badge>
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
                                  {project.components.filter(c => c.status === 'completed').length}/{project.components.length}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${(project.components.filter(c => c.status === 'completed').length / project.components.length) * 100}%` }}
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
                <div className="space-y-2 max-h-64 overflow-y-auto">
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
              <div className="space-y-2 max-h-64 overflow-y-auto">
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

          {/* Component Navigator */}
          <ComponentNavigator
            selectedProject={selectedProject}
            selectedComponentId={selectedComponentId}
            isComponentInfoExpanded={isComponentInfoExpanded}
            onComponentSelect={onComponentSelect}
            onComponentDeselect={onComponentDeselect}
            onToggleComponentInfo={onToggleComponentInfo}
          />

        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectNavigator;
