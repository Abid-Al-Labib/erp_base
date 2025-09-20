import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { LucideGlasses } from "lucide-react"
import { useNavigate } from "react-router-dom"


const BusinessLensDisplayCard = () => {
    const navigate = useNavigate()

    return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>ExpenseLens</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <CardDescription>
            Use our reporting tool to get insane insights
        </CardDescription>
        <div className="items-center">
            <Button className='bg-cyan-600' onClick={()=>navigate(`/businesslens`)}>
                ExpenseLens<LucideGlasses className='pl-2'></LucideGlasses>
            </Button>
        </div>

      </CardContent>
    </Card>
  )
}

export default BusinessLensDisplayCard