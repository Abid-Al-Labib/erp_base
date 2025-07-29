import { Link, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import NavigationBar from "../components/customui/NavigationBar"
import { Button } from "../components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CirclePlus, CircleX, Loader2, CircleCheck, X, Clock, FileText, Package } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { fetchOrderByReqNumandFactory, insertOrder, insertOrderStorage } from "@/services/OrdersService";

import toast from 'react-hot-toast'
import AsyncSelect from 'react-select/async';

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { fetchFactories, fetchFactorySections, fetchDepartments } from '@/services/FactoriesService';
import { fetchAllMachines, setMachineIsRunningById } from "@/services/MachineServices"
import { insertOrderedParts } from '@/services/OrderedPartsService';
import { fetchAllParts, searchPartsByName, fetchPageParts } from "@/services/PartsService"
import { Part } from "@/types"
import { InsertStatusTracker } from "@/services/StatusTrackerService"
import { fetchStoragePartQuantityByFactoryID } from "@/services/StorageService"
import { useAuth } from "@/context/AuthContext"
import { Input } from "@/components/ui/input"
import { fetchAppSettings } from "@/services/AppSettingsService"
import { 
    Department, 
    Factory, 
    FactorySection, 
    Machine,
    InputOrder, 
    InputOrderedPart 
} from "@/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { isFeatureSettingEnabled } from "@/services/helper"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import AddPartPopup from "@/components/customui/Parts/AddPartPopup"


const CreateOrderPage = () => {

    const profile = useAuth().profile
    const appSettings = useAuth().appSettings
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [factories, setFactories] = useState<Factory[]>([]);
    const [selectedFactoryId, setSelectedFactoryId] = useState<number>(-1);
    const selectedFactoryName = factories.find(factory => factory.id === selectedFactoryId)?.name || "Select Factory";

    const [factorySections, setFactorySections] = useState<FactorySection[]>([]);
    const [selectedFactorySectionId, setSelectedFactorySectionId] = useState<number>(-1);
    const selectedFactorySectionName = factorySections.find(section => section.id === selectedFactorySectionId)?.name || "Select Section";

    const [machines, setMachines] = useState<Machine[]>([]);
    const [selectedMachineId, setSelectedMachineId] = useState<number>(-1);
    const selectedMachineName = machines.find(machine => machine.id === selectedMachineId)?.name || '';
    const [departments, setDepartments] = useState<Department[]>([]);
    const [departmentId, setDepartmentId] = useState<number>(-1);
    const selectedDepartmentName = departmentId !== -1 ? departments.find(dept => dept.id === departmentId)?.name : "Select Department";

    const [orderType, setOrderType] = useState<string>();
    const [description, setDescription] = useState('');
    const [note, setNote] = useState('');

    const [searchQueryParts, setSearchQueryParts] = useState<string>('');
    const [isPartsSelectOpen, setIsPartsSelectOpen] = useState(false);

    const [reqNum, setReqNum] = useState('')

    const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);

    const [tempOrderDetails, setTempOrderDetails] = useState<InputOrder | null>(null);
    const [showPartForm, setShowPartForm] = useState(false); // To toggle part addition form visibility
    const isOrderFormComplete =
        selectedFactoryId !== -1 &&
        departmentId !== -1 &&
        orderType &&
        (orderType !== "PFM" || (selectedFactorySectionId !== -1 && selectedMachineId !== -1));  // This is where the order type and form completion is checked
    const [isOrderStarted, setIsOrderStarted] = useState(false);


    const [parts, setParts] = useState<Part[]>([]);
    useEffect(() => {
        const loadParts = async () => {
            const fetchedParts = await fetchAllParts();
            setParts(fetchedParts);
        };

        loadParts();
    }, []);

    const [orderedParts, setOrderedParts] = useState<InputOrderedPart[]>([]);

    const partsSectionRef = useRef<HTMLDivElement | null>(null);

    const navigate = useNavigate()




    // Order Parts
    const [qty, setQty] = useState<number>(-1);
    const [partId, setPartId] = useState<number>(-1);
    const [partName, setPartName] = useState<string>('');
    const [isSampleSentToOffice, setIsSampleSentToOffice] = useState<boolean>();

    const [forceRender, setForceRender] = useState<number>(0);
    const [forcePartRender, setForcePartRender] = useState<number>(0);
    const [forceFactorySectionRender, setForceFactorySectionRender] = useState<number>(0);
    const [forceMachineRender, setForceMachineRender] = useState<number>(0);


    const [addPartEnabled, setaddPartEnabled] = useState<boolean>(false);

    useEffect(() => {
        const checkCreatingOrderIsEnabled = async () => {
            if (appSettings){
                if(!isFeatureSettingEnabled(appSettings,'Create Order')){
                    navigate('/PageDisabled')
                }
            }
            else { navigate('/PageDisabled')}

        };

        checkCreatingOrderIsEnabled();
    }, []);


    // Array to store all parts

    const isAddPartFormComplete =
        partId !== -1 &&
        qty > 0 &&
        // (orderType !== "Machine" || (selectedFactorySectionId !== -1 && selectedMachineId !== -1)) &&
        isSampleSentToOffice !== null;

    const handleResetOrderParts = () => {
        setQty(-1);
        setPartId(-1);
        setIsSampleSentToOffice(false);
        setNote('');


        setForceRender(prev => prev + 1);
        setForcePartRender(prev => prev + 1);
        setForceFactorySectionRender(prev => prev + 1);
        setForceMachineRender(prev => prev + 1);
    };


    const handleCreateOrder = async () => {

        setIsSubmitting(true);
        try {
            if (!isOrderFormComplete) {
                toast.error("Please fill out all required fields");
                return;
            }

            if (!profile) {
                toast.error("No profile found")
                return
            }

            // Only check for duplicate requisition number if one is provided
            if (reqNum.trim()) {
                const fetchedReqNum = (await fetchOrderByReqNumandFactory(reqNum, selectedFactoryId)) ?? [];
                if (fetchedReqNum.length > 0) {
                    toast.error("This Requisition Number has already been used in another order for this factory");
                    setReqNum('');
                    return;
                }
            }

            setReqNum(reqNum.trim())
            const createdById = profile.id;
            const statusId = 1;
            const orderData: InputOrder = {
                req_num: reqNum,
                order_note: description,
                created_by_user_id: createdById,
                department_id: departmentId,
                factory_id: selectedFactoryId,
                factory_section_id: selectedFactorySectionId,
                machine_id: selectedMachineId,
                machine_name: selectedMachineName,
                current_status_id: statusId,
                order_type: orderType,
            };
            setTempOrderDetails(orderData);
            setShowPartForm(true); // This triggers the scroll due to useEffect
            setIsOrderStarted(true);
            toast.success("Order details are set. Please add parts.");

        } catch (error) {
            toast.error('Error preparing order: ' + error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper function to create order part object
    const createOrderedPart = (inStorage: boolean): InputOrderedPart => ({
        qty: qty,
        unit: "",
        order_id: 0, // Will be set when the order is created
        part_id: partId,
        part_name: partName,
        factory_id: selectedFactoryId,
        machine_id: selectedMachineId,
        factory_section_id: selectedFactorySectionId,
        factory_section_name: selectedFactorySectionName,
        machine_name: selectedMachineName,
        is_sample_sent_to_office: isSampleSentToOffice ?? false,
        note: note.trim() || null,
        in_storage: inStorage,
        approved_storage_withdrawal: false
    });

    // Helper function to check if part is in storage
    const checkPartInStorage = async (): Promise<boolean> => {        
        const storage_data = await fetchStoragePartQuantityByFactoryID(partId, selectedFactoryId);
        return storage_data.length > 0 && storage_data[0].qty > 0;
    };

    const handleAddOrderParts = async () => {
        // Check if part is already added
        const isPartAlreadyAdded = orderedParts.some(part => part.part_id === partId);
        if (isPartAlreadyAdded) {
            toast.error('This part has already been added.');
            return;
        }
        try {
            const inStorage = await checkPartInStorage();
            const newOrderedPart = createOrderedPart(inStorage);
            setOrderedParts(prevOrderedParts => [...prevOrderedParts, newOrderedPart]);
            handleResetOrderParts();
        } catch (error) {
            toast.error('Error checking storage availability');
            console.error('Storage check error:', error);
        }
    };

    // Helper function to create order based on type
    const createOrderByType = async (tempOrderDetails: InputOrder) => {
        if (orderType == "PFM") {
            return await insertOrder(
                tempOrderDetails.req_num,
                tempOrderDetails.order_note,
                tempOrderDetails.created_by_user_id,
                tempOrderDetails.department_id,
                tempOrderDetails.factory_id,
                tempOrderDetails.factory_section_id,
                tempOrderDetails.machine_id,
                1, // Current Status
                tempOrderDetails.order_type,
            );
        } else {
            return await insertOrderStorage(
                tempOrderDetails.req_num,
                tempOrderDetails.order_note,
                tempOrderDetails.created_by_user_id,
                tempOrderDetails.department_id,
                tempOrderDetails.factory_id,
                1, // Current Status
                tempOrderDetails.order_type,
            );
        }
    };

    const handleFinalCreateOrder = async () => {
        if (!tempOrderDetails) {
            toast.error("No order details to process.");
            return;
        }
        
        if (!profile) {
            toast.error("No profile found");
            return;
        }
        setIsSubmitting(true);
        
        try {
            // Create the order
            const orderResponse = await createOrderByType(tempOrderDetails);
            
            if (!orderResponse.data || orderResponse.data.length === 0) {
                toast.error("Failed to create order.");
                return;
            }

            const orderId = orderResponse.data[0].id;
            
            // Insert all ordered parts (keeping original logic)
            for (const part of orderedParts) {
                try {
                    await insertOrderedParts(
                        part.qty,
                        orderId,
                        part.part_id,
                        part.is_sample_sent_to_office,
                        part.note || null,
                        part.in_storage,
                        part.approved_storage_withdrawal
                    );
                } catch (error) {
                    console.error(`Failed to add part: ${part.part_id}`, error);
                    toast.error(`Failed to add part: ${part.part_id}`);
                    throw new Error(`Failed during part insertion: ${error}`);
                }
            }

            // Post-order creation tasks (keeping original logic)
            setShowPartForm(false);
            setOrderedParts([]);

            await InsertStatusTracker(new Date(), orderId, 1, 1);
            if (orderType == "PFM") {
                setMachineIsRunningById(selectedMachineId, false);
            }
            
        } catch (error) {
            toast.error(`An error occurred: ${error}`);
        } finally {
            setIsSubmitting(false);
            navigate('/orders');
        }
    };
    
    const handleCancelOrder = () => {
        setSelectedFactoryId(-1);
        setDepartmentId(-1);
        setOrderType("");
        setDescription('')
        setTempOrderDetails(null);
    };

    const handleRemovePart = (indexToRemove: number) => {
        setOrderedParts(prevParts => prevParts.filter((_, index) => index !== indexToRemove));
    };

    useEffect(() => {
        const loadFactories = async () => {
            const fetchedFactories = await fetchFactories();
            setFactories(fetchedFactories);
        };

        loadFactories();
    }, []);

    useEffect(() => {
        const loadDepartments = async () => {
            try {
                const fetchedDepartments = await fetchDepartments();
                setDepartments(fetchedDepartments);
            } catch (error) {
                toast.error('Failed to load departments');
            }
        };

        loadDepartments();
    }, []);

    useEffect(() => {
        const loadAddPartSettings = async () => {
            try {
                if (appSettings) {
                    appSettings.forEach((appSettings) => {
                        if (appSettings.name === "Add Part") {
                            setaddPartEnabled(appSettings.enabled)
                        }
                    })
                }
            } catch (error) {
                toast.error("Could not load settings data")
                setaddPartEnabled(false)
            }
        }
        loadAddPartSettings();
    }, [appSettings]);

    useEffect(() => {
        if (selectedFactoryId !== null) {
            const loadFactorySections = async () => {
                const sections = await fetchFactorySections(selectedFactoryId);
                setFactorySections(sections);
            };

            loadFactorySections();
        }
    }, [selectedFactoryId]);

    useEffect(() => {
        const loadMachines = async () => {
            if (selectedFactorySectionId !== -1) {
                const fetchedMachines = await fetchAllMachines(selectedFactorySectionId);
                setMachines(fetchedMachines);
                setSelectedMachineId(-1); // Reset machine ID when the section changes
                setTimeout(() => setSelectedMachineId(-1), 0); // Clear and reset
            } else {
                setMachines([]);
                setSelectedMachineId(-1); // Reset if no section is selected
            }
        };

        loadMachines();
    }, [selectedFactorySectionId]);

    useEffect(() => {
        if (showPartForm && partsSectionRef.current) {
            partsSectionRef.current.scrollIntoView({ behavior: 'smooth' }); // Auto-scroll to the parts section
        }
    }, [showPartForm]); // Dependency on showPartForm to trigger the scroll

    useEffect(() => {
        if (isPartsSelectOpen) {
            const loadParts = async () => {
                const fetchedParts = await fetchAllParts();
                setParts(fetchedParts);
            };

            loadParts(); // Refetch parts when the dropdown is opened
        }
    }, [isPartsSelectOpen]); // Run when dropdown is opened

    const handlePartCreated = (newPart: Part) => {

        handleSelectPart(newPart);
        
        // Close the dialog after a short delay to show the success state
        setTimeout(() => {
            setIsAddPartDialogOpen(false);
        }, 2000); // Wait 2 seconds to show the success animation
        
        console.log('New part created and selected:', newPart);
    };
    
    const handleSelectPart = (value: Part | undefined) => {
        if(value){

            if (partId === value?.id) {
                setPartId(-1); // Temporarily clear the selection
                setPartName("")
                setTimeout(() => {
                    setPartId(value.id);
                    setPartName(value.name)
                    setForcePartRender(prev => prev + 1); // Force re-render to reset the dropdown
                }, 0);
            } else {
                setPartId(value.id);
                setPartName(value.name)
            }
        }
    };

    const handleSelectFactorySection = (value: number) => {
        if (selectedFactorySectionId === value) {
            setSelectedFactorySectionId(-1); // Temporarily clear the selection
            setTimeout(() => {
                setSelectedFactorySectionId(value);
                setForceFactorySectionRender(prev => prev + 1); // Force re-render to reset the dropdown
            }, 0);
        } else {
            setSelectedFactorySectionId(value);
        }
    };

    const handleSelectMachine = (value: number) => {
        if (selectedMachineId === value) {
            setSelectedMachineId(-1); // Temporarily clear the selection
            setTimeout(() => {
                setSelectedMachineId(value);
                setForceMachineRender(prev => prev + 1); // Force re-render to reset the dropdown
            }, 0);
        } else {
            setSelectedMachineId(value);
        }
    };

    // Simpler approach - just load more parts initially
    const [allPartOptions, setAllPartOptions] = useState<any[]>([]);
    const [isLoadingMoreParts, setIsLoadingMoreParts] = useState(false);

    // Load initial parts when component mounts
    useEffect(() => {
        const loadInitialParts = async () => {
            setIsLoadingMoreParts(true);
            try {
                // Load first 500 parts across multiple pages
                let allParts: Part[] = [];
                for (let page = 1; page <= 5; page++) { // Load 5 pages (1000 parts total)
                    const response = await fetchPageParts({
                        page: page,
                        partsPerPage: 200,
                        filters: {}
                    });
                    
                    allParts.push(...response.data);
                    
                    if (response.data.length < 200) break; // No more pages
                }
                
                const options = allParts
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((part) => ({
                        value: part,
                        label: `${part.name} (${part.unit || 'units'})`,
                        isDisabled: false,
                    }));
                
                setAllPartOptions(options);
            } catch (error) {
                console.error("Error loading initial parts:", error);
            } finally {
                setIsLoadingMoreParts(false);
            }
        };

        loadInitialParts();
    }, []);

    // Then use simpler AsyncSelect
    <AsyncSelect
        id="partId"
        cacheOptions
        defaultOptions={allPartOptions}
        loadOptions={async (inputValue: string) => {
            if (!inputValue) {
                return allPartOptions.map(option => ({
                    ...option,
                    isDisabled: orderedParts.some((p) => p.part_id === option.value.id),
                }));
            }
            
            const response = await searchPartsByName(inputValue);
            return response
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((part) => ({
                    value: part,
                    label: `${part.name} (${part.unit || 'units'})`,
                    isDisabled: orderedParts.some((p) => p.part_id === part.id),
                }));
        }}
        onChange={(selectedOption) => {
            if (!tempOrderDetails) return;
            handleSelectPart(selectedOption?.value);
        }}
        placeholder={!tempOrderDetails ? "Complete order details first" : "Search or Select a Part"}
        className="mt-1"
        isSearchable
        isDisabled={!tempOrderDetails}
        isLoading={isLoadingMoreParts}
    />

    return (
        <>
            <NavigationBar />

            <div className="grid flex-1 items-start gap-4 p-5 sm:px-6 sm:py-5 md:gap-8">
                {/* Three-column layout: Order Details | Parts Form | Added Parts Table */}
                <div className="grid gap-4 lg:grid-cols-[1.5fr_1.5fr_2.5fr] transition-all duration-300">
                    
                    {/* Column 1 - Order Details */}
                    <Card className="h-[calc(100vh-170px)] flex flex-col">
                        <CardHeader className="pb-4">
                            <CardTitle>1. Order Details</CardTitle>
                            <CardDescription>Start creating an order</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto">
                            <div className="space-y-4">
                                {/* Order Type - Main Dropdown */}
                                <div>
                                    <Label htmlFor="orderType" className="text-sm font-medium">Order Type</Label>
                                    <Select onValueChange={(value) => setOrderType(value)} disabled={isOrderStarted}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue>
                                            {orderType == "PFM" ? "1 - Order for Machine" :
                                             orderType == "PFS" ? "2 - Order for Storage" :
                                             orderType == "STM" ? "3 - Storage to Machine" :
                                             orderType == "MTS" ? "4 - Machine to Storage" :
                                             "Select Order Type"}
                                        </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PFM">1 - Order for Machine</SelectItem>
                                            <SelectItem value="PFS">2 - Order for Storage</SelectItem>
                                            <SelectItem value="STM">3 - Storage to Machine</SelectItem>
                                            <SelectItem value="MTS">4 - Machine to Storage</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Requisition Number - Show only after Order Type is selected */}
                                {orderType && (
                                    <div>
                                        <Label htmlFor="req_num" className="text-sm font-medium">Requisition Number (Optional)</Label>
                                        <Input
                                            id="req_num"
                                            value={reqNum}
                                            className="mt-1"
                                            placeholder="Enter requisition number (optional)"
                                            onChange={e => setReqNum(e.target.value)}
                                            onBlur={() => setReqNum(reqNum.replace(/\s+/g, ''))}
                                            disabled={isOrderStarted}
                                        />
                                    </div>
                                )}

                                {/* Factory - Show only after Order Type is selected */}
                                {orderType && (
                                    <div>
                                        <Label htmlFor="factoryName" className="text-sm font-medium">Factory Name</Label>
                                        <Select onValueChange={(value) => setSelectedFactoryId(Number(value))} disabled={isOrderStarted}>
                                            <SelectTrigger className="mt-1">
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
                                    </div>
                                )}

                                {/* Department - Show only after Order Type is selected */}
                                {orderType && (
                                    <div>
                                        <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                                        <Select onValueChange={(value) => setDepartmentId(Number(value))} disabled={isOrderStarted}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue>{selectedDepartmentName || "Select Department"}</SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map((dept) => (
                                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Factory Section and Machine (only for Machine orders) */}
                                {orderType == "PFM" && (
                                    <>
                                        <div>
                                            <Label htmlFor="factorySection" className="text-sm font-medium">Factory Section</Label>
                                            <Select
                                                onValueChange={(value) => handleSelectFactorySection(Number(value))}
                                                disabled={isOrderStarted || selectedFactoryId === -1}
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue>
                                                        {selectedFactorySectionId !== -1
                                                            ? factorySections.find(s => s.id === selectedFactorySectionId)?.name
                                                            : "Select Section"}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {factorySections.map((section) => (
                                                        <SelectItem key={section.id} value={section.id.toString()}>
                                                            {section.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="machine" className="text-sm font-medium">Machine</Label>
                                            <Select
                                                onValueChange={(value) => handleSelectMachine(Number(value))}
                                                disabled={isOrderStarted || selectedFactorySectionId === -1}
                                            >
                                                <SelectTrigger className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap">
                                                    <SelectValue>
                                                        {selectedMachineId !== -1
                                                            ? machines.find(m => m.id === selectedMachineId)?.name
                                                            : tempOrderDetails?.machine_name || "Select Machine"}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {machines
                                                        .sort((a, b) => a.id - b.id)
                                                        .map((machine) => (
                                                            <SelectItem key={machine.id} value={machine.id.toString()}>
                                                                {machine.name}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                )}

                                {/* Description - Show only after Order Type is selected */}
                                {orderType && (
                                    <div>
                                        <Label htmlFor="description" className="text-sm font-medium">Description (Optional)</Label>
                                        <Textarea
                                            id="description"
                                            value={description}
                                            className={`mt-1 ${tempOrderDetails ? 'min-h-16' : 'min-h-20'}`}
                                            onChange={e => setDescription(e.target.value)}
                                            disabled={isOrderStarted}
                                            placeholder="Enter order description (optional)"
                                        />
                                    </div>
                                )}

                            </div>
                        </CardContent>
                        
                        {/* Buttons at the bottom - inside the card */}
                        <div className="p-6 pt-0">
                            <div className="flex justify-end gap-2">
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="text-sm">Creating Order...</span>
                                    </div>
                                ) : (
                                    <>
                                        {!tempOrderDetails && (
                                            <Button
                                                size="sm"
                                                onClick={handleCreateOrder}
                                                disabled={!isOrderFormComplete}
                                                className="gap-2"
                                            >
                                                <CirclePlus className="h-4 w-4" />
                                                Start Order
                                            </Button>
                                        )}
                                        <Link to="/orders">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleCancelOrder}
                                                className="gap-2"
                                            >
                                                <CircleX className="h-4 w-4" />
                                                Cancel
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Column 2 - Parts Form */}
                    <div ref={partsSectionRef}>
                        <Card className={`h-[calc(100vh-170px)] ${!tempOrderDetails ? 'opacity-50' : ''}`}>
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-lg">2. Add Parts</CardTitle>
                                        <CardDescription className="text-sm">
                                            {!tempOrderDetails 
                                                ? "Complete order details first" 
                                                : "Start adding parts to your order"
                                            }
                                        </CardDescription>
                                    </div>
                                    {tempOrderDetails && (
                                        <div className="text-right">
                                            <CardTitle className="text-lg">{selectedFactoryName}</CardTitle>
                                            <CardDescription className="text-sm">
                                                {tempOrderDetails?.order_type == "PFS"
                                                    ? "Storage Order"
                                                    : `${factorySections.find(s => s.id === selectedFactorySectionId)?.name || ""} - ${tempOrderDetails?.machine_name || "N/A"}`}
                                            </CardDescription>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="h-[calc(100%-120px)] overflow-y-auto">
                                <div className={`${!tempOrderDetails ? 'pointer-events-none' : ''}`}>
                                    {!tempOrderDetails ? (
                                        // Skeleton/Empty state before order initialization
                                        <div className="space-y-4 opacity-30">
                                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                                            <div className="h-10 bg-gray-100 rounded"></div>
                                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                                            <div className="h-10 bg-gray-100 rounded"></div>
                                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                                            <div className="h-10 bg-gray-100 rounded opacity-50"></div>
                                        </div>
                                    ) : (
                                        // Active form when order is initialized
                                        <div className="space-y-4">
                                            {/* Part Selection */}
                                            <div>
                                                <Label htmlFor="partId" className="text-sm font-medium">Select Part</Label>
                                                <AsyncSelect
                                                    id="partId"
                                                    cacheOptions
                                                    defaultOptions={allPartOptions}
                                                    loadOptions={async (inputValue: string) => {
                                                        if (!inputValue) {
                                                            return allPartOptions.map(option => ({
                                                                ...option,
                                                                isDisabled: orderedParts.some((p) => p.part_id === option.value.id),
                                                            }));
                                                        }
                                                        
                                                        const response = await searchPartsByName(inputValue);
                                                        return response
                                                            .sort((a, b) => a.name.localeCompare(b.name))
                                                            .map((part) => ({
                                                                value: part,
                                                                label: `${part.name} (${part.unit || 'units'})`,
                                                                isDisabled: orderedParts.some((p) => p.part_id === part.id),
                                                            }));
                                                    }}
                                                    onChange={(selectedOption) => {
                                                        if (!tempOrderDetails) return;
                                                        handleSelectPart(selectedOption?.value);
                                                    }}
                                                    placeholder="Search or Select a Part"
                                                    className="mt-1"
                                                    isSearchable
                                                    isLoading={isLoadingMoreParts}
                                                />
                                                
                                                <Dialog open={isAddPartDialogOpen} onOpenChange={setIsAddPartDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            className="mt-2 w-full bg-blue-950"
                                                            disabled={!addPartEnabled}
                                                        >
                                                            Create New Part
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl">
                                                        <AddPartPopup 
                                                            addPartEnabled={addPartEnabled}
                                                            onSuccess={handlePartCreated}
                                                            showPostAddOptions={true}
                                                        />
                                                    </DialogContent>
                                                </Dialog>
                                                                                            
                                            </div>

                                            {/* Quantity */}
                                            <div>
                                                <Label htmlFor="quantity" className="text-sm font-medium">
                                                    {`Quantity${partId !== -1 ? ` (${parts.find((p) => p.id === partId)?.unit || 'units'})` : ''}`}
                                                </Label>
                                                <Input
                                                    id="quantity"
                                                    type="number"
                                                    value={qty >= 0 ? qty : ''}
                                                    onChange={e => setQty(Number(e.target.value))}
                                                    placeholder="Enter quantity"
                                                    className="mt-1"
                                                />
                                            </div>

                                            {/* Sample checkbox */}
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id="sampleSentToOffice"
                                                    checked={isSampleSentToOffice}
                                                    onCheckedChange={(checked) => setIsSampleSentToOffice(checked === true)}
                                                />
                                                <Label htmlFor="sampleSentToOffice" className="text-sm">
                                                    Sample sent to office?
                                                </Label>
                                            </div>

                                            {/* Note */}
                                            <div>
                                                <Label htmlFor="note" className="text-sm font-medium">Note (Optional)</Label>
                                                <Textarea
                                                    id="note"
                                                    value={note || ''}
                                                    onChange={e => setNote(e.target.value)}
                                                    placeholder="Enter any notes"
                                                    className="mt-1 min-h-16"
                                                />
                                            </div>

                                            {/* Add Part Button */}
                                            <Button
                                                size="sm"
                                                onClick={handleAddOrderParts}
                                                disabled={!isAddPartFormComplete}
                                                className="gap-2 w-full"
                                            >
                                                <CirclePlus className="h-4 w-4" />
                                                Add Part
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Column 3 - Added Parts Table */}
                    <Card className="h-[calc(100vh-170px)] flex flex-col">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className={`text-lg ${!tempOrderDetails ? 'text-gray-400' : ''}`}>Added Parts ({orderedParts.length})</CardTitle>
                                    <CardDescription className={`text-sm ${!tempOrderDetails ? 'text-gray-300' : ''}`}>
                                        {!tempOrderDetails ? "Initialize order first" : "Parts in this order"}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto">
                            {!tempOrderDetails ? (
                                // Skeleton/Empty state before order initialization
                                <div className="space-y-3 opacity-20">
                                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                                    <div className="h-4 bg-gray-100 rounded w-48"></div>
                                    <div className="h-4 bg-gray-100 rounded w-40"></div>
                                    <div className="h-4 bg-gray-100 rounded w-36"></div>
                                </div>
                            ) : orderedParts.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <CirclePlus className="h-8 w-8 mx-auto mb-4 text-gray-300" />
                                    <p className="text-sm">No parts added yet</p>
                                    <p className="text-xs">Add parts using the form</p>
                                </div>
                            ) : (
                                <div className="h-full overflow-y-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[80px]">ID</TableHead>
                                                <TableHead>Part Name</TableHead>
                                                <TableHead className="w-[80px]">Qty</TableHead>
                                                <TableHead className="w-[80px]">Sample</TableHead>
                                                <TableHead className="w-[80px]">Storage</TableHead>
                                                <TableHead>Note</TableHead>
                                                <TableHead className="w-[60px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {orderedParts.map((part, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium text-xs">{part.part_id}</TableCell>
                                                    <TableCell className="text-xs">{part.part_name}</TableCell>
                                                    <TableCell className="text-xs">{part.qty}</TableCell>
                                                    <TableCell>
                                                        <span className={`inline-flex items-center px-1 py-0.5 rounded text-xs font-medium ${
                                                            part.is_sample_sent_to_office 
                                                                ? 'bg-green-100 text-green-600' 
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {part.is_sample_sent_to_office ? 'Yes' : 'No'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`inline-flex items-center px-1 py-0.5 rounded text-xs font-medium ${
                                                            part.in_storage 
                                                                ? 'bg-green-100 text-green-600' 
                                                                : 'bg-orange-100 text-orange-800'
                                                        }`}>
                                                            {part.in_storage ? 'Yes' : 'No'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="max-w-[100px] truncate text-xs">
                                                        {part.note || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleRemovePart(index)}
                                                            className="h-6 w-6 p-0 hover:bg-red-100"
                                                        >
                                                            <X className="h-3 w-3 text-red-600" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                        
                        {/* Finalize button at the bottom - inside the card */}
                        <div className="p-6 pt-0">
                            <div className="flex justify-end">
                                <Button
                                    size="sm"
                                    onClick={handleFinalCreateOrder}
                                    disabled={!tempOrderDetails || orderedParts.length === 0}
                                    className="gap-2"
                                >
                                    <CircleCheck className="h-4 w-4" />
                                    Finalize ({orderedParts.length})
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}

export default CreateOrderPage