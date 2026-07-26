//Convert multiple words to Title Case
export function to_title_case(s:string)
{
  let words:string[]=s.split(" ");

  //Capitalize each word
  for(let i=0;i<words.length;i++)
  {
    words[i]=words[i].charAt(0).toUpperCase()+words[i].slice(1,words[i].length);
  }
  return words.join(" ");
}

//Get average values for a category column based on a value column.
export function get_average_values(data:any,category_column:string,value_column:string)
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

//Round number to specific places
function round(num:number,places:number)
{
  num*=Math.pow(10,places);
  num=Math.round(num);
  return num/Math.pow(10,places);
}