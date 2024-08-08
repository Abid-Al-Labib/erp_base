// import Image from "next/image"
import { Link } from "react-router-dom"
import {
  ListFilter,
  PlusCircle,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
} from "@/components/ui/tabs"
import PartsTableRow from "@/components/customui/PartsTableRow"
import NavigationBar from "@/components/customui/NavigationBar"

const PartsPage = () => {
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
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                        type="search"
                        placeholder="Search..."
                        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                        />
                    </div>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1">
                            <ListFilter className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Filter
                            </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem checked>
                            Active
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem>
                            Archived
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                        <Link to="/addpart">
                            <Button size="sm" className="h-8 gap-1">
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                Add Part
                            </span>
                            </Button>
                        </Link>

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
                                <TableHead>
                                Cost/unit
                                </TableHead>
                                <TableHead className="hidden md:table-cell">
                                Vendor
                                </TableHead>
                                <TableHead className="hidden md:table-cell">
                                Created at
                                </TableHead>
                                <TableHead>
                                <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            <PartsTableRow
                                    id="1"
                                    name="nut"
                                    unit_cost="25"
                                    unit="pc"
                                    created_at="12-08-2024" 
                                    vendor="adidas"                            
                            />
                            <PartsTableRow
                                    id="1"
                                    name="nut"
                                    unit_cost="25"
                                    unit="pc"
                                    created_at="12-08-2024" 
                                    vendor="adidas"                            
                            />
                            <PartsTableRow
                                    id="1"
                                    name="nut"
                                    unit_cost="25"
                                    unit="pc"
                                    created_at="12-08-2024" 
                                    vendor="adidas"                            
                            />
                            <PartsTableRow
                                    id="1"
                                    name="nut"
                                    unit_cost="25"
                                    unit="pc"
                                    created_at="12-08-2024" 
                                    vendor="adidas"                            
                            />
                            <PartsTableRow
                                    id="1"
                                    name="nut"
                                    unit_cost="25"
                                    unit="pc"
                                    created_at="12-08-2024" 
                                    vendor="adidas"                            
                            />

                            </TableBody>
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
