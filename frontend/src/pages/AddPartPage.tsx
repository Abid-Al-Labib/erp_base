import { Link } from "react-router-dom"
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

const AddPartPage = () => {
    
    const [isSubmitting, setisSubmitting] = useState(false);
    
    const handleAddPart = async () => {
        setisSubmitting(true);
        try{
            const nameInput = document.getElementById("name") as HTMLInputElement;
        const unitInput = document.getElementById("unit") as HTMLInputElement;
        const descriptionInput = document.getElementById("description") as HTMLTextAreaElement;

        const name = nameInput.value;
        const unit = unitInput.value;
        const description = descriptionInput.value;

            if (!name || !unit || !description) {
                toast.error("Please fill out all the fields");
                return;
            }

            const response = await insertPart(name,unit,description)
            console.log(response)
            if (response){
                toast.success("Part Added")

                nameInput.value = "";
                unitInput.value = "";
                descriptionInput.value = "";
            }
        }catch(error) {
            toast.error('' + error)
        } finally {
            setisSubmitting(false)
        } 
    }


    return (
        <>
            <NavigationBar/>
            <div className="grid flex-1 items-start gap-4 p-5 sm:px-6 sm:py-5 md:gap-8">
                <Card x-chunk="dashboard-07-chunk-0">
                    <CardHeader>
                        <CardTitle>Part Details</CardTitle>
                        <CardDescription>
                        Enter information regarding this part.
                        </CardDescription>
                        <CardDescription>
                        ID and creation date will be auto assigned.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                id="name"
                                type="text"
                                className="w-full"
                                defaultValue=""
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="name">Unit</Label>
                                <Input
                                id="unit"
                                type="text"
                                className="w-full"
                                defaultValue=""
                                />
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                id="description"
                                defaultValue=""
                                className="min-h-32"
                                />
                            </div>
                        </div>
                        <div className="flex flex-1 gap-4 py-5">
                        {isSubmitting ? (
                            <div className="ml-auto flex items-center gap-2">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                Adding Part...
                            </div>
                        ): 
                            ( 
                                <>
                                    <Button 
                                    size="sm"
                                    className="ml-auto gap-2"
                                    onClick={handleAddPart}
                                    >
                                    <CirclePlus className="h-4 w-4" />
                                    Add Part
                                    </Button>
                                    <Link to="/parts">
                                        <Button 
                                            size="sm" 
                                            className="ml-auto gap-2"
                                        >
                                            <CircleX className="h-4 w-4" />
                                            Cancel
                                        </Button>
                                    </Link>
                                </>
                                
                            )
                        }

                        </div>
                    </CardContent>
                    
                </Card>


             </div>
        </>

  )
}

export default AddPartPage