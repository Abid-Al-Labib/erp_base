import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardNavbar, { SIDEBAR_COLLAPSED_KEY } from '@/components/newcomponents/customui/DashboardNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGetFactoryByIdQuery } from '@/features/factories/factoriesApi';
import { useGetFactorySectionByIdQuery } from '@/features/factorySections/factorySectionsApi';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Layers, Pencil, Loader2, LayoutGrid } from 'lucide-react';
import EditFactorySectionDialog from '@/components/newcomponents/customui/EditFactorySectionDialog';
import { useGetFactorySectionsQuery } from '@/features/factorySections/factorySectionsApi';

const FactorySectionDetailPage: React.FC = () => {
  const { id, sectionId } = useParams<{ id: string; sectionId: string }>();
  const navigate = useNavigate();
  const [isNavCollapsed, setIsNavCollapsed] = useState(() =>
    localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const factoryId = id ? parseInt(id, 10) : null;
  const sectionIdNum = sectionId ? parseInt(sectionId, 10) : null;

  const { data: factory, isLoading: isLoadingFactory } = useGetFactoryByIdQuery(factoryId!, {
    skip: !factoryId || isNaN(factoryId),
  });
  const { data: section, isLoading: isLoadingSection, error } = useGetFactorySectionByIdQuery(sectionIdNum!, {
    skip: !sectionIdNum || isNaN(sectionIdNum),
  });
  const { data: sections = [] } = useGetFactorySectionsQuery(
    { factory_id: factoryId!, limit: 500 },
    { skip: !factoryId || isNaN(factoryId) }
  );

  if (!factoryId || isNaN(factoryId) || !sectionIdNum || isNaN(sectionIdNum)) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <p className="text-destructive">
          Invalid URL. <Link to="/factories" className="underline">Back to factories</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardNavbar onCollapsedChange={setIsNavCollapsed} />

      <div className={`flex-1 transition-all duration-300 ${isNavCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="bg-card dark:bg-[hsl(var(--nav-background))] border-b border-border px-8 py-5 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/factories">Factories</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={`/factories/${factoryId}`}>{factory?.name ?? 'Factory'}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{section ? section.name : 'Section'}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <div className="h-6 w-px bg-border" />
              <div className="w-10 h-10 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                <Layers className="h-5 w-5 text-brand-primary" />
              </div>
              <h1 className="text-2xl font-bold text-card-foreground">
                {section ? section.name : 'Section'}
              </h1>
            </div>
            {section && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
                className="border-border"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Section
              </Button>
            )}
          </div>
        </div>

        <div className="p-8 bg-background">
          {isLoadingFactory || isLoadingSection ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-brand-primary mb-4" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : error || !section ? (
            <Card className="shadow-sm bg-card border-border">
              <CardContent className="py-16">
                <div className="flex flex-col items-center justify-center">
                  <p className="text-destructive mb-4">Section not found.</p>
                  <Button onClick={() => navigate(`/factories/${factoryId}`)} variant="outline">
                    Back to Factory
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-3">
                <Card className="shadow-sm bg-card border-border">
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <LayoutGrid className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-card-foreground">—</p>
                        <p className="text-xs text-muted-foreground">Machines (placeholder)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-sm bg-card border-border lg:col-span-2">
                <CardHeader className="py-4">
                  <CardTitle className="text-card-foreground text-base">Section Details</CardTitle>
                  <CardDescription className="text-xs">Basic information.</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground font-medium">ID</dt>
                      <dd className="mt-0.5 font-mono">{section.id}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground font-medium">Name</dt>
                      <dd className="mt-0.5">{section.name}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground font-medium">Factory</dt>
                      <dd className="mt-0.5">{factory?.name ?? '—'}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <EditFactorySectionDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        section={section ?? null}
        sections={sections}
      />
    </div>
  );
};

export default FactorySectionDetailPage;
