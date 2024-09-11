import { OrderedPart } from '@/types'
import React, { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '../ui/table'
import LinkedOrdersRow from './LinkedOrdersRow'
import { fetchOrderByID } from '@/services/OrdersService'

interface LinkedOrdersTableProp {
    linkedOrderedParts: OrderedPart[]
}

const LinkedOrdersTable: React.FC<LinkedOrdersTableProp> = ({linkedOrderedParts}) => {
    

    
    // useEffect(() => {
    //     const loadOrder = async () => {
    //       const order_id = linkedOrderedParts.
    //       try {
    //         const order_data = await fetchOrderByID(Link);
    //         if (part_data && part_data.length > 0) {
    //           setParts(part_data);
    //         } else {
    //           toast.error("Part not found");
    //           navigate("/parts");
    //         }
            
    //       } catch (error) {
    //         toast.error("Failed to fetch Part info");
    //         navigate("/parts");
    //       } finally {
    //         setLoadingPartInfo(false);
    //         setLoadingTable(false);
    //       }
    
    //       try {
    //         const linked_ordered_parts_data = await fetchOrderedPartByPartID(part_id);
    //         console.log(linked_ordered_parts_data)
    //         setlinkedOrderedParts(linked_ordered_parts_data);
            
    //       } catch (error) {
    //         toast.error("Failed to fetch linked orders");
    //       } finally {
    //         setLoadingPartInfo(false);
    //       }
    //     };
    //     loadParts();
    //   }, [id, navigate]);
    return (
    <div>
        <Card x-chunk="dashboard-06-chunk-0" className="mt-5">
            <CardHeader>
                <CardTitle>Linked Orders</CardTitle>
                <CardDescription>
                    This is a list of orders that are linked to this part.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead className="hidden md:table-cell">Created at</TableHead>
                        <TableHead>Machine</TableHead>
                        <TableHead className="hidden md:table-cell">Qty</TableHead>
                        <TableHead className="hidden md:table-cell">Unit Cost</TableHead>
                        <TableHead className="hidden md:table-cell">Vendor</TableHead>
                        <TableHead className="hidden md:table-cell">Purchased Date</TableHead>
                        <TableHead className="hidden md:table-cell">Sent To Factory Date</TableHead>
                        <TableHead className="hidden md:table-cell">Received By Factory Date</TableHead>
                        <TableHead className="md:hidden">Info</TableHead>
                        <TableHead>
                        <span>Actions</span>
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                        <TableBody>
                        {linkedOrderedParts.map(alinkedOrderedPart => (                                        
                            <LinkedOrdersRow key={alinkedOrderedPart.id} 
                                linkedOrderPart={alinkedOrderedPart}          
                            />
                        ))}
                        </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  )
}

export default LinkedOrdersTable