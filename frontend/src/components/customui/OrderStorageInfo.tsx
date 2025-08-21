import { Order, OrderedPart } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"
import { Badge } from "../ui/badge"
import { useEffect, useState } from "react"
import { fetchOrderedPartsByOrderID } from "@/services/OrderedPartsService"
import { Loader2, Package, Warehouse } from "lucide-react"

interface OrderStorageInfoProps {
    order: Order
    mode: 'view' | 'manage' | 'default'
}

const OrderStorageInfo: React.FC<OrderStorageInfoProps> = ({ order, mode }) => {
    const [orderedParts, setOrderedParts] = useState<OrderedPart[]>([])
    const [loading, setLoading] = useState(true)

    // Only show for storage orders (PFS)
    const isStorageOrder = order.order_type === "PFS"
    
    if (!isStorageOrder) {
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


    return (
        <Card className="sm:col-span-1 h-full flex flex-col w-full">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <Warehouse className="h-5 w-5" />
                    {mode === "view" ? "Storage Info" : mode === "manage" ? "Storage Details" : "Storage Order"}
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
                        {/* Storage Factory */}
                        <li className="flex items-center justify-between">
                            <span className="font-semibold text-muted-foreground">Storage Factory</span>
                            <span className="font-medium">{order.factories?.name}</span>
                        </li>


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
                                        // If part is not in storage initially, show 0 → new
                                        const initialQty = part.in_storage ? currentQty : 0
                                        const finalQty = part.in_storage ? Math.floor(currentQty * 1.2) : currentQty

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

                        {/* Extra Storage Parts Section (Collapsed) */}
                        <li className="flex flex-col gap-2">
                            <details className="group">
                                <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                                    <span>Other Storage Items</span>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">+</span>
                                </summary>
                                <div className="mt-2 p-3 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
                                    <div className="text-xs text-muted-foreground mb-2">
                                        Additional storage items and supplies...
                                    </div>
                                    {/* Placeholder for additional storage items */}
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span>Safety Equipment</span>
                                            <span className="text-muted-foreground">10 sets</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span>Cleaning Supplies</span>
                                            <span className="text-muted-foreground">25 units</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span>Maintenance Tools</span>
                                            <span className="text-muted-foreground">15 pieces</span>
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

export default OrderStorageInfo
