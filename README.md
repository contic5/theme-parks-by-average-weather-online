# Theme Parks by Average Weather Online
## About
This project analyzes the heat index for different theme parks throughout the year. The heat index is formed from the heat and humidity.

## Methodology
Daily heat and hourly humidity were gathered with OpenMeteo's Weather API in Python. Weather was found by using each park's longitutde and latitude and retrieving the past 10 years weather. The average heat and average humidity values are based on averaged values for each month over 10 years (around 300 dates are averaged for each month). The heat is by day. The humidity is calculated by hour and converted into daily values. The daily minimum humidity is the minimum hourly humidity, the daily average humidity is the average of the 24 hourly humidity hours, and the maximum humidity is the maximum hourly humidity.</p>
This is how the selectable options are defined:
- Average Monthly Minimum Temperature: The average of the daily low temperature
- Average Monthly Average Temperature: The average of the daily average temperature.
- Average Monthly Maximum Temperature: The average of the daily maximum temperature.
- Average Monthly Minimum Humidity: The average of the daily minimum humidity
- Average Monthly Average Humidity: The average of the daily average humidity.
- Average Monthly Maximum Humidity: The average of the daily maximum humidity.

You can select the daily minimum, average or maximum heat and the daily minimum, average or maximum humidity. The heat index is calculated based on your selected heat and humidity.</p></p>
## Works Cited
-  Weather was gathered from [Open-Meteo](https://open-meteo.com/)
