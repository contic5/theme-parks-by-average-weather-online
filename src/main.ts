import './style.css'
import {get_data} from './read_excel.ts';
import Chart from 'chart.js/auto'

const ERROR_NUMBER=999999;

//Convert multiple words to Title Case
function to_title_case(s:string)
{
  let words:string[]=s.split(" ");

  //Capitalize each word
  for(let i=0;i<words.length;i++)
  {
    words[i]=words[i].charAt(0).toUpperCase()+words[i].slice(1,words[i].length);
  }
  return words.join(" ");
}
    
export async function main(target_sheet:string)
{
  //Get weather data from Excel File
  weather_data=await get_data("Theme_Park_Weather_Data.xlsx",target_sheet);

  //Get heat index data from Excel File
  let heat_index_raw:any=await get_data("test-heat-index.xlsx");

  //Turn heat index into 2d dictionary heat_index[heat][humidity]
  form_heat_index_dictionary(heat_index_raw);

  //Get all park names
  let all_park_names=[];
  for(let i=0;i<weather_data.length;i++)
  {
    all_park_names.push(weather_data[i]["Park"]);
  }
  park_names= [...new Set(all_park_names)];

  //Add option for all park names
  for(let park_name of park_names)
  {
    let option=document.createElement("option") as HTMLOptionElement;
    document.getElementById("target_park")?.appendChild(option);

    option.value=park_name;
    option.innerHTML=park_name;
  }

  update_values();
}

//Get average values for a category column based on a value column.
function get_average_values(data:any,category_column:string,value_column:string)
{
  let sorted_data=[...data];
  sorted_data.sort((a:any,b:any) => a[category_column]-b[category_column]);
  console.log(sorted_data);

  let count=0;
  let sum=0;
  let target_value=sorted_data[0][category_column];
  console.log(target_value);
  let averages:number[]=[];

  //Loop through filtered_weather_data to find the count and heat index sum for each month.
  for(let i=0;i<sorted_data.length;i++)
  {
    //Once we are done with a month, calculate the average heat index for that month.
    if(sorted_data[i][category_column]!=target_value)
    {
      target_value=sorted_data[i][category_column];
      averages.push(round(sum/count,2));
      sum=0;
      count=0;
    }
    sum+=sorted_data[i][value_column];
    count+=1;
  }
  averages.push(round(sum/count,2));
  return averages;
}

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

//Get heat index from heat and humdiity
function calculate_heat_index(heat:number,humidity:number)
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

  /*Plugins for various heat index values.
  Caution: 80-89
  Extreme Caution: 90-104
  Danger: 105-129
  Extreme Danger: 130+
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
      plugins: [caution_line_plugin,extreme_caution_line_plugin,warning_line_plugin,extreme_warning_line_plugin]
    }
  );
}

//Calculate the heat index for the selected heat measure and humidity measure.
function calculate_results()
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
  graph_data(average_heat_index_by_month);
}
export function update_values()
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
  calculate_results();
}
//Round number to specific places
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

let heat_measure_written="";
let humidity_measure_written="";

let chart_created=false;
let chart:Chart;