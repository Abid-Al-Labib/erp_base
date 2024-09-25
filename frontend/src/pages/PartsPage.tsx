import { useEffect, useState } from 'react';
import { fetchParts } from '../services/PartsService';
import { useNavigate } from "react-router-dom"
import { Loader2, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import { Tabs, TabsContent,} from "@/components/ui/tabs"
import PartsTableRow from "@/components/customui/PartsTableRow"
import NavigationBar from "@/components/customui/NavigationBar"
import { Part } from '@/types';
import toast from 'react-hot-toast';
import { convertUtcToBDTime } from '@/services/helper';
import SearchAndFilter from "@/components/customui/SearchAndFilter"; // Import the SearchAndFilter component
import { fetchAppSettings } from '@/services/AppSettingsService';



const PartsPage = () => {

    const [parts,setParts] = useState<Part[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<any>({});
    const [addPartEnabled, setaddPartEnabled] = useState<boolean>(false)
    const navigate = useNavigate()
    useEffect(() => {
        const loadParts = async () => {
            setLoading(true);
            try {
                const fetchedParts = await fetchParts(
                    filters.partIdQuery || undefined,
                    filters.partNameQuery || undefined
                );
                setParts(fetchedParts);
                if (fetchedParts.length === 0) {
                    toast.error("No parts found");
                }
            } catch (error) {
                toast.error("Failed to fetch parts");
            } finally {
                setLoading(false);
            }
        };

        const loadAddPartSettings = async () => {
            try {
                const settings_data = await fetchAppSettings()
                if (settings_data) {
                    settings_data.forEach((setting) => {
                        if (setting.name === "Add Part") {
                            setaddPartEnabled(setting.enabled)
                        }
                    })
                }
            } catch (error) {
                toast.error("Could not load settings data")
                setaddPartEnabled(false)
            }
        }
        loadAddPartSettings();
        loadParts();
    }, [filters]);

    if (loading) {
        return (
            <div className="flex flex-row justify-center p-5">
                <Loader2 className="animate-spin" />
                <span>Loading...</span>
            </div>
        );
    }
    
    const handleAddPartButtonClick = () => {
        navigate("/addpart")
    }

    return (
        <>
        <NavigationBar/>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Tabs defaultValue="all">
                    <div className="flex items-center">
                    <div className="ml-auto flex items-center gap-2">
                    <div className="relative ml-auto flex-1 md:grow-0">
                        {/* Add the SearchAndFilter Component for filtering */}
                        <SearchAndFilter
                            filterConfig={[
                                { type: 'partId', label: 'Enter Part ID' },
                                { type: 'partName', label: 'Enter Part Name' },
                            ]}
                            onApplyFilters={setFilters}
                            onResetFilters={() => setFilters({})}
                            hideDefaultIdDateSearch={true} // Hides default ID/Date search if not needed
                        />
                    </div>
                            <Button onClick={handleAddPartButtonClick} className="bg-blue-950" disabled={!addPartEnabled}>
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Add Part
                            </span>
                            </Button>
                    </div>
                    </div>
                    <TabsContent value="all">
                    <Card x-chunk="dashboard-06-chunk-0">
                        <CardHeader>
                            <CardTitle>Parts</CardTitle>
                            <CardDescription>
                                Manage parts and view information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="hidden md:table-cell">unit</TableHead>
                                    <TableHead className="hidden md:table-cell">
                                    Created at
                                    </TableHead>
                                    <TableHead>
                                    <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                                </TableHeader>
                                {loading? (
                                    <div className='flex flex-row justify-center'>
                                        <Loader2 className='h-8 w-8 animate-spin'/>
                                    </div>
                                ):
                                    <TableBody>
                                    {parts.map(part => (
                                        <PartsTableRow key={part.id}
                                        id={part.id}
                                        name={part.name}
                                        unit={part.unit}
                                        created_at={convertUtcToBDTime(part.created_at)}                 
                                        />
                                    ))}
                                    </TableBody>
                                }  
                            </Table>
                        </CardContent>
                        <CardFooter>
                            <div className="text-xs text-muted-foreground">
                                Showing <strong>1-10</strong> of <strong>32</strong>{" "}
                                Parts
                            </div>
                        </CardFooter>
                    </Card>
                    </TabsContent>
                </Tabs>
                </main>
            </div>
        </div>
        </>
      )
}
export default PartsPage
