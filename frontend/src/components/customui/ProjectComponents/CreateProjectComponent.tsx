import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { addProjectComponent } from "@/services/ProjectComponentService";
import { ProjectComponent } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface CreateProjectComponentProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  onComponentCreated?: (component: ProjectComponent) => void;
  isPreCreation?: boolean; // Flag for creating components before project exists
}

const CreateProjectComponent: React.FC<CreateProjectComponentProps> = ({
  isOpen,
  onClose,
  projectId,
  onComponentCreated,
  isPreCreation = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [componentData, setComponentData] = useState({
    name: "",
    description: "",
    budget: "",
    status: "PLANNING" as "PLANNING" | "STARTED" | "COMPLETED",
  });

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [deadline, setDeadline] = useState<Date>();

  const resetForm = () => {
    setComponentData({
      name: "",
      description: "",
      budget: "",
      status: "PLANNING",
    });
    setStartDate(undefined);
    setEndDate(undefined);
    setDeadline(undefined);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const componentPayload: Partial<ProjectComponent> = {
        name: componentData.name,
        description: componentData.description || null,
        budget: componentData.budget ? parseFloat(componentData.budget) : null,
        start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
        end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
        deadline: deadline ? format(deadline, 'yyyy-MM-dd') : null,
        status: componentData.status,
        project_id: projectId,
      };

      if (isPreCreation) {
        // For pre-creation (before project exists), create a mock component
        const mockComponent: ProjectComponent = {
          id: Date.now(), // Temporary ID
          name: componentData.name,
          description: componentData.description || null,
          budget: componentData.budget ? parseFloat(componentData.budget) : null,
          start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
          end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
          deadline: deadline ? format(deadline, 'yyyy-MM-dd') : null,
          status: componentData.status,
          project_id: 0, // Will be updated when project is created
          created_at: new Date().toISOString(),
          project: {} as any, // Mock project reference
        };

        onComponentCreated?.(mockComponent);
        handleClose();
        toast.success("Component prepared for creation!");
      } else {
        // Normal creation with existing project
        const createdComponent = await addProjectComponent(componentPayload);
        
        if (!createdComponent) {
          throw new Error("Failed to create component");
        }

        onComponentCreated?.(createdComponent);
        handleClose();
        toast.success("Component created successfully!");
      }
      
    } catch (error) {
      console.error("Error creating component:", error);
      toast.error("Failed to create component");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Component</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Component Name */}
              <div>
                <Label htmlFor="name">Component Name *</Label>
                <Input
                  id="name"
                  value={componentData.name}
                  onChange={(e) => setComponentData({ ...componentData, name: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={componentData.description}
                  onChange={(e) => setComponentData({ ...componentData, description: e.target.value })}
                  rows={2}
                />
              </div>
              
              {/* Status and Budget */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={componentData.status}
                    onValueChange={(value: "PLANNING" | "STARTED" | "COMPLETED") => 
                      setComponentData({ ...componentData, status: value })
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

                <div>
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    value={componentData.budget}
                    onChange={(e) => setComponentData({ ...componentData, budget: e.target.value })}
                  />
                </div>
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
  );
};

export default CreateProjectComponent;
