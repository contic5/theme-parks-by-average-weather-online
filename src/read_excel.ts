/*
USAGE

Call await get_data with the target filename.

EXAMPLE
let ride_dictionaries=await get_data("Disneyland Rides.xlsx");

*/

import readXlsxFile from 'read-excel-file';

export async function handle_data(data:any)
{
    let dictionaries=[];

    for(let i=1;i<data.length;i++)
    {
        let dictionary:Record<any,any>={};
        for(let j=0;j<data[0].length;j++)
        {
            const key=data[0][j];
            dictionary[key]=data[i][j];
        }
        dictionaries.push(dictionary);
    }
    console.log(dictionaries);
    return dictionaries;
}
export async function get_data(target_file:string,sheet_name="Data")
{
    console.log("Awaiting");
    const response=await fetch(target_file);
    const blob=await response.blob();
    const rows=await readXlsxFile(blob,{sheet:sheet_name});
    const dictionaries=await handle_data(rows);
    
    console.log(dictionaries);
    return dictionaries;
}