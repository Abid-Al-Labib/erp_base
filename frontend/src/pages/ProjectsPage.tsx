import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import NavigationBar from "@/components/customui/NavigationBar";
import { 
  Folder, 
  FolderOpen, 
  Settings, 
  Package,
  ListTodo,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { fetchFactories } from "@/services/FactoriesService";
import { Factory } from "@/types";

// Mock types for the project structure
interface ProjectPart {
  id: number;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  status: 'available' | 'ordered' | 'delayed';
}

interface ProjectComponent {
  id: number;
  name: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  progress: number;
  parts: ProjectPart[];
  todos: TodoItem[];
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
  timeElapsed: number; // in days
}

interface TodoItem {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignedTo?: string;
}

// Mock data
const mockProjects: Project[] = [
  {
    id: 1,
    name: "Production Line Upgrade",
    description: "Upgrading the main production line with new automated machinery",
    factoryId: 1,
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    deadline: '2024-07-15',
    progress: 65,
    budget: 250000,
    totalCost: 162500,
    priority: 'high',
    timeElapsed: 45,
    components: [
      {
        id: 1,
        name: "Conveyor System Installation",
        description: "Install new conveyor belts and control systems",
        status: 'in_progress',
        progress: 80,
        budget: 75000,
        totalCost: 60000,
        priority: 'high',
        startDate: '2024-01-20',
        endDate: '2024-03-15',
        deadline: '2024-03-20',
        parts: [
          { id: 1, name: "Conveyor Belt", description: "Heavy duty belt", quantity: 50, unit: "meters", status: 'available' },
          { id: 2, name: "Motor Controller", description: "Variable speed controller", quantity: 3, unit: "units", status: 'ordered' },
          { id: 3, name: "Sensors", description: "Proximity sensors", quantity: 12, unit: "units", status: 'available' }
        ],
        todos: [
          { id: 1, title: "Install main conveyor frame", completed: true, priority: 'high', dueDate: '2024-02-15' },
          { id: 2, title: "Connect electrical systems", completed: false, priority: 'high', dueDate: '2024-02-20' },
          { id: 3, title: "Test conveyor movement", completed: false, priority: 'medium', dueDate: '2024-02-25' },
          { id: 4, title: "Calibrate speed controls", completed: false, priority: 'low', dueDate: '2024-03-01' }
        ]
      },
      {
        id: 2,
        name: "Safety Systems Integration",
        description: "Implement safety barriers and emergency stops",
        status: 'not_started',
        progress: 0,
        budget: 45000,
        totalCost: 5000,
        priority: 'medium',
        startDate: '2024-03-01',
        endDate: '2024-04-30',
        deadline: '2024-05-15',
        parts: [
          { id: 4, name: "Safety Barriers", description: "Light curtains", quantity: 6, unit: "units", status: 'ordered' },
          { id: 5, name: "Emergency Stop Buttons", description: "Red mushroom buttons", quantity: 8, unit: "units", status: 'available' }
        ],
        todos: [
          { id: 5, title: "Design safety layout", completed: false, priority: 'high', dueDate: '2024-03-01' },
          { id: 6, title: "Install safety barriers", completed: false, priority: 'high', dueDate: '2024-03-15' },
          { id: 7, title: "Test emergency stops", completed: false, priority: 'medium', dueDate: '2024-03-20' }
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Quality Control Enhancement",
    description: "Implementing advanced quality control systems",
    factoryId: 1,
    status: 'planning',
    startDate: '2024-03-01',
    endDate: '2024-08-15',
    deadline: '2024-09-01',
    progress: 15,
    budget: 180000,
    totalCost: 27000,
    priority: 'medium',
    timeElapsed: 12,
    components: [
      {
        id: 3,
        name: "Vision Inspection System",
        description: "Automated visual inspection cameras",
        status: 'not_started',
        progress: 0,
        budget: 120000,
        totalCost: 18000,
        priority: 'medium',
        startDate: '2024-03-15',
        endDate: '2024-07-01',
        deadline: '2024-07-15',
        parts: [
          { id: 6, name: "Industrial Camera", description: "High resolution camera", quantity: 4, unit: "units", status: 'delayed' },
          { id: 7, name: "Lighting System", description: "LED ring lights", quantity: 4, unit: "units", status: 'available' }
        ],
        todos: [
          { id: 8, title: "Research camera specifications", completed: true, priority: 'medium', dueDate: '2024-02-15' },
          { id: 9, title: "Order inspection cameras", completed: false, priority: 'high', dueDate: '2024-02-28' },
          { id: 10, title: "Design mounting system", completed: false, priority: 'medium', dueDate: '2024-03-10' }
        ]
      }
    ]
  }
];

const ProjectsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [factories, setFactories] = useState<Factory[]>([]);
  const [selectedFactoryId, setSelectedFactoryId] = useState<number | undefined>(() => {
    const factoryParam = searchParams.get('factory');
    return factoryParam ? Number(factoryParam) : undefined;
  });
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(() => {
    const projectParam = searchParams.get('project');
    return projectParam ? Number(projectParam) : undefined;
  });
  const [selectedComponentId, setSelectedComponentId] = useState<number | undefined>(() => {
    const componentParam = searchParams.get('component');
    return componentParam ? Number(componentParam) : undefined;
  });
  const [isProjectInfoExpanded, setIsProjectInfoExpanded] = useState(true);
  const [isComponentInfoExpanded, setIsComponentInfoExpanded] = useState(false);

  // Filter projects by selected factory
  const filteredProjects = useMemo(() => {
    if (!selectedFactoryId) return [];
    return mockProjects.filter(project => project.factoryId === selectedFactoryId);
  }, [selectedFactoryId]);

  // Get selected project
  const selectedProject = useMemo(() => {
    return filteredProjects.find(project => project.id === selectedProjectId);
  }, [filteredProjects, selectedProjectId]);

  // Get selected component
  const selectedComponent = useMemo(() => {
    if (!selectedProject) return undefined;
    return selectedProject.components.find(component => component.id === selectedComponentId);
  }, [selectedProject, selectedComponentId]);

  // Load factories on component mount
  useEffect(() => {
    const loadFactories = async () => {
      try {
        const factoriesData = await fetchFactories();
        setFactories(factoriesData || []);
      } catch (error) {
        console.error("Failed to fetch factories:", error);
      }
    };
    loadFactories();
  }, []);

  // Update URL parameters when selections change
  const updateUrlParams = (factory?: number, project?: number, component?: number) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      
      if (factory !== undefined) {
        newParams.set('factory', factory.toString());
      } else {
        newParams.delete('factory');
      }
      
      if (project !== undefined) {
        newParams.set('project', project.toString());
      } else {
        newParams.delete('project');
      }
      
      if (component !== undefined) {
        newParams.set('component', component.toString());
      } else {
        newParams.delete('component');
      }
      
      return newParams;
    });
  };

  // Handle factory selection
  const handleFactorySelect = (factoryId: string) => {
    const id = Number(factoryId);
    setSelectedFactoryId(id);
    setSelectedProjectId(undefined);
    setSelectedComponentId(undefined);
    updateUrlParams(id);
  };

  // Handle project selection
  const handleProjectSelect = (projectId: number) => {
    setSelectedProjectId(projectId);
    setSelectedComponentId(undefined);
    updateUrlParams(selectedFactoryId, projectId);
  };

  // Handle component selection
  const handleComponentSelect = (componentId: number) => {
    setSelectedComponentId(componentId);
    updateUrlParams(selectedFactoryId, selectedProjectId, componentId);
  };

  // Handle project info toggle
  const toggleProjectInfo = () => {
    setIsProjectInfoExpanded(!isProjectInfoExpanded);
    if (!isProjectInfoExpanded) {
      setIsComponentInfoExpanded(false);
    }
  };

  // Handle component info toggle
  const toggleComponentInfo = () => {
    setIsComponentInfoExpanded(!isComponentInfoExpanded);
    if (!isComponentInfoExpanded) {
      setIsProjectInfoExpanded(false);
    }
  };

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


  // Get priority color for todos
  const getTodoPriorityColor = (priority: TodoItem['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
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
    <>
      <NavigationBar />
      <div className="flex w-full flex-col">
        <main className="flex-1 p-4 sm:px-6 sm:py-4 overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-4" style={{ height: 'calc(100vh - 100px)' }}>
            
            {/* Left Panel - Unified Project Navigator */}
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
                      onValueChange={handleFactorySelect}
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
                                       onClick={toggleProjectInfo}
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
                                       onClick={toggleProjectInfo}
                                     >
                                       {project.name}
                                     </h3>
                                     <div className="flex items-center gap-1">
                                       <button className="text-muted-foreground hover:text-gray-700 transition-colors p-1" title="More options">
                                         ⋯
                                       </button>
                                       <button
                                         onClick={() => {
                                           setSelectedProjectId(undefined);
                                           setSelectedComponentId(undefined);
                                           updateUrlParams(selectedFactoryId);
                                         }}
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
                                onClick={() => handleProjectSelect(project.id)}
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

                  {/* Component Section */}
                  {selectedProject && (
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
                          {selectedProject.components
                            .filter(component => component.id === selectedComponentId)
                            .map((component) => (
                              <div key={component.id} className="space-y-3">
                                {/* Component Header */}
                                <div>
                                   <div className="flex items-center gap-2 mb-2">
                                     <button
                                       onClick={toggleComponentInfo}
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
                                       onClick={toggleComponentInfo}
                                     >
                                       {component.name}
                                     </h3>
                                     <div className="flex items-center gap-1">
                                       <button className="text-muted-foreground hover:text-gray-700 transition-colors p-1" title="More options">
                                         ⋯
                                       </button>
                                       <button
                                         onClick={() => {
                                           setSelectedComponentId(undefined);
                                           updateUrlParams(selectedFactoryId, selectedProjectId);
                                         }}
                                         className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                                         title="Back to component selection"
                                       >
                                         ✕
                                       </button>
                                     </div>
                                   </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed">{component.description}</p>
                                </div>

                                {/* Component Details */}
                                {isComponentInfoExpanded && (
                                <div className="space-y-3">
                                  {/* Budget and Cost */}
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <span className="text-muted-foreground block">Budget</span>
                                      <div className="font-semibold text-green-600">{formatCurrency(component.budget)}</div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground block">Total Cost</span>
                                      <div className="font-semibold text-blue-600">{formatCurrency(component.totalCost)}</div>
                                    </div>
                                  </div>

                                  {/* Dates */}
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <span className="text-muted-foreground block">Start Date</span>
                                      <div className="font-medium">{component.startDate}</div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground block">End Date</span>
                                      <div className="font-medium">{component.endDate || 'TBD'}</div>
                                    </div>
                                  </div>

                                  {/* Deadline and Priority */}
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <span className="text-muted-foreground block">Deadline</span>
                                      <div className="font-medium text-red-600">{component.deadline}</div>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground block">Priority</span>
                                      <Badge className={`text-sm ${getProjectPriorityColor(component.priority)}`}>
                                        {component.priority}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                )}
                              </div>
                            ))
                          }
                        </div>
                      ) : (
                        // Show component selection cards
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {selectedProject.components.map((component) => (
                            <div
                              key={component.id}
                              className="p-3 border rounded-lg cursor-pointer transition-all duration-200 bg-white hover:bg-gray-50 border-gray-200"
                              onClick={() => handleComponentSelect(component.id)}
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
                  )}

                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Component Details and Todo List */}
            {selectedComponent && (
              <div className="flex-1 flex flex-col lg:flex-row gap-4 h-full">
                
                {/* Component Parts */}
                <div className="flex-1 h-full">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="flex-shrink-0">
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Component Parts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto">
                      <div className="space-y-3">
                        {selectedComponent.parts.map((part) => (
                          <div key={part.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{part.name}</h4>
                              <p className="text-sm text-muted-foreground">{part.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{part.quantity} {part.unit}</span>
                              <Badge 
                                className={`text-sm ${
                                  part.status === 'available' ? 'bg-green-100 text-green-800' :
                                  part.status === 'ordered' ? 'bg-blue-100 text-blue-800' :
                                  'bg-red-100 text-red-800'
                                }`}
                              >
                                {part.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Todo List - Always Open */}
                <div className="flex-1 h-full">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <ListTodo className="h-5 w-5" />
                          Todo List
                        </CardTitle>
                        <div className="text-sm text-muted-foreground">
                          {selectedComponent.todos.filter(t => t.completed).length} / {selectedComponent.todos.length} completed
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto">
                      <div className="space-y-3">
                        {selectedComponent.todos.map((todo) => (
                          <div key={todo.id} className="flex items-start gap-3 p-3 border rounded-lg">
                            <Checkbox 
                              checked={todo.completed}
                              className="mt-0.5"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <h4 className={`font-medium text-sm ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {todo.title}
                                </h4>
                                <Badge className={`text-sm ${getTodoPriorityColor(todo.priority)}`}>
                                  {todo.priority}
                                </Badge>
                              </div>
                              {todo.description && (
                                <p className="text-sm text-muted-foreground mt-1">{todo.description}</p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                {todo.dueDate && <span>Due: {todo.dueDate}</span>}
                                {todo.assignedTo && <span>Assigned: {todo.assignedTo}</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

              </div>
            )}

            {/* Empty State */}
            {!selectedFactoryId && (
              <div className="flex-1 h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Select a Factory</h3>
                  <p className="text-sm">Choose a factory to view its projects</p>
                </div>
              </div>
            )}

            {selectedFactoryId && !selectedProject && (
              <div className="flex-1 h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Select a Project</h3>
                  <p className="text-sm">Choose a project to view its components</p>
                </div>
              </div>
            )}

            {selectedProject && !selectedComponent && (
              <div className="flex-1 h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Select a Component</h3>
                  <p className="text-sm">Choose a project component to view its parts and todos</p>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
};

export default ProjectsPage;
