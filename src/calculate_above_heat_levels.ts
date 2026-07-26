import Chart from 'chart.js/auto'
const imported_module = await import('./imports.ts');
await imported_module.data_loaded;
const { calculate_heat_index  } = imported_module;

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
    
        filtered_weather_data[i]["a"]
    }
}