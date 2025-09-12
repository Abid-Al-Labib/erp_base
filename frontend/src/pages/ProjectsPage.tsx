import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NavigationBar from "@/components/customui/NavigationBar";
import { 
  Folder, 
  FolderOpen, 
  Settings, 
  Package
} from "lucide-react";
import { fetchFactories } from "@/services/FactoriesService";
import { Factory } from "@/types";
import ProjectComponentTasks from "@/components/customui/ProjectComponents/ProjectComponentTasks";
import ProjectNavigator from "@/components/customui/ProjectComponents/ProjectNavigator";

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

  // Handle project deselection
  const handleProjectDeselect = () => {
    setSelectedProjectId(undefined);
    setSelectedComponentId(undefined);
    updateUrlParams(selectedFactoryId);
  };

  // Handle component deselection
  const handleComponentDeselect = () => {
    setSelectedComponentId(undefined);
    updateUrlParams(selectedFactoryId, selectedProjectId);
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


  return (
    <>
      <NavigationBar />
      <div className="flex w-full flex-col">
        <main className="flex-1 p-4 sm:px-6 sm:py-4 overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-4" style={{ height: 'calc(100vh - 100px)' }}>
            
            {/* Left Panel - Project Navigator */}
            <ProjectNavigator
              factories={factories}
              selectedFactoryId={selectedFactoryId}
              selectedProjectId={selectedProjectId}
              selectedComponentId={selectedComponentId}
              filteredProjects={filteredProjects}
              selectedProject={selectedProject}
              isProjectInfoExpanded={isProjectInfoExpanded}
              isComponentInfoExpanded={isComponentInfoExpanded}
              onFactorySelect={handleFactorySelect}
              onProjectSelect={handleProjectSelect}
              onProjectDeselect={handleProjectDeselect}
              onComponentSelect={handleComponentSelect}
              onComponentDeselect={handleComponentDeselect}
              onToggleProjectInfo={toggleProjectInfo}
              onToggleComponentInfo={toggleComponentInfo}
            />

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

                {/* Tasks panel */}
                <div className="flex-1 h-full">
                  {selectedComponent && (
                    <ProjectComponentTasks ProjectComponentId={selectedComponent.id} />
                  )}
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
