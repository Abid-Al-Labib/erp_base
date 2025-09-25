import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Wrench } from "lucide-react";
import { ProjectComponentPart } from "@/types";
import { fetchProjectComponentParts } from "@/services/ProjectComponentPartsService";
// toast removed - component simplified

interface ProjectComponentPartsProps {
  projectComponentId: number;
}

const ProjectComponentParts: React.FC<ProjectComponentPartsProps> = ({
  projectComponentId,
}) => {
  const [parts, setParts] = useState<ProjectComponentPart[]>([]);
  const [loading, setLoading] = useState(true);

  // Load parts when component mounts or projectComponentId changes
  useEffect(() => {
    const loadParts = async () => {
      if (!projectComponentId) {
        
        setParts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const partsData = await fetchProjectComponentParts(projectComponentId);
        console.log(partsData)
        setParts(partsData || []);
      } catch (error) {
        console.error("Failed to fetch project component parts:", error);
        setParts([]);
      } finally {
        setLoading(false);
      }
    };

    loadParts();
  }, [projectComponentId]);


  if (loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Component Parts
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 border rounded-md bg-gray-50 animate-pulse flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="h-4 bg-gray-300 rounded w-8 mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-6"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Component Parts ({parts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {parts.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Parts Assigned</h3>
            <p className="text-sm">This component doesn't have any parts assigned yet.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-full overflow-y-auto">
            {parts.map((componentPart) => (
              <div
                key={componentPart.id}
                className="p-3 border rounded-md bg-white hover:bg-gray-50 transition-colors flex items-center justify-between gap-3 w-full"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{componentPart.parts.name}</div>
                  <div className="text-xs text-muted-foreground">
                    ID: {componentPart.parts.id} • Unit: {componentPart.parts.unit || 'pcs'}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-base font-bold text-primary">{componentPart.qty}</div>
                  <div className="text-xs text-muted-foreground">{componentPart.parts.unit || 'pcs'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectComponentParts;
