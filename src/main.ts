import './style.css'
import {get_data} from './read_excel.ts';
import Chart from 'chart.js/auto'

async function main()
{
  weather_data=await get_data("Theme_Park_Weather_Data.xlsx","Averaged_Data");

  let heat_index_raw:any=await get_data("test-heat-index.xlsx");
  form_heat_index_dictionary(heat_index_raw);

  let all_park_names=[];
  for(let i=0;i<weather_data.length;i++)
  {
    all_park_names.push(weather_data[i]["Park"]);
  }
  park_names= [...new Set(all_park_names)];

  update_values();
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
  let heat_rounded=Math.round(heat/4)*4;
  heat_rounded-=(heat_rounded+2)%4;

  let humidity_rounded=Math.round(humidity/4)*4;
  if(humidity_rounded<=4)
  {
    humidity_rounded=4;
  }

  if(heat_rounded<76)
  {
    return heat;
  }
  if(heat_rounded in heat_index_dict==false)
  {
    console.error(heat_rounded+" is not in heat index dictionary");
    return heat;
  }
  if(humidity_rounded in heat_index_dict[heat_rounded]==false)
  {
    return heat;
  }

  const heat_index=heat_index_dict[heat_rounded][humidity_rounded];
  if(!heat_index)
  {
    return heat;
  }
  return heat_index;
}
function round(num:number,places:number)
{
  num*=Math.pow(10,places);
  num=Math.round(num);
  return num/Math.pow(10,places);
}
function graph_data(average_heat_index_by_month: any)
{
  let results_canvas=document.getElementById("results_canvas") as HTMLCanvasElement;
  new Chart(
    results_canvas,
    {
      type: 'line',
      data: {
        labels: ["January","February","March","April","May","June","July","August","September","October","November","December"],
        datasets: [
          {
            label: 'Heat Index by Month',
            data: average_heat_index_by_month
          }
        ]
      }
    }
  );
}
function calculate_results()
{
  console.log(`Calculating heat index for ${heat_measure} and ${humidity_measure}`);
  let filtered_data:any[]=weather_data.filter((val,index)=>true==true);
  for(let i=0;i<filtered_data.length;i++)
  {
    filtered_data[i]["heat_index"]=calculate_heat_index(filtered_data[i][heat_measure],filtered_data[i][humidity_measure]);
  }
  filtered_data.sort((a,b) => a["Month"]-b["Month"]);

  let count=0;
  let sum=0;
  let target_month=1;
  let average_heat_index_by_month:any[]=[];
  for(let i=0;i<filtered_data.length;i++)
  {
    if(filtered_data[i]["Month"]!=target_month)
    {
      average_heat_index_by_month.push(round(sum/count,2));
      sum=0;
      count=0;
      target_month+=1;
    }
    sum+=filtered_data[i]["heat_index"];
    count+=1;
  }
  average_heat_index_by_month.push(round(sum/count,2));

  console.log(average_heat_index_by_month);
  graph_data(average_heat_index_by_month);
}
export function update_values()
{
  const heat_measure_element=document.getElementById("heat_measure") as HTMLSelectElement;
  heat_measure=heat_measure_element.value;

  const humidity_measure_element=document.getElementById("humidity_measure") as HTMLSelectElement;
  humidity_measure=humidity_measure_element.value;
  calculate_results();
}

let park_names:any[]=[];
let weather_data:any[]=[];
let heat_index_dict:any={};

let heat_measure="";
let humidity_measure="";
main();