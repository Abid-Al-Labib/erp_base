import { Link, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import NavigationBar from "../components/customui/NavigationBar"
import { Button } from "../components/ui/button"
import { CirclePlus, CircleX, Loader2 } from "lucide-react"
import { useState } from "react"
import { insertPart } from "@/services/PartsService"
import toast from 'react-hot-toast'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

const CreateOrderPage = () => {
    const [factoryName, setFactoryName] = useState('');
    const [department, setDepartment] = useState('');
    const [orderType, setOrderType] = useState('');
    const [machineType, setMachineType] = useState('');  // Additional state for machine type if 'Machine' is selected
    const [description, setDescription] = useState('');  // State for the description
   
    
    const [isSubmitting, setIsSubmitting] = useState(false);


    const handleCreateOrder = async () => {
        setIsSubmitting(true);
        try{
            const orderData = {
                factoryName,
                department,
                orderType,
                description
            };

            if (!factoryName || !department || !orderType || !description) {
                toast.error("Please fill out all the fields");
                return;
            }

            if (orderType === 'machine'){
                if(!machineType){
                    toast.error("Please specify the Machine Details");
                    return;
                }
            }


            const response = await insertPart(factoryName,
                department,
                orderType)
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
        // Reset all state variables
        setFactoryName('');
        setDepartment('');
        setOrderType('');
        setMachineType('');
        setDescription('')
        // Navigate('/orders');  // Redirect to the orders page or dashboard
    };


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
                            <Select onValueChange={setFactoryName}>
                                <Label htmlFor="factoryName">Factory Name</Label>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue>{factoryName || "Select Factory"}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="acml">Akbar Cotton Mills Limited (ACML)</SelectItem>
                                    <SelectItem value="acl">Akbar Composite Limited (ACL)</SelectItem>
                                    <SelectItem value="atml">Akbar Textile Mills Limited (ATML)</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select onValueChange={setDepartment}>
                                <Label htmlFor="department">Department</Label>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue>{department || "Select Department"}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="electrical">Electrical</SelectItem>
                                    <SelectItem value="mechanical">Mechanical</SelectItem>
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
                            )}

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