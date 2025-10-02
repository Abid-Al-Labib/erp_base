import React, { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import NavigationBar from "@/components/customui/NavigationBar";
import {
  Folder,
  FolderOpen,
  Settings
} from "lucide-react";
import { fetchFactories } from "@/services/FactoriesService";
import { fetchProjects } from "@/services/ProjectsService";
import { fetchProjectComponentsByProjectId } from "@/services/ProjectComponentService";
import { Factory, Project as ProjectType, ProjectComponent as ProjectComponentType } from "@/types";
import ProjectComponentTasks from "@/components/customui/ProjectComponents/ProjectComponentTasks";
import RunningOrders from "@/components/customui/RunningOrders";
// NOTE: if your file is named ProjectComponentMiscCosts.tsx, change this import to .../ProjectComponentMiscCosts
import ProjectComponentMiscCosts from "@/components/customui/ProjectComponents/ProjectComponentMiscCost";
import ProjectComponentParts from "@/components/customui/ProjectComponents/ProjectComponentParts";
import ProjectNavigator from "@/components/customui/ProjectComponents/ProjectNavigator";

const ProjectsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [factories, setFactories] = useState<Factory[]>([]);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [components, setComponents] = useState<ProjectComponentType[]>([]);
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
  const [loadingProjects, setLoadingProjects] = useState(false);
  
  // Ref to store the project total cost refresh function
  const refreshProjectTotalCostRef = useRef<(() => void) | null>(null);
  // Track which component's misc costs were updated to trigger per-component recompute
  const [miscCostUpdatedForComponentId, setMiscCostUpdatedForComponentId] = useState<number | null>(null);

  // Filter projects by selected factory
  const filteredProjects = useMemo(() => {
    if (!selectedFactoryId) return [];
    return projects.filter(project => project.factory_id === selectedFactoryId);
  }, [projects, selectedFactoryId]);

  // Get selected project
  const selectedProject = useMemo(() => {
    return filteredProjects.find(project => project.id === selectedProjectId);
  }, [filteredProjects, selectedProjectId]);

  // Get selected component
  const selectedComponent = useMemo(() => {
    return components.find(component => component.id === selectedComponentId);
  }, [components, selectedComponentId]);

  // No transformation needed - use actual types directly

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

  // Load projects when factory is selected
  useEffect(() => {
    const loadProjects = async () => {
      if (!selectedFactoryId) {
        setProjects([]);
        return;
      }

      setLoadingProjects(true);
      try {
        const { data: projectsData } = await fetchProjects(selectedFactoryId);
        setProjects(projectsData || []);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoadingProjects(false);
      }
    };
    loadProjects();
  }, [selectedFactoryId]);

  // Load components when project is selected
  useEffect(() => {
    const loadComponents = async () => {
      if (!selectedProjectId) {
        setComponents([]);
        return;
      }

      try {
        const componentsData = await fetchProjectComponentsByProjectId(selectedProjectId);
        setComponents(componentsData || []);
      } catch (error) {
        console.error("Failed to fetch components:", error);
      }
    };
    loadComponents();
  }, [selectedProjectId]);

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

  const handleFactorySelect = (factoryId: string) => {
    const id = Number(factoryId);
    setSelectedFactoryId(id);
    setSelectedProjectId(undefined);
    setSelectedComponentId(undefined);
    updateUrlParams(id);
  };

  const handleProjectSelect = (projectId: number) => {
    setSelectedProjectId(projectId);
    setSelectedComponentId(undefined);
    updateUrlParams(selectedFactoryId, projectId);
  };

  const handleComponentSelect = (componentId: number) => {
    setSelectedComponentId(componentId);
    updateUrlParams(selectedFactoryId, selectedProjectId, componentId);
  };

  const handleProjectDeselect = () => {
    setSelectedProjectId(undefined);
    setSelectedComponentId(undefined);
    updateUrlParams(selectedFactoryId);
  };

  const handleComponentDeselect = () => {
    setSelectedComponentId(undefined);
    updateUrlParams(selectedFactoryId, selectedProjectId);
  };

  const handleProjectCreated = async (project: ProjectType) => {
    if (selectedFactoryId) {
      try {
        const { data: projectsData } = await fetchProjects(selectedFactoryId);
        setProjects(projectsData || []);
      } catch (error) {
        console.error("Failed to refresh projects:", error);
      }
    }
    setSelectedProjectId(project.id);
    updateUrlParams(selectedFactoryId, project.id);
  };

  const handleComponentCreated = async (component: ProjectComponentType) => {
    if (selectedProjectId) {
      try {
        const componentsData = await fetchProjectComponentsByProjectId(selectedProjectId);
        setComponents(componentsData || []);
      } catch (error) {
        console.error("Failed to refresh components:", error);
      }
    }
    setSelectedComponentId(component.id);
    updateUrlParams(selectedFactoryId, selectedProjectId, component.id);
  };

  const handleProjectUpdated = async () => {
    if (selectedFactoryId) {
      try {
        const { data: projectsData } = await fetchProjects(selectedFactoryId);
        setProjects(projectsData || []);
      } catch (error) {
        console.error("Failed to refresh projects:", error);
      }
    }
  };

  const handleComponentUpdated = async () => {
    // Refresh both projects and components data
    if (selectedFactoryId) {
      try {
        const { data: projectsData } = await fetchProjects(selectedFactoryId);
        setProjects(projectsData || []);
      } catch (error) {
        console.error("Failed to refresh projects:", error);
      }
    }
    
    if (selectedProjectId) {
      try {
        const componentsData = await fetchProjectComponentsByProjectId(selectedProjectId);
        setComponents(componentsData || []);
      } catch (error) {
        console.error("Failed to refresh components:", error);
      }
    }
  };

  const toggleProjectInfo = () => {
    setIsProjectInfoExpanded(!isProjectInfoExpanded);
    if (!isProjectInfoExpanded) {
      setIsComponentInfoExpanded(false);
    }
  };

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
              loadingProjects={loadingProjects}
              onFactorySelect={handleFactorySelect}
              onProjectSelect={handleProjectSelect}
              onProjectDeselect={handleProjectDeselect}
              onComponentSelect={handleComponentSelect}
              onComponentDeselect={handleComponentDeselect}
              onToggleProjectInfo={toggleProjectInfo}
              onToggleComponentInfo={toggleComponentInfo}
              onProjectCreated={handleProjectCreated}
              onComponentCreated={handleComponentCreated}
              onProjectUpdated={handleProjectUpdated}
              onComponentUpdated={handleComponentUpdated}
              onRefreshProjectTotalCost={(refreshFn) => {
                refreshProjectTotalCostRef.current = refreshFn;
              }}
              miscCostUpdatedForComponentId={miscCostUpdatedForComponentId}
            />

            {/* Middle Panel - Running Orders + Component Parts; Right Panel stays */}
            {selectedComponent && (
              <div className="flex-1 flex flex-col lg:flex-row gap-4 h-full min-h-0">
                {/* Middle column: Running Orders (top) + Component Parts (bottom) */}
                <div className="flex-1 h-full flex flex-col gap-4 overflow-hidden min-h-0">
                  {/* Running Orders (top half) */}
                  <div className="flex-1 basis-1/2 min-h-0">
                    <RunningOrders projectComponent={selectedComponent} />
                  </div>

                  {/* Component Parts (bottom half) */}
                  <div className="flex-1 basis-1/2 min-h-0 overflow-hidden">
                    <ProjectComponentParts 
                      projectComponentId={selectedComponent.id}
                      projectId={selectedProjectId}
                      componentId={selectedComponent.id}
                      factoryId={selectedFactoryId}
                    />
                  </div>
                </div>

                {/* Right side: Tasks + Misc Costs */}
                <div className="flex-1 h-full flex flex-col gap-4 overflow-hidden min-h-0">
                  {/* Tasks (top half) */}
                  <div className="flex-1 basis-1/3 min-h-0 overflow-hidden">
                    <ProjectComponentTasks ProjectComponentId={selectedComponent.id} />
                  </div>

                  {/* Misc Costs (bottom half) */}
                  <div className="flex-1 basis-1/3 min-h-0 overflow-hidden">
                    <ProjectComponentMiscCosts
                      projectId={selectedProjectId as number}
                      projectComponentId={selectedComponent.id}
                      onMiscCostUpdated={() => {
                        // Refresh project total cost and trigger per-component recompute
                        refreshProjectTotalCostRef.current?.();
                        setMiscCostUpdatedForComponentId(selectedComponent.id);
                        // Reset so subsequent updates retrigger
                        setTimeout(() => setMiscCostUpdatedForComponentId(null), 0);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Empty States */}
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
