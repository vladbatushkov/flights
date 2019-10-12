//AirlineId,Name,Alias,IATA,ICAO,Callsign,Country,Active
LOAD CSV WITH HEADERS FROM 'https://github.com/vladbatushkov/flights/raw/master/data/airlines.csv' AS line
FOREACH(active IN CASE WHEN line.Active = "Y" THEN [line] ELSE [] END |
  MERGE (a:Airline { name: active.Name, code: active.IATA, country: active.Country })
)