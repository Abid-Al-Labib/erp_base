import { Order, OrderedPart } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"
import { Badge } from "../ui/badge"
import { useEffect, useState } from "react"
import { fetchOrderedPartsByOrderID } from "@/services/OrderedPartsService"
import { Loader2, Cog, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface OrderMachineInfoProps {
    order: Order
    mode: 'view' | 'manage' | 'default'
}

const OrderMachineInfo: React.FC<OrderMachineInfoProps> = ({ order, mode }) => {
    const [orderedParts, setOrderedParts] = useState<OrderedPart[]>([])
    const [loading, setLoading] = useState(true)

    // Only show for machine orders (PFM, STM)
    const isMachineOrder = order.order_type === "PFM" || order.order_type === "STM"
    
    if (!isMachineOrder) {
        return null
    }

    useEffect(() => {
        const loadOrderedParts = async () => {
            try {
                setLoading(true)
                const parts = await fetchOrderedPartsByOrderID(order.id)
                setOrderedParts(parts || [])
            } catch (error) {
                console.error("Failed to fetch ordered parts:", error)
            } finally {
                setLoading(false)
            }
        }

        loadOrderedParts()
    }, [order.id])

    const calculateTotalQuantity = () => {
        return orderedParts.reduce((total, part) => total + part.qty, 0)
    }

    const getUnstableTypeDisplay = (unstableType: string | null) => {
        if (!unstableType) return null
        
        switch (unstableType) {
            case 'defective':
                return 'Defective Parts'
            case 'less':
                return 'Fewer Parts'
            default:
                return unstableType
        }
    }

    const getPartsTransformation = () => {
        if (order.marked_inactive || !order.unstable_type) return null

        const totalQty = calculateTotalQuantity()
        let afterQty = totalQty
        let description = ""

        switch (order.unstable_type) {
            case 'defective':
                // Some parts will be defective, so fewer working parts
                afterQty = Math.floor(totalQty * 0.7) // Assume 70% will be working
                description = "working parts"
                break
            case 'less':
                // Using fewer parts to keep running
                afterQty = Math.floor(totalQty * 0.8) // Assume using 80% of parts
                description = "parts used"
                break
            default:
                return null
        }

        return {
            before: totalQty,
            after: afterQty,
            description
        }
    }

    const getMachineStatusIcon = () => {
        if (order.marked_inactive) {
            return <XCircle className="h-4 w-4 text-red-500" />
        }
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }

    const getMachineStatusBadge = () => {
        if (order.marked_inactive) {
            return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Inactive</Badge>
        }
        
        if (order.unstable_type) {
            const unstableText = order.unstable_type === 'defective' ? 'Defective Parts' : 
                               order.unstable_type === 'less' ? 'Less Parts' : order.unstable_type
            return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                Active - {unstableText}
            </Badge>
        }
        
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Active</Badge>
    }

    return (
        <Card className="sm:col-span-1 h-full flex flex-col w-full">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <Cog className="h-5 w-5" />
                    {mode === "view" ? "Machine Info" : mode === "manage" ? "Machine Status" : "Machine Details"}
                </CardTitle>
            </CardHeader>
            <Separator className="my-4" />
            <CardContent className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                    </div>
                ) : (
                    <ul className="grid gap-3">
                        {/* Machine Information */}
                        <li className="flex items-center justify-between">
                            <span className="font-semibold text-muted-foreground">Machine</span>
                            <span className="text-right text-sm">
                                {order.factories?.abbreviation} - {order.factory_sections?.name} - {order.machines?.name}
                            </span>
                        </li>

                        {/* Machine Status */}
                        <li className="flex items-center justify-between">
                            <span className="font-semibold text-muted-foreground flex items-center gap-2">
                                {getMachineStatusIcon()}
                                Machine Status
                            </span>
                            {getMachineStatusBadge()}
                        </li>

                        {/* Source Factory for STM orders */}
                        {order.order_type === "STM" && order.src_factory && (
                            <li className="flex items-center justify-between">
                                <span className="font-semibold text-muted-foreground">Source Factory</span>
                                <span>{order.src_factory}</span>
                            </li>
                        )}

                        <Separator className="my-2" />

                        {/* Ordered Parts List */}
                        {orderedParts.length > 0 && (
                            <li className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-muted-foreground">Ordered Parts:</span>
                                    <span className="text-xs text-muted-foreground">Before → After</span>
                                </div>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {orderedParts.map((part, index) => {
                                        const currentQty = part.qty
                                        let reducedQty = currentQty

                                        // Calculate reduced quantity if machine has issues
                                        if (!order.marked_inactive && order.unstable_type) {
                                            switch (order.unstable_type) {
                                                case 'defective':
                                                    reducedQty = Math.floor(currentQty * 0.7)
                                                    break
                                                case 'less':
                                                    reducedQty = Math.floor(currentQty * 0.8)
                                                    break
                                            }
                                        }

                                        // If part is not in storage initially, show 0 → new
                                        const initialQty = part.in_storage ? currentQty : 0
                                        const finalQty = part.in_storage ? reducedQty : currentQty

                                        return (
                                            <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                                                <span className="font-medium">{part.parts.name}</span>
                                                <span className="text-muted-foreground">
                                                    {initialQty} → {finalQty}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </li>
                        )}

                        {/* Extra Machine Parts Section (Collapsed) */}
                        <li className="flex flex-col gap-2">
                            <details className="group">
                                <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                                    <span>Other Machine Parts</span>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">+</span>
                                </summary>
                                <div className="mt-2 p-3 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
                                    <div className="text-xs text-muted-foreground mb-2">
                                        Additional machine parts and components...
                                    </div>
                                    {/* Placeholder for additional machine parts */}
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span>Spare Bearings</span>
                                            <span className="text-muted-foreground">5 units</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span>Lubrication System</span>
                                            <span className="text-muted-foreground">2 sets</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span>Control Panel</span>
                                            <span className="text-muted-foreground">1 unit</span>
                                        </div>
                                    </div>
                                </div>
                            </details>
                        </li>
                    </ul>
                )}
            </CardContent>
        </Card>
    )
}

export default OrderMachineInfo
