import Chart, { plugins } from 'chart.js/auto'
const imported_module = await import('./imports.ts');
await imported_module.data_loaded;
const { calculate_heat_index,heat_levels  } = imported_module;

import {get_average_values,to_title_case } from './shared';

//Calculate the heat index for the selected heat measure and humidity measure.
export function calculate_average_results(weather_data:any,target_park:string,heat_measure:string,humidity_measure:string)
{
  console.log(`Calculating heat index for ${heat_measure} and ${humidity_measure}`);

  let filtered_weather_data:any[]=[...weather_data];
  if(target_park.length>=3)
  {
    filtered_weather_data=filtered_weather_data.filter((val,index)=>val["Park"]==target_park);
  }
  for(let i=0;i<filtered_weather_data.length;i++)
  {
    //Check if there is an error in the filtered weather data
    if(isNaN(filtered_weather_data[i][heat_measure]))
    {
      console.error(filtered_weather_data[i][heat_measure]+" is not a number");
    }

    //Calculate the heat index for each row in filtered_weather_data
    filtered_weather_data[i]["heat_index"]=calculate_heat_index(filtered_weather_data[i][heat_measure],filtered_weather_data[i][humidity_measure]);
  }

  //Calculate the average heat index by month
  let average_heat_index_by_month:number[]=get_average_values(filtered_weather_data,"Month","heat_index");

  console.log(`Results: ${average_heat_index_by_month}`);
  graph_data(average_heat_index_by_month,target_park,heat_measure,humidity_measure);
}

function graph_data(average_heat_index_by_month: any,target_park:string,heat_measure:string,humidity_measure:string)
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

  /*Plugins for various heat index values.
  Caution: 80-89
  Extreme Caution: 90-104
  Danger: 105-129
  Extreme Danger: 130+
  */

  let line_plugins=[]
  for(let heat_level of heat_levels)
  {
    const line_plugin = 
    {
        id: 'horizontalLine',
        afterDraw: (chart:any) => {
            const yValue = chart.scales.y.getPixelForValue(heat_level['heat']);
            const ctx = chart.ctx;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(chart.chartArea.left, yValue);
            ctx.lineTo(chart.chartArea.right, yValue);
            ctx.strokeStyle = heat_level['color'];
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        }
    };
    line_plugins.push(line_plugin);
  }

  //Convert heat measure into a more displayable form
  heat_measure_written=heat_measure;
  heat_measure_written=heat_measure_written.replaceAll("_"," ");
  heat_measure_written=to_title_case(heat_measure_written);
  heat_measure_written=heat_measure_written.replace(" 2m "," ");

  //Convert humidity measure into a more displayable form
  humidity_measure_written=humidity_measure;
  humidity_measure_written=humidity_measure_written.replaceAll("_"," ");
  humidity_measure_written=to_title_case(humidity_measure_written);
  humidity_measure_written=humidity_measure_written.replace(" 2m "," ");

  //Change * to All Parks
  let target_park_written=target_park;
  if(target_park_written.length<3)
  {
    target_park_written="All Parks";
  }

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
            max: 160
          }
        },
        plugins:
        {
          title:{
            display: true,
            text: [`${target_park_written} Heat Index by`,`${heat_measure_written} and ${humidity_measure_written}`]
          }
        }
      },
      plugins: line_plugins
    }
  );
}

let heat_measure_written="";
let humidity_measure_written="";

let chart_created=false;
let chart:Chart;

