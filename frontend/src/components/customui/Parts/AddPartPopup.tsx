import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, CirclePlus, Check, ExternalLink, PlusCircle } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { insertPart } from '@/services/PartsService'
import { Part } from '@/types'

interface AddPartPopupProps {
    addPartEnabled: boolean;
    onSuccess?: (newPart: Part) => void;
    showPostAddOptions?: boolean;
}

const AddPartPopup: React.FC<AddPartPopupProps> = ({ 
    addPartEnabled, 
    onSuccess, 
    showPostAddOptions = true 
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successfulPart, setSuccessfulPart] = useState<Part | null>(null);
    const [successAnimationIn, setSuccessAnimationIn] = useState(false);
    const [name, setName] = useState('');
    const [unit, setUnit] = useState('');
    const [description, setDescription] = useState('');

    const resetForm = () => {
        setName('');
        setUnit('');
        setDescription('');
        setSuccessfulPart(null);
        setSuccessAnimationIn(false);
    };

    const handleAddPart = async () => {
        if (!name.trim() || !unit.trim() || !description.trim()) {
            toast.error("Please fill out all the fields");
            return;
        }

        if (!addPartEnabled) {
            toast.error("Adding part is currently disabled");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await insertPart(name, unit, description);

            if (response) {
                onSuccess && onSuccess(response);
                setSuccessAnimationIn(true);
                setSuccessfulPart(response);
                toast.success("Part Added Successfully");

                setTimeout(() => {
                    setSuccessAnimationIn(false);
                }, 2000);
            }
        } catch (error) {
            toast.error('' + error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!addPartEnabled) {
        return (
            <div className="text-center mt-5 flex justify-center items-center">
                <div>Adding part is currently disabled</div>
            </div>
        );
    }

    if (successAnimationIn && showPostAddOptions) {
        return (
            <div className="flex flex-col items-center justify-center p-4 animate-in">
                <Check className="h-12 w-12 text-green-500 mb-4 animate-bounce" strokeWidth={3} />
                <p className="text-xl font-semibold text-green-600 animate-pulse">Part Added Successfully!</p>
            </div>
        );
    }

    if (successfulPart && !successAnimationIn && showPostAddOptions) {
        return (
            <div className='animate-in p-4'>
                <div className="mb-4">
                    <h2 className='text-green-600 text-2xl font-semibold'>Part Added Successfully!</h2>
                    <p className='text-gray-600'>Choose your next action</p>
                </div>
                <div className="flex gap-4">
                    <Button 
                        onClick={() => {
                            const newWindow = window.open(`/viewpart/${successfulPart.id}`, '_blank');
                            if (newWindow) {
                                newWindow.focus();
                            } else {
                                toast.error('Popup blocked. Please allow popups for this site.');
                            }
                        }}
                        className="w-full" 
                        variant="outline"
                    >
                        View this Part <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                    <Button 
                        variant="default" 
                        onClick={resetForm}
                        className="w-full"
                    >
                        Add Another Part <PlusCircle className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className=" p-4 rounded-lg">
            <div className="mb-4">
                <h2 className="text-2xl font-semibold">Add Part</h2>
                <p className="text-gray-600">Enter information regarding this part.</p>
            </div>
            <div className="grid gap-6">
                <div className="grid gap-3">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        type="text"
                        className="w-full"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                        id="unit"
                        type="text"
                        className="w-full"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
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
                ) : (
                    <Button size="sm" className="ml-auto gap-2" onClick={handleAddPart}>
                        <CirclePlus className="h-4 w-4" />
                        Add Part
                    </Button>
                )}
            </div>
        </div>
    );
};

export default AddPartPopup;
