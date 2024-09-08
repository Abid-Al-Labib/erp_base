import { useEffect, useState } from 'react';
import { Link } from "react-router-dom"
import {
  Loader2,
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
import NavigationBar from "@/components/customui/NavigationBar"
import toast from 'react-hot-toast';
import OrdersTableRow from '@/components/customui/OrdersTableRow';
import { Order } from '@/types';
import { fetchOrders } from '@/services/OrdersService';



const OrderPage = () => {
    const [orders,setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [ordersPerPage] = useState(10); // Change this to set how many orders per page
    const [searchQuery, setSearchQuery] = useState('');


    const refreshTable = async (page: number = 1, query: string = '') => {
        try {
            setLoading(true);
            const { data, count } = await fetchOrders(page, ordersPerPage, query);
            setOrders(data);
        setTotalPages(Math.ceil((count ?? 0) / ordersPerPage)); // Ensure count is not null
        } catch (error) {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        refreshTable(newPage, searchQuery);
    };


    useEffect(() => {
        refreshTable(currentPage, searchQuery);
    }, [currentPage, searchQuery]);

    return (
        <>
            <NavigationBar />
            <div className="flex min-h-screen mt-3 w-full flex-col bg-muted/40">
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
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                                        />
                                    </div>
                                    <Link to="/createorder">
                                        <Button size="sm" className="h-8 gap-1 bg-blue-950">
                                            <PlusCircle className="h-3.5 w-3.5" />
                                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                                Create New Order
                                            </span>
                                        </Button>
                                    </Link>
                                </div>
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
                                                            key={order.id}
                                                            id={order.id}
                                                            created_by_name={order.profiles.name}
                                                            created_at={order.created_at}
                                                            department_name={order.departments.name}
                                                            current_status={order.statuses.name}
                                                            onDeleteRefresh={() => refreshTable(currentPage, searchQuery)}
                                                        />
                                                    ))}
                                                </TableBody>
                                            )}
                                        </Table>
                                    </CardContent>
                                    <CardFooter>
                                        <div className="flex justify-between items-center w-full text-xs text-muted-foreground">
                                            <span>
                                                Showing <strong>{(currentPage - 1) * ordersPerPage + 1}</strong> to <strong>{Math.min(currentPage * ordersPerPage, orders.length)}</strong> of <strong>{totalPages * ordersPerPage}</strong> Orders
                                            </span>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                >
                                                    Previous
                                                </Button>
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