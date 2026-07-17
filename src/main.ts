import './style.css'
import {get_data} from './read_excel.ts';


async function main()
{
  weather_data=await get_data("Theme_Park_Weather_Data.xlsx");
  console.log(weather_data);
}

let weather_data=[];
main();