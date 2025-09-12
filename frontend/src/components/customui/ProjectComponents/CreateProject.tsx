import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { addProject } from "@/services/ProjectsService";
import { addProjectComponent } from "@/services/ProjectComponentService";
import { Project, ProjectComponent } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import CreateProjectComponent from "./CreateProjectComponent";

interface CreateProjectProps {
  isOpen: boolean;
  onClose: () => void;
  factoryId: number;
  onProjectCreated?: (project: Project) => void;
}

const CreateProject: React.FC<CreateProjectProps> = ({
  isOpen,
  onClose,
  factoryId,
  onProjectCreated,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    budget: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    status: "PLANNING" as "PLANNING" | "STARTED" | "COMPLETED",
  });
  
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [deadline, setDeadline] = useState<Date>();
  const [components, setComponents] = useState<ProjectComponent[]>([]);
  const [isCreateComponentOpen, setIsCreateComponentOpen] = useState(false);

  const resetForm = () => {
    setProjectData({
      name: "",
      description: "",
      budget: "",
      priority: "MEDIUM",
      status: "PLANNING",
    });
    setStartDate(undefined);
    setEndDate(undefined);
    setDeadline(undefined);
    setComponents([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleComponentCreated = (component: ProjectComponent) => {
    setComponents([...components, component]);
    setIsCreateComponentOpen(false);
  };

  const removeComponent = (componentId: number) => {
    setComponents(components.filter((comp) => comp.id !== componentId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create the project
      const projectPayload: Partial<Project> = {
        name: projectData.name,
        description: projectData.description,
        budget: projectData.budget ? parseFloat(projectData.budget) : null,
        start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
        end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
        deadline: deadline ? format(deadline, 'yyyy-MM-dd') : null,
        priority: projectData.priority,
        status: projectData.status,
        factory_id: factoryId,
      };

      const createdProject = await addProject(projectPayload);
      
      if (!createdProject) {
        throw new Error("Failed to create project");
      }

      // Create components if any (using loop instead of bulk insert)
      if (components.length > 0) {
        for (const comp of components) {
          const componentPayload: Partial<ProjectComponent> = {
            name: comp.name,
            description: comp.description || null,
            budget: comp.budget || null,
            start_date: comp.start_date || null,
            deadline: comp.deadline || null,
            status: comp.status,
            project_id: createdProject.id,
          };

          await addProjectComponent(componentPayload);
        }
      }

      onProjectCreated?.(createdProject);
      handleClose();
      toast.success("Project created successfully!");
      
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Project Name */}
                <div>
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    value={projectData.name}
                    onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={projectData.description}
                    onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                    rows={2}
                  />
                </div>

                {/* Priority and Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={projectData.priority}
                      onValueChange={(value: "LOW" | "MEDIUM" | "HIGH") => 
                        setProjectData({ ...projectData, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={projectData.status}
                      onValueChange={(value: "PLANNING" | "STARTED" | "COMPLETED") => 
                        setProjectData({ ...projectData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PLANNING">Planning</SelectItem>
                        <SelectItem value="STARTED">Started</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    value={projectData.budget}
                    onChange={(e) => setProjectData({ ...projectData, budget: e.target.value })}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Start Date */}
                <div>
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Date */}
                <div>
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                {/* Deadline */}
                <div>
                  <Label>Deadline</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !deadline && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deadline ? format(deadline, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={deadline}
                        onSelect={setDeadline}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Components Section */}
                <div className="space-y-3 border-t pt-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Components ({components.length})</Label>
                    <Button 
                      type="button" 
                      onClick={() => setIsCreateComponentOpen(true)} 
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Component
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {components.map((component) => (
                      <div key={component.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{component.name}</p>
                          <p className="text-xs text-muted-foreground">{component.status}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeComponent(component.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Separate Component Creation Modal */}
      <CreateProjectComponent
        isOpen={isCreateComponentOpen}
        onClose={() => setIsCreateComponentOpen(false)}
        projectId={0} // Temporary project ID, components will be saved for later creation
        onComponentCreated={handleComponentCreated}
        isPreCreation={true}
      />
    </>
  );
};

export default CreateProject;
