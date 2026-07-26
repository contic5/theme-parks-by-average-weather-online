let load_data_promise: Promise<void> | null = null;
import {get_data} from './read_excel.ts';
export const ERROR_NUMBER=999999;

export const heat_levels=[
    {name:"caution",heat:80,color:"yellow"},
    {name:"caution",heat:90,color:"orange"},
    {name:"caution",heat:105,color:"red"},
    {name:"caution",heat:130,color:"darkred"},
]
//Convert heat index into 2d dictionary heat_index_dict[heat][humidity]
function form_heat_index_dictionary(heat_index_raw:any)
{
  let index=0;
  for(let temperature=126;temperature>=76;temperature-=2)
  {
    heat_index_dict[temperature]={};
    for(let humidity in heat_index_raw[index])
    {
      heat_index_dict[temperature][humidity]=heat_index_raw[index][humidity];
    }
    index+=1;
  }
}
async function load_data(target_sheet:string): Promise<void>
{
    //If the data has already been loaded, then stop here
    if(load_data_promise)
    {
        return load_data_promise;
    }

    load_data_promise = (async () =>
    {
        //Get weather data from Excel File
        weather_data=await get_data("Theme_Park_Weather_Data.xlsx",target_sheet);

        //Get heat index data from Excel File
        let heat_index_raw:any=await get_data("test-heat-index.xlsx");

        //Turn heat index into 2d dictionary heat_index[heat][humidity]
        form_heat_index_dictionary(heat_index_raw);
    })();
    return load_data_promise;
}

//Get all park names
export function get_park_names()
{
    let all_park_names=[];
    for(let i=0;i<weather_data.length;i++)
    {
        all_park_names.push(weather_data[i]["Park"]);
    }
    return [...new Set(all_park_names)];
}
//Get heat index from heat and humdiity
export function calculate_heat_index(heat:number,humidity:number)
{
  let heat_rounded=Math.round(heat/2.0)*2;

  let humidity_rounded=Math.round(humidity/4.0)*4;

  //Make humidity 4 if it is less than 4
  if(humidity_rounded<=4)
  {
    humidity_rounded=4;
  }

  //The minimum heat in the heat humidity dictionary is 76. Just return the original heat if it is below 76.
  if(heat_rounded<76)
  {
    return heat;
  }

  //Check if heat and humidity are properly in dictionary.
  if(heat_rounded in heat_index_dict==false)
  {
    console.error(heat_rounded+" is not in heat_index_dict. Returning ERROR_NUMBER "+ERROR_NUMBER);
    return ERROR_NUMBER;
  }
  if(humidity_rounded in heat_index_dict[heat_rounded]==false)
  {
    console.error(humidity_rounded+" is not in heat_index_dict. Returning ERROR_NUMBER "+ERROR_NUMBER);
    return ERROR_NUMBER;
  }

  const heat_index=heat_index_dict[heat_rounded][humidity_rounded];
  if(!heat_index)
  {
    console.error(heat_index+" has an error. Returning ERROR_NUMBER "+ERROR_NUMBER);
    return ERROR_NUMBER;
  }
  return heat_index;
}

export let park_names:any[]=[];
export let weather_data:any[]=[];
export let heat_index_dict:any={};

export const data_loaded = load_data("Data");