import React, { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { CalendarIcon, Loader } from 'lucide-react'


import toast from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { getOrdersByPartIDAndDateRange } from '@/services/OrderedPartsService'
import { fetchPartByID } from '@/services/PartsService'
import { OrderedPart, Part } from '@/types'
import { useReactToPrint } from 'react-to-print'
import { Separator } from '@/components/ui/separator'
import { convertUtcToBDTime } from '@/services/helper'
import { useAuth } from '@/context/AuthContext'
import NavigationBar from '@/components/customui/NavigationBar'

// This component would typically be placed in pages/expense-lens/[id].tsx for Next.js routing

interface ExpenseReportOrderData {
    purchase_date: string,
    vendor: string,
    brand: string,
    qty: number,
    unit_cost: number,
    sub_total: number
}

interface PartExpenseReportGeneralData {
    part_id: number,
    part_name: string,
    average_unit_cost: string,
    highest_unit_cost: string,
    lowest_unit_cost: string,
    total_expense: number,
    date_range: string,
    num_of_orders: number,
    orders: ExpenseReportOrderData[]
}

const ExpenseLensPage = () => {
    const { id } = useParams<{ id: string }>()
    const [startDate, setStartDate] = useState<Date>()
    const [endDate, setEndDate] = useState<Date>()
    const [reportData, setReportData] = useState<PartExpenseReportGeneralData|null>(null)
    const [reportDataLoading, setReportDataLoading] = useState<boolean>(false)
    const exportRef = useRef<HTMLDivElement>(null)

    const profile = useAuth().profile;

    const generateReport = async () => {
        if (!startDate) {
            toast.error("Please select a start date")
            return
        }
        if (!endDate) {
            toast.error("Please select an end date")
            return
        }

        if(startDate<=endDate){
            if (!id){
                toast.error('Error parsing id')
                return
            } else {
                const part_id = parseInt(id);
                setReportDataLoading(true)
                try {
                    const expenseLensOrders: OrderedPart[] = await getOrdersByPartIDAndDateRange(part_id,startDate,endDate)
                    const part_info: Part = await fetchPartByID(part_id)
                    
                    let total_expense = 0
                    const num_of_orders = expenseLensOrders.length
                    let order_data: ExpenseReportOrderData[] = [] 
                    expenseLensOrders.map((order_part) => {
                        let subtotal = (order_part.qty) * (order_part.unit_cost ?? 0);
                        const each_order: ExpenseReportOrderData = {
                            purchase_date: order_part.part_purchased_date? convertUtcToBDTime(order_part.part_purchased_date).split(',')[0] : '-',
                            vendor: order_part.vendor? order_part.vendor:'-',
                            brand: order_part.brand? order_part.brand: '-',
                            qty: order_part.qty,
                            unit_cost: order_part.unit_cost? order_part.unit_cost : 0,
                            sub_total: subtotal
                        } 
                        total_expense+=subtotal
                        order_data.push(each_order)
                    });
                    
                    const unitCosts: number[] = expenseLensOrders.map(order_part => order_part.unit_cost ?? 0)
                    const avgCost = unitCosts.length > 0 ? (unitCosts.reduce((a, b) => a + b, 0) / unitCosts.length).toFixed(2) : ' - ';
                    const highestCost = unitCosts.length > 0 ? Math.max(...unitCosts).toFixed(2) : ' - ';
                    const lowestCost = unitCosts.length > 0 ? Math.min(...unitCosts).toFixed(2) : ' - ';
                    const part_expense_data: PartExpenseReportGeneralData = {
                        part_id: part_id,
                        part_name: part_info.name,
                        average_unit_cost: avgCost,
                        total_expense: total_expense,
                        date_range: `${startDate.toDateString()} - ${endDate.toDateString()}`,
                        num_of_orders: num_of_orders,
                        orders: order_data,
                        highest_unit_cost: highestCost,
                        lowest_unit_cost: lowestCost
                    }
                    setReportData(part_expense_data)
                    toast.success("Report generated successfully!")
                } catch (error) {
                    toast.error('Failed to load orders')
                }
                setReportDataLoading(false)

            }
        }
        else{
            toast.error("Start date needs to be less than end date")
        }
        
       
    }

    const resetRange = () => {
        setStartDate(undefined)
        setEndDate(undefined)
        setReportData(null)
    }

    const generatePDF = () => {
        printPdf()
    }
    const printPdf = useReactToPrint({
        contentRef: exportRef,
        documentTitle: `Expenselens - ${reportData?.part_name} - ${reportData?.date_range}`,
      })
    
    
    return (
        <>
        <NavigationBar/>
        <div className="container py-6">
            <Card>
                <CardHeader>
                    <CardTitle>
                        <h1 className="text-4xl font-bold mb-3 text-cyan-600">ExpenseLens</h1>
                    </CardTitle>
                    <div>Get instant insights on costs, orders, and spending patterns.</div>
                </CardHeader>
                <CardContent>
                
                <div className="flex lg:flex-row flex-col gap-2 items-center mb-2 justify-between">
                    
                    <div className='flex '>
                        <div className='text-sm flex items-center mr-2'>Date range:</div>
                        <div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !startDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className='mr-2 h-4 w-4'/>
                                        {startDate ? format(startDate, "PPP") : <span>Pick the start date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" onClick={(e) => e.stopPropagation()}>
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        defaultMonth={startDate}
                                        onSelect={setStartDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className='flex items-center mx-2'>-</div>
                        <div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !endDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className='mr-2 h-4 w-4'/>
                                        {endDate ? format(endDate, "PPP") : <span>Pick the end date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" onClick={(e) => e.stopPropagation()}>
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={setEndDate}
                                        defaultMonth={endDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    
                    <div className='flex gap-2'>
                        <Button disabled={!startDate || !endDate} className='bg-cyan-600' onClick={generateReport}>
                            generate report
                        </Button>
                        <Button disabled={!reportData} onClick={generatePDF}>
                            Print
                        </Button>
                        <Button disabled={!reportData} className='bg-red-600' onClick={resetRange}>
                            Reset range
                        </Button>

                        <Link to={`/viewpart/${id}`}>
                            <Button>
                                Back
                            </Button>
                        </Link>

                    </div>

                                
                </div>
                </CardContent>
            </Card>
            
            <Separator className='my-4'></Separator>
                    {reportDataLoading ? (
                    <div className="flex justify-center items-center mt-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-500 border-solid"></div>
                    </div>
                    ) :reportData && (
                    <div className='p-4' ref = {exportRef}>

                            <div className='text-4xl mb-3 text-cyan-600'>ExpenseLens Report</div>
                            <Separator className='mb-6'></Separator>
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-y-6">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date Range</p>
                                        <p className="font-medium">
                                            {startDate && format(startDate, "PPP")} - {endDate && format(endDate, "PPP")}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Part ID</p>
                                        <p className="font-medium">{id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Part Name</p>
                                        <p className="font-medium">{reportData.part_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Avg. Unit Cost</p>
                                        <p className="font-medium">${reportData.average_unit_cost.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Highest Unit Cost</p>
                                        <p className="font-medium">${reportData.highest_unit_cost}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Lowest Unit Cost</p>
                                        <p className="font-medium">${reportData.lowest_unit_cost}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Expense</p>
                                        <p className="font-medium text-lg">${reportData.total_expense.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Number of Orders</p>
                                        <p className="font-medium">{reportData.num_of_orders}</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-sm font-medium mb-2">Order History</h3>
                                    <div className="border rounded-md">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {reportData.orders.map((t: ExpenseReportOrderData, i: number) => (
                                                    <tr key={i}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{t.purchase_date}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{t.vendor}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{t.brand}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{t.qty}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{t.unit_cost}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">${t.sub_total.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                    </div>
                )}
            </div>
            </>
    )
}

export default ExpenseLensPage