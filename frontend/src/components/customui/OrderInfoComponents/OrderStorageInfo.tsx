import { Order, OrderedPart, StoragePart } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Separator } from "../../ui/separator"

import { useEffect, useState } from "react"
import { fetchOrderedPartsByOrderID } from "@/services/OrderedPartsService"
import { Loader2, Warehouse } from "lucide-react"
import { fetchStorageParts } from "@/services/StorageService"

interface OrderStorageInfoProps {
    order: Order
    mode: 'view' | 'manage' | 'default'
}

const OrderStorageInfo: React.FC<OrderStorageInfoProps> = ({ order, mode }) => {
    const [orderedParts, setOrderedParts] = useState<OrderedPart[]>([])
    const [loading, setLoading] = useState(true)
    const [storageParts, setStorageParts] = useState<StoragePart[]>([])
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

        const loadStorageItems = async () => {
            try {
                const items = await fetchStorageParts({factoryId: order.factories!.id})
                setStorageParts(items.data || [])
            } catch (error) {
                console.error("Failed to fetch storage items:", error)
            }
        }

        loadOrderedParts()
        loadStorageItems()
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
                                    <span className="text-xs text-muted-foreground">Currently → On Approval → On Completion</span>
                                </div>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {orderedParts.map((part, index) => {
                                        const storagePart = storageParts.find((sp) => sp.parts.id === part.parts.id);
                                        const beforeQty = storagePart ? storagePart.qty : 0;
                                        const afterQty = beforeQty + part.qty; // After parts are added to storage (PFS logic)
                                        const currentQty = beforeQty; // Currently same as before until order is processed

                                        return (
                                            <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded gap-2">
                                                <span className="font-medium flex-1">{part.parts.name}</span>
                                                <span className="text-muted-foreground flex-shrink-0">
                                                    {beforeQty} → {afterQty} → {currentQty} {part.parts.unit}
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
                                        Additional storage items currently in the storage
                                    </div>
                                    <div className="space-y-1">
                                        {storageParts.filter((part) => 
                                            !orderedParts.some((ordered) => ordered.parts.id === part.parts.id)
                                        ).map((part) => (
                                            <div key={part.id} className="flex items-center justify-between text-xs">
                                                <span className="text-xs">{part.parts.name}</span>
                                                <span className="text-muted-foreground">{part.qty} {part.parts.unit}</span>
                                            </div>
                                        ))}
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
