//AirportId,Name,City,Country,IATA,ICAO,Latitude,Longitude,Altitude,TZ_UTCHoursOffset,DST,TZ_Olson,Type,Source
LOAD CSV WITH HEADERS FROM 'https://github.com/vladbatushkov/flights/raw/master/data/airports.csv' AS line
MERGE (a:Airport {
    name: line.Name,
    code: line.IATA,
    city: line.City,
    country: line.Country,
    coords: point({ latitude: toFloat(line.Latitude), longitude: toFloat(line.Longitude) })
})