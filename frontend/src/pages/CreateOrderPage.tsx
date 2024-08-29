import { Link, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import NavigationBar from "../components/customui/NavigationBar"
import { Button } from "../components/ui/button"
import { CirclePlus, CircleX, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { insertOrder } from "@/services/OrdersService";
import toast from 'react-hot-toast'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Order } from "@/types"
import { fetchFactories } from '@/services/FactoriesService';


interface Factory {
    id: number;
    name: string;
}

const CreateOrderPage = () => {

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

   
    
    const [isSubmitting, setIsSubmitting] = useState(false);


    const handleCreateOrder = async () => {
        setIsSubmitting(true);
        try{
            

            if (selectedFactoryId==-1 || departmentId==-1 || !orderType || !description) {
                toast.error("Please fill out all the fields");
                return;
            }

            if (orderType === 'machine'){
                if(!machineType){
                    toast.error("Please specify the Machine Details");
                    return;
                }
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


            const response = await insertOrder(orderData)
            console.log(response)
            if (response){
                toast.success("Part Added")

                // factoryName.value = "";
                // department.value = "";
                // orderType.value = "";
            }
        }catch(error) {
            toast.error('' + error)
        } finally {
            setIsSubmitting(false)
        } 
    }

    const handleCancel = () => {

        setSelectedFactoryId(-1);
        setDepartmentId(-1);
        setOrderType('');
        setMachineType('');
        setDescription('')
        // Navigate('/orders');  
    };

    useEffect(() => {
        const loadFactories = async () => {
            const fetchedFactories = await fetchFactories();
            setFactories(fetchedFactories);  // Assuming this function fetches an array of { id, name }
        };
    
        loadFactories();
    }, []);

    const selectedDepartmentName = departmentId ? departments.find(dept => dept.id === departmentId)?.name : "Select Department";



    return (
        <>
            <NavigationBar/>
            <div className="grid flex-1 items-start gap-4 p-5 sm:px-6 sm:py-5 md:gap-8">
                <Card x-chunk="dashboard-07-chunk-0">
                    <CardHeader>
                        <CardTitle>Order Details</CardTitle>
                        <CardDescription>
                        Start creating an order
                        </CardDescription>
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




                        </div>
                    </CardContent>
                
                </Card>


                

                        






             </div>

             <div className="grid flex-1 items-start gap-4 p-5 sm:px-6 sm:py-5 md:gap-8">
                <Card x-chunk="dashboard-07-chunk-0">
                    <CardContent>
                    <div className="grid flex-1 items-start gap-4 p-5 sm:px-6 sm:py-5 md:gap-8">
                            {orderType === 'machine' && (
                                    <Select onValueChange={setMachineType}>
                                        <Label htmlFor="machineType">Machine Type</Label>
                                        <SelectTrigger className="w-full">
                                            <SelectValue>
                                                {machineType || "Select Machine Type"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="type1">Type 1</SelectItem>
                                            <SelectItem value="type2">Type 2</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )
                            }
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
                                    <Button 
                                        size="sm"
                                        className="ml-auto gap-2"
                                        onClick={handleCreateOrder}  // Ensure this is correctly linked to creating an order
                                    >
                                        <CirclePlus className="h-4 w-4" />Create Order
                                    </Button>
                                    <Link to="/orders">
                                        <Button 
                                            size="sm" 
                                            className="ml-auto gap-2"
                                            onClick={handleCancel}  // Linking the Cancel button to the cancel function
                                        >
                                            <CircleX className="h-4 w-4" />
                                            Cancel
                                        </Button>
                                    </Link>
                                </>
                            )
                        }</div>

                    </CardContent>
                </Card>
             </div>
        </>

  )
}

export default CreateOrderPage