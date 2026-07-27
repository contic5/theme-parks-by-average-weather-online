import './style.css'
import { calculate_average_results } from './calculate_average_results.ts';
import { calculate_above_levels } from './calculate_above_heat_levels.ts';

const imported_module = await import('./imports.ts');
await imported_module.data_loaded;
const { get_park_names,weather_data  } = imported_module;

export function update_inputs()
{
  //Get selected heat measure
  const heat_measure_element=document.getElementById("heat_measure") as HTMLSelectElement;
  heat_measure=heat_measure_element.value;

  //Get selected humidity measure
  const humidity_measure_element=document.getElementById("humidity_measure") as HTMLSelectElement;
  humidity_measure=humidity_measure_element.value;

  //Get selected park
  const target_park_element=document.getElementById("target_park") as HTMLSelectElement;
  target_park=target_park_element.value;
  
  calculate_average_results(weather_data,target_park,heat_measure,humidity_measure);
  calculate_above_levels(weather_data,target_park,heat_measure,humidity_measure);
}
export function main()
{
  //Add option for all park names
  for(let park_name of park_names)
  {
      let option=document.createElement("option") as HTMLOptionElement;
      document.getElementById("target_park")?.appendChild(option);

      option.value=park_name;
      option.innerHTML=park_name;
  }
  update_inputs();
}

let park_names:any[]=get_park_names();
let heat_index_dict:any={};

let target_park="";
let heat_measure="";
let humidity_measure="";