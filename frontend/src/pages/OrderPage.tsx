import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { Loader2, PlusCircle, Search, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import NavigationBar from "@/components/customui/NavigationBar";
import toast from 'react-hot-toast';
import OrdersTableRow from '@/components/customui/OrdersTableRow';
import { Order } from '@/types';
import { fetchOrders } from '@/services/OrdersService';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { fetchDepartments, fetchFactories, fetchFactorySections, fetchMachines } from '@/services/FactoriesService';
import { fetchStatuses } from '@/services/StatusesService';
import { Sheet,SheetClose,SheetContent,SheetDescription,SheetFooter,SheetHeader,SheetTitle,SheetTrigger,} from "@/components/ui/sheet"
import { Label } from '@/components/ui/label';


interface Department {
    id: number;
    name: string;
}
interface Status {
    id: number;
    name: string;
}
interface Factory {
    id: number;
    name: string;
}
interface FactorySection {
    id: number;
    name: string;
    factory_id?: number;
}
interface Machine {
    id: number;
    number: number;
    type: string;
    factory_section_id?: number;
}



const OrderPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [ordersPerPage] = useState(5); // Set the number of orders per page here
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<'id' | 'date'>('id'); // Toggle between ID and Date search
    const [tempDate, setTempDate] = useState<Date | undefined>(undefined);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [count, setCount] = useState(0);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [selectedStatusId, setSelectedStatusId] = useState<number | undefined>(undefined);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>(undefined);
    const selectedDepartmentName = selectedDepartmentId ? departments.find(dept => dept.id === selectedDepartmentId)?.name : "All Departments";
    const selectedStatusName = selectedStatusId ? statuses.find(status => status.id === selectedStatusId)?.name : "All Statuses";


    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    const [factories, setFactories] = useState<Factory[]>([]);
    const [selectedFactoryId, setSelectedFactoryId] = useState<number | undefined>(undefined);

    const [factorySections, setFactorySections] = useState<FactorySection[]>([]);
    const [selectedFactorySectionId, setSelectedFactorySectionId] = useState<number | undefined>(undefined);

    const [machines, setMachines] = useState<Machine[]>([]);
    const [selectedMachineId, setSelectedMachineId] = useState<number | undefined>(undefined);

    


    const refreshTable = async () => {
        console.log('Refreshing table...');
        console.log('Current Department ID:', selectedDepartmentId);
        try {
            setLoading(true);
            const { data, count } = await fetchOrders({
                page: currentPage,
                limit: ordersPerPage,
                query: searchType === 'id' ? searchQuery : '',
                searchDate: searchType === 'date' ? selectedDate : undefined,
                statusId: selectedStatusId,
                departmentId: selectedDepartmentId,
                factoryId: selectedFactoryId,
                factorySectionId: selectedFactorySectionId,
                machineId: selectedMachineId,
            });
            setOrders(data);
            setCount(count ?? 0);
            setTotalPages(Math.ceil((count ?? 0) / ordersPerPage));
        } catch (error) {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleDateChange = () => {
        setIsDatePickerOpen(false);
        setCurrentPage(1)
        setSelectedDate(tempDate); // Set the date (undefined is fine here)
        setIsDatePickerOpen(false); // Close the date picker after selecting a date
    };

    const handleSearchTypeChange = (type: 'id' | 'date') => {
        setCurrentPage(1)
        setSearchType(type);
        setSearchQuery('');
        setSelectedDate(undefined)
        if (type === 'date'){
            setIsDatePickerOpen(true);
        };
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleStatusChange = (value: string) => {
        setCurrentPage(1)
        const statusId = value === 'all' ? undefined : Number(value); // Convert the selected value to a number or set to undefined for "All Statuses"
        setSelectedStatusId(statusId); // Directly set the status ID or undefined
        console.log(`Selected Status ID: ${statusId}`); // Log the correct status ID
    };

    const handleDepartmentChange = (value: string) => {
        const departmentId = value === 'all' ? undefined : Number(value); // Convert the selected value to a number or set to undefined for "All Departments"
        setCurrentPage(1)
        setSelectedDepartmentId(departmentId); // Directly set the department ID or undefined
        console.log(`Selected Department ID: ${departmentId}`); // Log the correct department ID
    };

    useEffect(() => {
        refreshTable();
    }, [currentPage, searchQuery, selectedDate]);

    useEffect(() => {
        console.log('Refreshing table with department ID:', selectedDepartmentId);
        refreshTable(); // Call refreshTable after department ID is set
    }, [selectedDepartmentId]);

    useEffect(() => {
        console.log('Refreshing table with status ID:', selectedStatusId);
        refreshTable(); // Call refreshTable after status ID is set
    }, [selectedStatusId]);

    useEffect(() => {
        const loadDepartments = async () => {
            try {
                const fetchedDepartments = await fetchDepartments();
                setDepartments(fetchedDepartments);
            } catch (error) {
                toast.error('Failed to load departments');
            }
        };

        loadDepartments();
    }, []);

    

    useEffect(() => {
        const loadStatuses = async () => {
            try {
                const fetchedStatuses = await fetchStatuses();
                console.log('Fetched Statuses:', fetchedStatuses); // Log the fetched departments to verify
                setStatuses(fetchedStatuses);
            } catch (error) {
                toast.error('Failed to load departments');
            }
        };

        loadStatuses();
    }, []);

    useEffect(() => {
        const loadFactories = async () => {
            try {
                const fetchedFactories = await fetchFactories();
                setFactories(fetchedFactories);
            } catch (error) {
                toast.error('Failed to load factories');
            }
        };
        loadFactories();
    }, []);

    useEffect(() => {
        if (selectedFactoryId !== undefined) {
            const loadFactorySections = async () => {
                try {
                    const fetchedFactorySections = await fetchFactorySections(selectedFactoryId);
                    setFactorySections(fetchedFactorySections);
                } catch (error) {
                    toast.error('Failed to load factory sections');
                }
            };
            loadFactorySections();
        }
    }, [selectedFactoryId]);

    useEffect(() => {
        if (selectedFactorySectionId !== undefined) {
            const loadMachines = async () => {
                try {
                    const fetchedMachines = await fetchMachines(selectedFactorySectionId);
                    setMachines(fetchedMachines);
                } catch (error) {
                    toast.error('Failed to load machines');
                }
            };
            loadMachines();
        }
    }, [selectedFactorySectionId]);

    return (
        <>
            <NavigationBar />
            <div className="flex min-h-screen mt-3 w-full flex-col bg-muted/40">
                <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                        <Tabs defaultValue="all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4"> {/* Grouping filters and searches on the left */}
                                    <div className="grid grid-cols-2 gap-2">
                                        
                                        <Sheet>
                                            <SheetTrigger asChild>
                                                <Button variant="default">Search & Filters</Button>
                                            </SheetTrigger>
                                            <SheetContent className="w-full sm:w-[540px] h-full sm:h-auto" side="right">
                                                <SheetHeader>
                                                    <SheetTitle>Search & Filter Orders</SheetTitle>
                                                    <SheetDescription>Use the filters below to search for orders.</SheetDescription>
                                                </SheetHeader>
                                                <div className="grid gap-4 py-4 overflow-y-auto">

                                                    {/* Factory Filter */}
                                                    <div className="flex flex-col w-full">
                                                        <Label>Factory</Label>
                                                        <Select
                                                            value={selectedFactoryId === undefined ? "all" : selectedFactoryId.toString()}
                                                            onValueChange={(value) => {
                                                                const factoryId = value === 'all' ? undefined : Number(value);
                                                                setSelectedFactoryId(factoryId);
                                                                setSelectedFactorySectionId(undefined); // Reset sections and machines when factory changes
                                                                setSelectedMachineId(undefined);
                                                            }}
                                                        >
                                                            <SelectTrigger className="w-full sm:w-[220px]">
                                                                <SelectValue>
                                                                    {selectedFactoryId === undefined ? "All Factories" : factories.find(f => f.id === selectedFactoryId)?.name}
                                                                </SelectValue>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="all">All Factories</SelectItem>
                                                                {factories.map(factory => (
                                                                    <SelectItem key={factory.id} value={factory.id.toString()}>
                                                                        {factory.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Factory Section Filter */}
                                                    <div className="flex flex-col w-full">
                                                        <Label>Factory Section</Label>
                                                        <Select
                                                            value={selectedFactorySectionId === undefined ? "all" : selectedFactorySectionId.toString()}
                                                            onValueChange={(value) => {
                                                                const sectionId = value === 'all' ? undefined : Number(value);
                                                                setSelectedFactorySectionId(sectionId);
                                                                setSelectedMachineId(undefined); // Reset machines when section changes
                                                            }}
                                                            disabled={!selectedFactoryId} // Disable until a factory is selected
                                                        >
                                                            <SelectTrigger className="w-full sm:w-[220px]">
                                                                <SelectValue>
                                                                    {selectedFactorySectionId === undefined ? "All Sections" : factorySections.find(s => s.id === selectedFactorySectionId)?.name}
                                                                </SelectValue>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="all">All Sections</SelectItem>
                                                                {factorySections.map(section => (
                                                                    <SelectItem key={section.id} value={section.id.toString()}>
                                                                        {section.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Machine Filter */}
                                                    <div className="flex flex-col w-full">
                                                        <Label>Machine</Label>
                                                        <Select
                                                            value={selectedMachineId === undefined ? "all" : selectedMachineId.toString()}
                                                            onValueChange={(value) => setSelectedMachineId(value === 'all' ? undefined : Number(value))}
                                                            disabled={!selectedFactorySectionId} // Disable until a section is selected
                                                        >
                                                            <SelectTrigger className="w-full sm:w-[220px]">
                                                                <SelectValue>
                                                                    {selectedMachineId === undefined ? "All Machines" : machines.find(m => m.id === selectedMachineId)?.number}
                                                                </SelectValue>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="all">All Machines</SelectItem>
                                                                {machines.map(machine => (
                                                                    <SelectItem key={machine.id} value={machine.id.toString()}>
                                                                        {machine.number}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Existing Department Filter */}
                                                    <div className="flex flex-col w-full">
                                                        <Label>Department</Label>
                                                        <Select
                                                            value={selectedDepartmentId === undefined ? "all" : selectedDepartmentId.toString()}
                                                            onValueChange={(value) => setSelectedDepartmentId(value === 'all' ? undefined : Number(value))}
                                                        >
                                                            <SelectTrigger className="w-full sm:w-[220px]">
                                                                <SelectValue>
                                                                    {selectedDepartmentId === undefined ? "All Departments" : departments.find(d => d.id === selectedDepartmentId)?.name}
                                                                </SelectValue>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="all">All Departments</SelectItem>
                                                                {departments.map(dept => (
                                                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                                                        {dept.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Existing Status Filter */}
                                                    <div className="flex flex-col w-full">
                                                        <Label>Status</Label>
                                                        <Select
                                                            value={selectedStatusId === undefined ? "all" : selectedStatusId.toString()}
                                                            onValueChange={(value) => setSelectedStatusId(value === 'all' ? undefined : Number(value))}
                                                        >
                                                            <SelectTrigger className="w-full sm:w-[220px]">
                                                                <SelectValue>
                                                                    {selectedStatusId === undefined ? "All Statuses" : statuses.find(s => s.id === selectedStatusId)?.name}
                                                                </SelectValue>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="all">All Statuses</SelectItem>
                                                                {statuses
                                                                    .sort((a, b) => a.id - b.id)
                                                                    .map((status) => (
                                                                        <SelectItem key={status.id} value={status.id.toString()}>
                                                                            {status.name}
                                                                        </SelectItem>
                                                                    ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Search by ID and Date Buttons */}
                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                        <Button
                                                            variant={searchType === 'id' ? 'default' : 'outline'}
                                                            onClick={() => handleSearchTypeChange('id')}
                                                            className="w-full"
                                                        >
                                                            Search by ID
                                                        </Button>
                                                        <Button
                                                            variant={searchType === 'date' ? 'default' : 'outline'}
                                                            onClick={() => handleSearchTypeChange('date')}
                                                            className="w-full"
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            Search by Date
                                                        </Button>
                                                    </div>

                                                    {/* Conditional Rendering based on Search Type */}
                                                    {searchType === 'id' && (
                                                        <div className="flex flex-col">
                                                            <Label>Enter ID</Label>
                                                            <Input
                                                                type="search"
                                                                placeholder="Search by ID..."
                                                                value={searchQuery}
                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                                className="w-full"
                                                            />
                                                        </div>
                                                    )}

                                                    {isDatePickerOpen && (
                                                        <div className="flex flex-col">
                                                            <Label>Select Date</Label>
                                                            <Calendar
                                                                mode="single"
                                                                selected={tempDate}
                                                                onSelect={setTempDate}
                                                                className="rounded-md border"
                                                            />
                                                            <Button
                                                                onClick={handleDateChange}
                                                                className="bg-blue-950 text-white px-4 py-2 rounded-md mt-2 w-full"
                                                            >
                                                                Confirm
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>

                                                <SheetFooter className="flex flex-col gap-2">
                                                    <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                                                        Reset Filters and Search
                                                    </Button>
                                                    <SheetClose asChild>
                                                        <Button type="submit" className="bg-blue-950 text-white w-full">
                                                            Apply Filters
                                                        </Button>
                                                    </SheetClose>
                                                </SheetFooter>
                                            </SheetContent>
                                        </Sheet>
                                        
                                    </div>
                                    
                                   
                                </div>

                                {/* Create Order Button - Positioned on the right */}
                                <Link to="/createorder">
                                    <Button size="sm" className="h-8 gap-1 bg-blue-950">
                                        <PlusCircle className="h-3.5 w-3.5" />
                                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                            Create New Order
                                        </span>
                                    </Button>
                                </Link>
                            </div>
                            <TabsContent value="all">
                                <Card x-chunk="dashboard-06-chunk-0">
                                    <CardHeader>
                                        <CardTitle>Order List</CardTitle>
                                        <CardDescription>
                                            Search and view orders.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>ID</TableHead>
                                                    <TableHead>Machine</TableHead>
                                                    <TableHead className="hidden md:table-cell">Created at</TableHead>
                                                    <TableHead>Created by user</TableHead>
                                                    <TableHead>Department</TableHead>
                                                    <TableHead>Current status</TableHead>
                                                    <TableHead>
                                                        <span className="sr-only">Actions</span>
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            {loading ? (
                                                <div className='flex flex-row justify-center'>
                                                    <Loader2 className='h-8 w-8 animate-spin' />
                                                </div>
                                            ) : (
                                                <TableBody>
                                                    {orders.map(order => (
                                                        <OrdersTableRow
                                                            order={order}
                                                            onDeleteRefresh={refreshTable}
                                                        />
                                                    ))}
                                                </TableBody>
                                            )}
                                        </Table>
                                    </CardContent>
                                    <CardFooter>
                                        <div className="flex justify-between items-center w-full text-xs text-muted-foreground">
                                            <span>
                                                Showing <strong>{(currentPage - 1) * ordersPerPage + 1}</strong> to <strong>{Math.min(currentPage * ordersPerPage, count)}</strong> of <strong>{count}</strong> Orders
                                            </span>
                                            
                                            
                                            <div className="flex gap-2">
                                                {/* Previous button */}
                                                <Button
                                                    size="sm"
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                >
                                                    Previous
                                                </Button>

                                                {/* First page */}
                                                <Button
                                                    size="sm"
                                                    variant={currentPage === 1 ? 'default' : 'outline'}
                                                    onClick={() => handlePageChange(1)}
                                                >
                                                    1
                                                </Button>

                                                {/* Pages before currentPage */}
                                                {currentPage > 3 && <span className="px-2">...</span>}
                                                {Array.from({ length: 2 }, (_, i) => currentPage - 2 + i)
                                                    .filter(page => page > 1 && page < totalPages)
                                                    .map(page => (
                                                        <Button
                                                            key={page}
                                                            size="sm"
                                                            variant={currentPage === page ? 'default' : 'outline'}
                                                            onClick={() => handlePageChange(page)}
                                                        >
                                                            {page}
                                                        </Button>
                                                    ))
                                                }

                                                {/* Current page */}
                                                {currentPage !== 1 && currentPage !== totalPages && (
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                    >
                                                        {currentPage}
                                                    </Button>
                                                )}

                                                {/* Pages after currentPage */}
                                                {Array.from({ length: 2 }, (_, i) => currentPage + i + 1)
                                                    .filter(page => page > 1 && page < totalPages)
                                                    .map(page => (
                                                        <Button
                                                            key={page}
                                                            size="sm"
                                                            variant={currentPage === page ? 'default' : 'outline'}
                                                            onClick={() => handlePageChange(page)}
                                                        >
                                                            {page}
                                                        </Button>
                                                    ))
                                                }

                                                {currentPage < totalPages - 2 && <span className="px-2">...</span>}

                                                {/* Last page */}
                                                {totalPages > 1 && (
                                                    <Button
                                                        size="sm"
                                                        variant={currentPage === totalPages ? 'default' : 'outline'}
                                                        onClick={() => handlePageChange(totalPages)}
                                                    >
                                                        {totalPages}
                                                    </Button>
                                                )}

                                                {/* Next button */}
                                                <Button
                                                    size="sm"
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    Next
                                                </Button>
                                            </div>

                                        </div>
                                    </CardFooter>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </main>
                </div>
            </div>
        </>
    );
}

export default OrderPage;
