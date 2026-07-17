import './style.css'
import {get_data} from './read_excel.ts';


async function main()
{
  weather_data=await get_data("Theme_Park_Weather_Data.xlsx");
  console.log(weather_data);

  let heat_index_raw:any=await get_data("test-heat-index.xlsx");
  console.log(heat_index_raw);
  calculate_heat_index(heat_index_raw);
}
function calculate_heat_index(heat_index_raw:any)
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
export function update_values()
{

}

let weather_data=[];
let heat_index_dict:any={};
main();