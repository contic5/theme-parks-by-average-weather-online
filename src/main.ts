import './style.css'
import {get_data} from './read_excel.ts';
import Chart from 'chart.js/auto'

const ERROR_NUMBER=999999;
export async function main(target_sheet:string)
{
  weather_data=await get_data("Theme_Park_Weather_Data.xlsx",target_sheet);

  let heat_index_raw:any=await get_data("test-heat-index.xlsx");
  form_heat_index_dictionary(heat_index_raw);

  let all_park_names=[];
  for(let i=0;i<weather_data.length;i++)
  {
    all_park_names.push(weather_data[i]["Park"]);
  }
  park_names= [...new Set(all_park_names)];
  for(let park_name of park_names)
  {
    let option=document.createElement("option") as HTMLOptionElement;
    document.getElementById("target_park")?.appendChild(option);

    option.value=park_name;
    option.innerHTML=park_name;
  }

  /*
  for(let i=0;i<weather_data.length;i++)
  {
    min_heat_index=Math.min(min_heat_index,calculate_heat_index(weather_data[i]["average_temperature_2m_min"],weather_data[i]["average_relative_humidity_2m_min"]));
    max_heat_index=Math.max(max_heat_index,calculate_heat_index(weather_data[i]["average_temperature_2m_max"],weather_data[i]["average_relative_humidity_2m_max"]));
  }*/

  update_values();
}
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
function calculate_heat_index(heat:number,humidity:number)
{
  let heat_rounded=Math.round(heat/2.0)*2;

  let humidity_rounded=Math.round(humidity/4.0)*4;
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
    console.error(heat_rounded+" is not in heat_index_dict. Returning ERROR_NUMBER "+ERROR_NUMBER);
    return ERROR_NUMBER;
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
function graph_data(average_heat_index_by_month: any)
{
  let results_canvas=document.getElementById("results_canvas") as HTMLCanvasElement;
  console.log(`Chart Created ${chart_created}`);
  if(chart_created)
  {
    console.log("Destroying chart");
    chart.destroy();
  }
  chart_created=true;
  console.log(`Updated Chart Created to equal ${chart_created}`);

  /*
  heat_index_category_dict={
    "above_caution":80,
    "above_extreme_caution":90,
    "above_danger":105,
    "above_extreme_danger":130,
  }
  */

  const caution_line_plugin = 
  {
      id: 'horizontalLine',
      afterDraw: (chart:any) => {
          const yValue = chart.scales.y.getPixelForValue(80);
          const ctx = chart.ctx;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(chart.chartArea.left, yValue);
          ctx.lineTo(chart.chartArea.right, yValue);
          ctx.strokeStyle = 'yellow';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
      }
  };

  const extreme_caution_line_plugin = 
  {
      id: 'horizontalLine',
      afterDraw: (chart:any) => {
          const yValue = chart.scales.y.getPixelForValue(90);
          const ctx = chart.ctx;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(chart.chartArea.left, yValue);
          ctx.lineTo(chart.chartArea.right, yValue);
          ctx.strokeStyle = 'orange';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
      }
  };

  const warning_line_plugin = 
  {
      id: 'horizontalLine',
      afterDraw: (chart:any) => {
          const yValue = chart.scales.y.getPixelForValue(105);
          const ctx = chart.ctx;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(chart.chartArea.left, yValue);
          ctx.lineTo(chart.chartArea.right, yValue);
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
      }
  };

  const extreme_warning_line_plugin = 
  {
      id: 'horizontalLine',
      afterDraw: (chart:any) => {
          const yValue = chart.scales.y.getPixelForValue(130);
          const ctx = chart.ctx;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(chart.chartArea.left, yValue);
          ctx.lineTo(chart.chartArea.right, yValue);
          ctx.strokeStyle = 'darkred';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
      }
  };
  
  chart=new Chart(
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
      },
      options:{
        scales: 
        {
          y: {
            min: 0,
            max: 140
          }
        },
        plugins:
        {
          title:{
            display: true,
            text: 'Custom Chart Title'
          }
        }
      },
      plugins: [caution_line_plugin,extreme_caution_line_plugin,warning_line_plugin,extreme_warning_line_plugin]
    }
  );
}
function calculate_results()
{
  console.log(`Calculating heat index for ${heat_measure} and ${humidity_measure}`);
  let filtered_data:any[]=[...weather_data];
  if(target_park.length>4)
  {
    filtered_data=filtered_data.filter((val,index)=>val["Park"]==target_park);
  }
  for(let i=0;i<filtered_data.length;i++)
  {
    if(isNaN(filtered_data[i][heat_measure]))
    {
      console.error(filtered_data[i][heat_measure]+" is not a number");
    }
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

  const target_park_element=document.getElementById("target_park") as HTMLSelectElement;
  target_park=target_park_element.value;
  calculate_results();
}
function round(num:number,places:number)
{
  num*=Math.pow(10,places);
  num=Math.round(num);
  return num/Math.pow(10,places);
}

let park_names:any[]=[];
let weather_data:any[]=[];
let heat_index_dict:any={};

let target_park="";
let heat_measure="";
let humidity_measure="";

let chart_created=false;
let chart:Chart;

let min_heat_index=1000;
let max_heat_index=0;