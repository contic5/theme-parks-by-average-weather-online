import Chart from 'chart.js/auto'
import { get_average_values,to_title_case } from './shared.ts';
const imported_module = await import('./imports.ts');
await imported_module.data_loaded;
const { calculate_heat_index,heat_levels  } = imported_module;

function create_bar_charts(monthly_heat_above_percents:any,target_park:string,heat_measure:string,humidity_measure:string)
{
    let index=0;
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

    for(let category in monthly_heat_above_percents)
    {
        const data=monthly_heat_above_percents[category]; 
        let category_written=category;
        category_written=category_written.replaceAll("_"," ");
        category_written=to_title_case(category_written);

        let results_canvas=document.getElementById(`bar_${index}_canvas`) as HTMLCanvasElement;
        if(chart_created)
        {
            charts[index].destroy();
        }

        const heat_number=heat_levels[index].heat;

        charts[index]=new Chart(
            results_canvas,
            {
              type: 'line',
              data: {
                labels: ["January","February","March","April","May","June","July","August","September","October","November","December"],
                datasets: [
                  {
                    label: 'Percent',
                    data: data
                  }
                ]
              },
              options:{
                scales: 
                {
                  y: {
                    min: 0,
                    max: 100,
                    ticks: 
                    {
                      // Appends % symbol to the y-axis grid text
                      callback: function(value) 
                      {
                        return value + '%';
                      }
                    }
                  }
                },
                plugins:
                {
                  title:{
                    display: true,
                    text: [`${target_park_written} Percent of Days with`,`Heat Index above ${category_written} (${heat_number}° F)`,`by ${heat_measure_written} and ${humidity_measure_written}`]
                  }
                }
              },
            }
        );
        index+=1;
    }
    chart_created=true;
}
export function calculate_above_levels(weather_data:any,target_park:string,heat_measure:string,humidity_measure:string)
{
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
    
        for(let heat_level of heat_levels)
        {
            filtered_weather_data[i][heat_level.name]=Number(filtered_weather_data[i]["heat_index"]>heat_level.heat);
        }
    }

    let monthly_heat_above_percents:any={};

    for(let heat_level of heat_levels)
    {
        monthly_heat_above_percents[heat_level.name]=get_average_values(filtered_weather_data,"Month",heat_level.name);
        for(let i=0;i<12;i++)
        {
            monthly_heat_above_percents[heat_level.name][i]*=100;
        }
    }
    
    create_bar_charts(monthly_heat_above_percents,target_park,heat_measure,humidity_measure);
}

let heat_measure_written="";
let humidity_measure_written="";

let charts:any=[null,null,null,null];
let chart_created=false;