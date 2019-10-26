MATCH (a1:Airport)-[]->(ad1:AirportDay)-[]-(f:Flight)-[]-(ad2:AirportDay)<-[]-(a2:Airport)
WHERE a1.city = "Bangkok" and a2.city = "Tokyo"
RETURN *

MATCH (a1:Airport)-[]->(ad1:AirportDay)-[]-(f:Flight)-[]-(ad2:AirportDay)<-[]-(a2:Airport)
WHERE ad1.code =~ ".*20191101" AND a1.city = "Bangkok" and a2.city = "Stockholm"
RETURN *

MATCH (a1:Airport)-[]->(ad1:AirportDay)-[]->(f1:Flight)-[]->(ad2:AirportDay)
<-[]-(a2:Airport)-[]->(ad3:AirportDay)-[]->(f2:Flight)-[]->(ad4:AirportDay)<-[]-(a3:Airport)
WHERE ad1.code =~ ".*20191101" AND a1.city = "Bangkok" and a3.city = "Stockholm"
RETURN *

MATCH p = ((a1:Airport)-[:FLIES_TO*2]->(a2:Airport))
WHERE a1.city = "Bangkok" and a2.city = "Stockholm"
RETURN p

MATCH p = ((a1:Airport)-[:FLIES_TO*1..3]->(a2:Airport))
WHERE a1.city = "Bangkok" and a2.city = "Paris"
WITH (distance(a1.location, a2.location) / 1000) as min, p
WITH [x IN apoc.path.elements(p) | x { .city, .code, .distance }] as routes, min
WITH [x IN routes WHERE x.code IS NOT NULL | x { .code, .city }] as stops, apoc.coll.sum([x IN routes WHERE x.distance IS NOT NULL | x.distance]) as distance, min
WHERE distance < min * 1.1
RETURN stops, SIZE(stops) as stops_count, distance
ORDER by stops_count//, distance ASC
LIMIT 100;

CREATE INDEX ON :Airport(city);
CREATE INDEX ON :Airport(code);
CREATE INDEX ON :AirportDay(code);

MATCH (a1:Airport)-[f1:FLIES_TO]->(a2:Airport)
WHERE a1.city = "Bangkok"
AND a2.city = "Stockholm"
WITH a1, a2, f1
MATCH (b1:Airport)-[f2:FLIES_TO]->(b2:Airport)-[f3:FLIES_TO]->(b3:Airport)
WHERE a1 = b1 AND a2 = b3
WITH a1,a2,b1,b2,b3,f1,f2,f3,f1.distance as direct, f2.distance + f3.distance as one_stop
WHERE one_stop - direct <= direct * 0.25
//RETURN f1,f2,f3,direct,one_stop
//AND f2.distance + f3.distance <= f1.distance * 1.25
RETURN a1,a2,b1,b2,b3,f1,f2,f3
LIMIT 100

PROFILE MATCH p = ((a1:Airport { code: "BKK" })-[:FLIES_TO*1..2]->(a2:Airport { code: "SVO"}))
WITH { stops: [x IN nodes(p) | x { .code, .city } ], distance: apoc.coll.sum([x IN relationships(p) | x.distance ]) } as route
RETURN route.stops, SIZE(route.stops) as stops_count, route.distance as distance
ORDER by stops_count, distance ASC
LIMIT 100

MATCH p = ((a1:Airport { code: "BKK" })-[:FLIES_TO*1..2]->(a2:Airport { code: "BCN"}))
WITH { stops: [x IN nodes(p) | x { .code, .city } ], distance: apoc.coll.sum([x IN relationships(p) | x.distance ]) } as route//, (distance(a1.location, a2.location) / 1000) as min
//WHERE route.distance < min * 1.1
RETURN route.stops, SIZE(route.stops) as stops_count, route.distance as distance
ORDER by stops_count, distance ASC
LIMIT 100

PROFILE MATCH p = ((a1:Airport { city: "Bangkok" })-[:FLIES_TO*1..3]->(a2:Airport { city: "Paris" }))
WITH { stops: apoc.coll.pairsMin(nodes(p)), distance: apoc.coll.sum([x IN relationships(p) | x.distance ]) } as route
UNWIND route.stops as stop
MATCH (a:Airport)-[:HAS_DAY]->(ad:AirportDay)-[:IN_FLIGHT]->(f:Flight)-[:OUT_FLIGHT]->(:AirportDay)<-[:HAS_DAY]-(b:Airport)
WHERE a.code = stop[0].code AND b.code = stop[1].code AND ad.code = stop[0].code + "_20191101"
WITH collect(f) as flights, route.distance as distance, stop
WITH { distance: distance, stops: collect({ stop: stop, flights: flights }) } as flights
RETURN flights
ORDER by SIZE(flights.stops) ASC, flights.distance ASC
LIMIT 10
//NO INDEX
//Started streaming 10 records after 118325 ms and completed after 118329 ms.
//INDEX
//Started streaming 10 records after 21201 ms and completed after 21211 ms.

PROFILE MATCH p = ((a1:Airport { city: "Bangkok" })-[:FLIES_TO*1..2]->(a2:Airport { city: "Paris" }))
WITH { stops: apoc.coll.pairsMin(nodes(p)), distance: apoc.coll.sum([x IN relationships(p) | x.distance ]) } as root
WITH root, min(root.distance) as min
WHERE root.distance <= min * 1.5 AND SIZE(apoc.coll.duplicates(root.stops)) = 0
UNWIND root.stops as stop
MATCH (a:Airport)-[:HAS_DAY]->(ad:AirportDay)-[:IN_FLIGHT]->(f:Flight)-[:OUT_FLIGHT]->(bd:AirportDay)<-[:HAS_DAY]-(b:Airport)
WHERE a.code = stop[0].code
AND b.code = stop[1].code
AND ad.code = stop[0].code + "_20191101"
AND bd.code = stop[1].code + "_20191101"
WITH root, stop, collect(distinct f) as flights
WITH root.stops as stops, { stops: SIZE(root.stops), distance: root.distance, route: collect({ stop: stop, flights: flights }) } as result
RETURN result
ORDER BY result.stops ASC, result.distance ASC
LIMIT 10