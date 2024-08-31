import { Link, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import NavigationBar from "../components/customui/NavigationBar"
import { Button } from "../components/ui/button"
import { CirclePlus, CircleX, Loader2, CircleCheck} from "lucide-react"
import { useEffect, useState } from "react"
import { insertOrder } from "@/services/OrdersService";
import toast from 'react-hot-toast'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Order, OrderedPart } from "@/types"
import { fetchFactories } from '@/services/FactoriesService';
import { insertOrderedParts } from '@/services/OrderedPartsService';
import { fetchParts } from "@/services/PartsService"


interface Factory {
    id: number;
    name: string;
}

interface Part {
    qty: number;
    order_id: number;
    part_id: number;
    factory_id: number;
    machine_id: number;
    factory_section_id: number;
    is_sample_sent_to_office: boolean;
    part_sent_by_office_date: string;
    unit_cost: number;
    vendor: string;
    part_received_by_factory_date: string;
    part_purchased_date: string;
  }

function validateReal(input: string) {
    const num = parseFloat(input);
    if (isNaN(num)) {
        return 0.0;  // or return a default value like 0.0 if that makes sense for your application
    }
    return num;
}

const CreateOrderPage = () => {

    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPartForm, setShowPartForm] = useState(false); // To toggle part addition form visibility

    const [factories, setFactories] = useState<Factory[]>([]);
    const [selectedFactoryId, setSelectedFactoryId] = useState<number>(-1); 
    const selectedFactoryName = factories.find(factory => factory.id === selectedFactoryId)?.name || "Select Factory";

    const departments = [
        { id: 1, name: "Electrical" },
        { id: 2, name: "Mechanical" }
    ];
    
    
    const [departmentId, setDepartmentId] = useState<number>(-1); 
    const [orderType, setOrderType] = useState('');
    const [machineType, setMachineType] = useState('');  
    const [description, setDescription] = useState(''); 

   
    const [tempOrderDetails, setTempOrderDetails] = useState<Order | null>(null);


    const [orderId, setOrderId] = useState(-1);

    const selectedDepartmentName = departmentId ? departments.find(dept => dept.id === departmentId)?.name : "Select Department";

    const isOrderFormComplete = selectedFactoryId !== -1 && departmentId !== -1 && orderType;

    const [parts, setParts] = useState([]);

    useEffect(() => {
        const loadParts = async () => {
            const fetchedParts = await fetchParts();
            setParts(fetchedParts);
        };

        loadParts();
    }, []);
    // Order Parts
    const [qty, setQty] = useState<number>(-1);
    const [partId, setPartId] = useState<number>(-1);
    const [factoryId, setFactoryId] = useState<number>(-1);
    const [machineId, setMachineId] = useState<number>(-1);
    const [factorySectionId, setFactorySectionId] = useState<number>(-1);
    const [isSampleSentToOffice, setIsSampleSentToOffice] = useState(false);
    const [partSentByOfficeDate, setPartSentByOfficeDate] = useState(new Date().toISOString());
    const [unitCost, setUnitCost] = useState('');
    const [vendor, setVendor] = useState('');
    const [partReceivedByFactoryDate, setPartReceivedByFactoryDate] = useState(new Date().toISOString());
    const [partPurchasedDate, setPartPurchasedDate] = useState(new Date().toISOString());
    // Array to store all parts
    const [orderParts, setOrderParts] = useState<Part[]>([]);

    const handleCreateOrder = async () => {
        setIsSubmitting(true);
        try{
            if (!isOrderFormComplete) {
                toast.error("Please fill out all required fields");
                return;
            }

            if (selectedFactoryId==-1 || departmentId==-1 || !orderType || !description) {
                toast.error("Please fill out all the fields");
                return;
            }

            

            // Suppose these IDs are fetched or predetermined from your application's state or via another method
            const createdById = 1; // Placeholder: fetch from user session or context
            const statusId = 1; // Placeholder or dynamically set based on some business logic

            
            const orderData: Order = {
                id: 0, // This should be set by the database if it's auto-generated
                created_at: new Date().toISOString(), // Sending the ISO string directly
                order_note: description, // You should have a state or input for this
                created_by_user_id: createdById,
                department_id: departmentId,
                current_status_id: statusId,
                departments: { id: 0, name: '' }, // Minimal stub data
                profiles: { id: 0, email: '', name: '', password: '', permission: '', position: '', user_id: '' },
                statuses: { id: 0, name: '', comment: '' }

            }

            setTempOrderDetails(orderData);
            setShowPartForm(true);  // Show the part addition form
            toast.success("Order details are set. Please add parts.");
        } catch (error) {
            toast.error('Error preparing order: ' + error);
        } finally {
            setIsSubmitting(false);
        }


            // const response = await insertOrder(orderData)
            // console.log(response)
            
            // if (response){
            //     toast.success("Your order has been confirmed, start adding parts below...")

            //     // factoryName.value = "";
            //     // department.value = "";
            //     // orderType.value = "";
            // }
        // }catch(error) {
        //     toast.error('' + error)
        // } finally {
        //     setIsSubmitting(false)
        // } 
    }

    const handleFinalCreateOrder = async () => {
        if (!tempOrderDetails) {
            toast.error("No order details to process.");
            return;
        }

        // Finalize order creation and add parts
        // try {
        //     setIsSubmitting(true);
        //     const orderResponse = await insertOrder(tempOrderDetails);
        //     if (orderResponse && orderResponse.length > 0) {
        //         setOrderId(orderResponse[0].id)
        //         const partPromises: Promise<OrderedPart[] | null>[] = orderParts.map(part => {
        //             const fullPartDetails: OrderedPart  = {
        //             ...part,
        //             order_id: orderId,
        //             id:0,
        //             is_sample_received_by_office: false,
        //             note: null,
        //             orders: {
        //                 id: 0,
        //                 created_at: "",
        //                 order_note: "",
        //                 created_by_user_id: 0,
        //                 department_id: 0,
        //                 current_status_id: 0,
        //                 departments: {
        //                     id: 0,
        //                     name: ""},
        //                 profiles: {
        //                     email: "",
        //                     id: 0,
        //                     name: "",
        //                     password: "",
        //                     permission: "",
        //                     position: "",
        //                     user_id: ""},
        //                 statuses: {
        //                     comment: "",
        //                     id: 0,
        //                     name: ""}},
        //             parts: {
        //                 created_at: "",
        //                 description: "",
        //                 id: 0,
        //                 lifetime: null,
        //                 name: "",
        //                 unit: ""},
                    
        //             };
        //         return insertOrderedParts(fullPartDetails);
        //         });
    
        //     // Await all promises for adding parts
        //     await Promise.all(partPromises);    
        //     toast.success("Order and all parts have been successfully created!");
        //     // Here, you might want to redirect or clear form
        //     }
        // } catch (error) {
        //     toast.error("An error occurred: " + error);
        // } finally {
        //     setIsSubmitting(false);
        // }
        try {
                setIsSubmitting(true);
                const orderResponse = await insertOrder(tempOrderDetails);
                if (orderResponse && orderResponse.length > 0) {
                    setOrderId(orderResponse[0].id)
                    toast("Hey2");

                
                    for (const part of orderParts) {
                        const partDetails = {
                            order_id: orderResponse[0].id,
                            qty: qty,
                            part_id: partId,
                            factory_id: factoryId,
                            machine_id: machineId,
                            factory_section_id: factorySectionId,
                            is_sample_sent_to_office: isSampleSentToOffice,
                            part_sent_by_office_date: new Date().toISOString(),
                            unit_cost: validateReal(unitCost),
                            vendor: vendor,
                            part_received_by_factory_date: new Date().toISOString(),
                            part_purchased_date: new Date().toISOString(),

                    

                        };
                        try {
                            toast("Hey3");

                            await insertOrderedParts(qty,orderResponse[0].id,100,factoryId,machineId,factorySectionId,
                                isSampleSentToOffice,vendor,
                                // partReceivedByFactoryDate,partPurchasedDate
                            );
                            toast.success(`Part added successfully: ${part.part_id}`);
                        } catch (error) {
                            // Handle error per part
                            toast.error(`Failed to add part ${part.part_id}: ${error}`);
                            // Optional: break; // Uncomment if you want to stop processing after the first failure
                        }                    
                    };

                }
            }
        catch (error) {
                toast.error("An error occurred: " + error);
            } finally {
                setIsSubmitting(false);
            }
        
    };

    const handleAddOrderParts = async () => {
        const newPart = {
            qty: qty,
            order_id: -1,
            part_id: partId,
            factory_id: factoryId,
            machine_id: machineId,
            factory_section_id: factorySectionId,
            is_sample_sent_to_office: isSampleSentToOffice,
            part_sent_by_office_date: partSentByOfficeDate,
            unit_cost: validateReal(unitCost),
            vendor,
            part_received_by_factory_date: partReceivedByFactoryDate,
            part_purchased_date: partPurchasedDate
        };
        setOrderParts(prevParts => [...prevParts, newPart]);

        setQty(0);
        setPartId(0);
        setFactoryId(0);
        setMachineId(0);
        setFactorySectionId(0);
        setIsSampleSentToOffice(false);
        setPartSentByOfficeDate('');
        setUnitCost('');
        setVendor('');
        setPartReceivedByFactoryDate('');
        setPartPurchasedDate('');
    }


    const handleCancelOrder = () => {

        setSelectedFactoryId(-1);
        setDepartmentId(-1);
        setOrderType('');
        setMachineType('');
        setDescription('')
        setTempOrderDetails(null);
        // Navigate('/orders');  
    };

    const handleCancelOrderParts = () => {
        setQty(0);
        setPartId(0);
        setFactoryId(0);
        setMachineId(0);
        setFactorySectionId(0);
        setIsSampleSentToOffice(false);
        setPartSentByOfficeDate(new Date().toISOString());
        setUnitCost('');
        setVendor('');
        setPartReceivedByFactoryDate(new Date().toISOString());
        setPartPurchasedDate(new Date().toISOString());
    };

    useEffect(() => {
        const loadFactories = async () => {
            const fetchedFactories = await fetchFactories();
            setFactories(fetchedFactories);  // Assuming this function fetches an array of { id, name }
        };
    
        loadFactories();
    }, []);




    return (
        <>
            <NavigationBar/>
            <div className="grid flex-1 items-start gap-4 p-5 sm:px-6 sm:py-5 md:gap-8">
                <Card x-chunk="dashboard-07-chunk-0">
                    <CardHeader>
                        <CardTitle>Order Details</CardTitle>
                        <CardDescription>Start creating an order</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="grid gap-6">

                            <Select onValueChange={(value) => setSelectedFactoryId(Number(value))}>
                                <Label htmlFor="factoryName">Factory Name</Label>
                                <SelectTrigger className="w-[220px]">
                                    <SelectValue>{selectedFactoryName}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {factories.map((factory) => (
                                        <SelectItem key={factory.id} value={factory.id.toString()}>
                                            {factory.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select onValueChange={(value) => setDepartmentId(Number(value))}>
                                <Label htmlFor="department">Department</Label>
                                <SelectTrigger className="w-[220px]">
                                    <SelectValue>{selectedDepartmentName}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.id.toString()}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select onValueChange={setOrderType}>
                                <Label htmlFor="orderType">Is this Order for Storage or a Machine?</Label>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue>{orderType || "Select an Option"}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="storage">Storage</SelectItem>
                                    <SelectItem value="machine">Machine</SelectItem>
                                </SelectContent>
                            </Select>


                            <div className="grid gap-3">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    defaultValue=""
                                    className="min-h-32"
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>

                                                    {/* BUTTONS */}
                            <div className="flex flex-1 gap-4 py-5">
                                {isSubmitting ? (
                                    <div className="ml-auto flex items-center gap-2">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                        Creating Order..."
                                    </div>
                                ) : (
                                    <>
                                        {!tempOrderDetails && (
                                        <Button 
                                            size="sm"
                                            className="ml-auto gap-2"
                                            onClick={handleCreateOrder}
                                            disabled={!isOrderFormComplete}  // Disable the button if form is not complete
                                        >
                                            <CirclePlus className="h-4 w-4" />Start Order
                                        </Button>
                                        )}
                                        <Link to="/orders">
                                            <Button 
                                                size="sm" 
                                                className="ml-auto gap-2"
                                                onClick={handleCancelOrder}
                                            >
                                                <CircleX className="h-4 w-4" />
                                                Cancel
                                            </Button>
                                        </Link>
                                    </>
                                )
                            }
                            </div>


                        </div>

                        
                    </CardContent>
                
                </Card>


             </div>


            {/* SECOND CARD DATA */}
            {showPartForm && (
                <div className="grid flex-1 items-start gap-4 p-5 sm:px-6 sm:py-5 md:gap-8">
                    <Card x-chunk="dashboard-07-chunk-0">
                        <CardContent>
                        <div className="grid flex-1 items-start gap-4 p-5 sm:px-6 sm:py-5 md:gap-8">
                            <div>
                                <input type="text" value={qty} onChange={e => setQty(Number(e.target.value))} placeholder="Quantity" />
                                <input type="text" value={partId} onChange={e => setPartId(Number(e.target.value))} placeholder="Part ID" />
                                <Select onValueChange={(value) => setFactoryId(Number(value))}>
                                    <Label htmlFor="partFactoryId">Part Factory</Label>
                                    <SelectTrigger className="w-[220px]">
                                        <SelectValue>{factories.find(f => f.id === factoryId)?.name || "Select Factory"}</SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {factories.map((factory) => (
                                            <SelectItem key={factory.id} value={factory.id.toString()}>
                                                {factory.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                            </div>
                        </div>

                        <ul>
                            {orderParts.map((part, index) => (
                                <li key={index}>
                                    Part ID: {part.part_id}, Qty: {part.qty}, Cost: {part.unit_cost}
                                    {/* Display other fields as needed */}
                                </li>
                            ))}
                        </ul>
                            


            
                            {/* BUTTONS */}
                            <div className="flex flex-1 gap-1 py-5 ">
                                {isSubmitting ? (
                                    <div className="ml-auto flex items-center gap-2">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                        Creating Order..."
                                    </div>
                                ) : (
                                    <>
                                        <Button 
                                            size="sm"
                                            className="ml-auto gap-2"
                                            onClick={handleAddOrderParts}  // Ensure this is correctly linked to creating an order
                                        >
                                            <CircleCheck className="h-4 w-4" />Add Order Parts
                                        </Button>
                                        <Button 
                                            size="sm"
                                            className="ml-auto gap-2"
                                            onClick={handleFinalCreateOrder}  // Ensure this is correctly linked to creating an order
                                        >
                                            <CircleCheck className="h-4 w-4" />Create Order
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            className="ml-auto gap-2"
                                            onClick={handleCancelOrderParts}  // Linking the Cancel button to the cancel function
                                        >
                                            <CircleX className="h-4 w-4" />
                                            Cancel
                                        </Button>
                                    </>
                                )
                            }</div>
                        </CardContent>

                    </Card>
                </div>)}
        </>

  )
}

export default CreateOrderPage