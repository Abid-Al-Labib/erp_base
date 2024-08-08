import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import NavigationBar from "./NavigationBar"
import { Button } from "../ui/button"
import { CirclePlus, CircleX } from "lucide-react"

const AddPart = () => {
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
                                <Label htmlFor="name">Vendor</Label>
                                <Input
                                id="vendor"
                                type="text"
                                className="w-full"
                                defaultValue=""
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row col-2 w-full items-start gap-6 overflow-auto p-0">
                                <div className="grid gap-3 p-1">
                                    <Label htmlFor="Cost/unit">Cost/unit</Label>
                                    <Input id="cost" type="text" placeholder="" />
                                </div>
                                <div className="grid gap-3 p-1">
                                    <Label htmlFor="Unit">Unit</Label>
                                    <Input id="unit" type="text" placeholder="" />
                                </div>  
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
                        <Button size="sm" className="ml-auto gap-2">
                            <CirclePlus className="h-4 w-4" />
                            Add Part
                        </Button>
                        <Link to="/parts">
                            <Button size="sm" className="ml-auto gap-2">
                                <CircleX className="h-4 w-4" />
                                Cancel
                            </Button>
                        </Link>
                        </div>
                    </CardContent>
                    
                </Card>


             </div>
        </>

  )
}

export default AddPart