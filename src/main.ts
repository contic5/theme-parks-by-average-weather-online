import './style.css'
import {get_data} from './read_excel.ts';


async function main()
{
  weather_data=await get_data("Theme_Park_Weather_Data.xlsx","Averaged_Data");
  console.log(weather_data);

  let heat_index_raw:any=await get_data("test-heat-index.xlsx");
  console.log(heat_index_raw);
  form_heat_index_dictionary(heat_index_raw);
}
function form_heat_index_dictionary(heat_index_raw:any)
{
  let index=0;
  for(let temperature=126;temperature>=76;temperature-=4)
  {
    heat_index_dict[temperature]={};
    for(let humidity in heat_index_raw[index])
    {
      heat_index_dict[temperature][humidity]=heat_index_raw[index][humidity];
    }
    index+=1;
  }
  console.log(heat_index_dict);
}
function calculate_heat_index(heat:number,humidity:number)
{
  const heat_rounded=Math.round(heat/2)*2;
  const humidity_rounded=Math.round(humidity/4)*4;
  const heat_index=heat_index_dict[heat_rounded][humidity];
  if(!heat_index)
  {
    return heat;
  }
}
export function update_values()
{
  const heat_measure_element=document.getElementById("heat_measure") as HTMLSelectElement;
  heat_measure=heat_measure_element.value;

  const humidity_measure_element=document.getElementById("humidity_measure") as HTMLSelectElement;
  humidity_measure=humidity_measure_element.value;

  calculate_heat_index
}

let weather_data=[];
let heat_index_dict:any={};

let heat_measure="";
let humidity_measure="";
update_values();
main();