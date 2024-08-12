
import { Part } from "@/types";
import { supabase_client } from "./SupabaseClient";
import toast from "react-hot-toast";


export const fetchParts = async () => {
    const {data,error} = await supabase_client.from('parts').select('*')
    if (error){
        toast.error(error.message)
    }
    return data as Part[];
};

export const insertPart = async (name:string, unit:string, description: string) => {
    const { data, error } = await supabase_client.from('parts').insert([
    {   "name": name,
        "unit": unit,
        "description": description
         },
    ])
    .select()

    if (error) {
        toast.error(error.message)    
    }else{
        return data;
    }
    
};

export const editPart =  async(part_id:number,name:string,unit:string,description:string) => {
    
    const { data, error } = await supabase_client.from('parts').update(
        { 
            name: name,
            unit: unit,
            description: description
        }
    ).eq('id', part_id)
    .select()
    

    if (error) {
        toast.error(error.message)    
    }else{
        return data;
    }
}

export const fetchPart = async (part_id: number)=> {
    const { data, error } = await supabase_client.from('parts').select("*").eq(
        'id', part_id
    )

    if (error){
        toast.error(error.message)
    }
    console.log(data)
    return data as Part[]
}