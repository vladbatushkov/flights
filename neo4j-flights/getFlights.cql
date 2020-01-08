CALL apoc.custom.asProcedure("getFlights",
"WITH { a: $a, b: $b, date: $date, tmin: $tmin, tmax: $tmax } as params
MATCH (a:Airport { city: params.a })
WITH params, AVG(a.location.latitude) as ala, AVG(a.location.longitude) as alo
MATCH (b:Airport { city: params.b })
WITH params, ala, alo, AVG(b.location.latitude) as bla, AVG(b.location.longitude) as blo
WITH params, distance(point({ latitude: ala, longitude: alo }), point({ latitude: bla, longitude: blo })) / 1000 * 1.05 as max
MATCH path = ((a:Airport { city: params.a })-[:FLIES_TO*..3]->(b:Airport { city: params.b }))
WHERE apoc.coll.sum([x IN relationships(path) | x.distance ]) <= max AND SIZE(apoc.coll.duplicates([ x IN nodes(path) | x.city ])) = 0
WITH nodes(path) as routes, params
WITH { route: routes, size: SIZE(routes) } as list, params
OPTIONAL MATCH (ad:AirportDay)-[r1]->(f1:Flight)
WHERE list.size = 2
    AND ad.code = list.route[0].code + '_' + params.date
    AND type(r1) = list.route[1].code + '_FLIGHT'
OPTIONAL MATCH (f1)-[:OPERATED_BY]->(a1:Airline)
WITH collect({ stops: 0, route: list.route, flights: [{ flight: f1, company: a1 }] }) as direct, list, params
OPTIONAL MATCH (ad:AirportDay)-[r1]->(f1:Flight)-[r2]->(bd:AirportDay)-[r3]->(f2:Flight)
USING INDEX bd:AirportDay(code)
WHERE list.size = 3
	AND ad.code = list.route[0].code + '_' + params.date
	AND bd.code STARTS WITH list.route[1].code
    AND type(r1) = list.route[1].code + '_FLIGHT'
    AND type(r3) = list.route[2].code + '_FLIGHT'
    AND f1.arrival_local + duration('PT' + params.tmin + 'H') <= f2.departs_local
    AND f1.arrival_local + duration('PT' + params.tmax + 'H') >= f2.departs_local
OPTIONAL MATCH (f1)-[:OPERATED_BY]->(a1:Airline), (f2)-[:OPERATED_BY]->(a2:Airline)
WITH collect({ stops: 1, route: list.route, flights: [{ flight: f1, company: a1 }, { flight: f2, company: a2 }] }) as transfer, direct, list, params
OPTIONAL MATCH (ad:AirportDay)-[r1]->(f1:Flight)-[r2]->(bd:AirportDay)-[r3]->(f2:Flight)-[r4]->(cd:AirportDay)-[r5]->(f3:Flight)
USING INDEX bd:AirportDay(code)
USING INDEX cd:AirportDay(code)
WHERE list.size = 4
	AND ad.code = list.route[0].code + '_' + params.date
	AND bd.code STARTS WITH list.route[1].code
	AND cd.code STARTS WITH list.route[2].code
    AND type(r1) = list.route[1].code + '_FLIGHT'
    AND type(r3) = list.route[2].code + '_FLIGHT'
    AND type(r5) = list.route[3].code + '_FLIGHT'
    AND f1.arrival_local + duration('PT' + params.tmin + 'H') <= f2.departs_local
    AND f1.arrival_local + duration('PT' + params.tmax + 'H') >= f2.departs_local
    AND f2.arrival_local + duration('PT' + params.tmin + 'H') <= f3.departs_local
    AND f2.arrival_local + duration('PT' + params.tmax + 'H') >= f3.departs_local
OPTIONAL MATCH (f1)-[:OPERATED_BY]->(a1:Airline), (f2)-[:OPERATED_BY]->(a2:Airline), (f3)-[:OPERATED_BY]->(a3:Airline)
WITH collect({ stops: 2, route: list.route, flights: [{ flight: f1, company: a1 }, { flight: f2, company: a2 }, { flight: f3, company: a3 }] }) as transfers, transfer, direct
WITH [x IN apoc.coll.union(direct, apoc.coll.union(transfer, transfers)) WHERE x.flights[0].flight IS NOT NULL] as results
UNWIND results as result
RETURN result
ORDER BY result.stops", 'read',
  [['result','MAP']],[['a','STRING'], ['b','STRING'], ['date','STRING'], ['tmin','INT'], ['tmax','INT']], 'get flights with max 2 transfers');