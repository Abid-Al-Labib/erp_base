import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Separator } from '../ui/separator'

interface MachineInfoProp {
    factory_name: string
    section_name: string
    machine_number: number
    machine_type: string
    machine_is_running: boolean
}


const MachineInfo:React.FC<MachineInfoProp> = ({ factory_name,section_name,machine_number,machine_type,machine_is_running}) => {
    return (
        <Card
        className="sm:col-span-2" x-chunk="dashboard-05-chunk-0"
    >
        <CardHeader className="pb-3">
        <CardTitle>Machine</CardTitle>
        </CardHeader>
        <Separator className="my-4" />
        <CardContent>
            <ul className="grid gap-3">
            <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Factory Name</span>
                <span>{factory_name}</span>
            </li>
            <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Section</span>
                <span>{section_name}</span>
            </li>
            <Separator className="my-2" />
            <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Machine Number</span>
                <span>{machine_number}</span>
            </li>
            <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Running</span>
                <span>{machine_is_running}</span>
            </li>
            <li className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Type</span>
                <span>{machine_type}</span>
            </li>
            </ul>
        </CardContent>
    </Card>
  )
}

export default MachineInfo