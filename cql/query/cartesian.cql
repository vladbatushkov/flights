WITH [{ name: 'a' }, { name: 'b' }] as stop1
WITH [{ name: 'b' }, { name: 'c' }] as stop2, stop1
WITH [{ name: 'c' }, { name: 'd' }] as stop3, stop2, stop1
WITH [{ code: 'ab1', stop: stop1 }, { code: 'ab2', stop: stop1 }] as flights1, stop3, stop2
WITH [{ code: 'bc1', stop: stop2 }, { code: 'bc2', stop: stop2 }] as flights2, flights1,stop3
WITH [{ code: 'cd1', stop: stop3 }, { code: 'cd2', stop: stop3 }, { code: 'cd3', stop: stop3 }] as flights3, flights2, flights1
WITH [flights1, flights2, flights3] as routes
WITH apoc.coll.combinations(apoc.coll.flatten(routes), 3, 3) as all_routes
WITH [ x IN all_routes WHERE x[0].stop <> x[1].stop AND x[0].stop <> x[2].stop AND x[1].stop <> x[2].stop | x ] as unique_routes
RETURN [ x IN unique_routes | [ y IN x | y.code ] ] as codes

PROFILE WITH { a: "BKK", b: "SVO", date: "20191101", atype: "airport", btype: "airport", stopsCount: 1 } as params
MATCH (a:Airport), (b:Airport)
WHERE ((params.atype = "city" AND a.city = params.a) OR (params.atype = "airport" AND a.code = params.a)) AND ((params.btype = "city" AND b.city = params.b) OR (params.btype = "airport" AND b.code = params.b))
WITH distance(point({ latitude: AVG(a.location.latitude), longitude: AVG(a.location.longitude) }),
  point({ latitude: AVG(b.location.latitude), longitude: AVG(b.location.longitude) })) / 1000 as max_distance, params
CALL apoc.cypher.run("MATCH path = ((a:Airport)-[:FLIES_TO*.." + (params.stopsCount + 1) + "]->(b:Airport)) WHERE (($params.atype = \"city\" AND a.city = $params.a) OR ($params.atype = \"airport\" AND a.code = $params.a)) AND (($params.btype = \"city\" AND b.city = $params.b) OR (params.btype = \"airport\" AND b.code = $params.b)) AND apoc.coll.sum([x IN relationships(path) | x.distance ]) <= $max_distance * 1.25 AND SIZE(apoc.coll.duplicates([ x IN nodes(path) | x.city ])) = 0 RETURN path", { params: params, max_distance: max_distance }) yield value
WITH nodes(value.path) as stops, params
UNWIND apoc.coll.pairsMin(stops) as stop
CALL apoc.cypher.run("MATCH (ad:AirportDay { code: \"" + stop[0].code + "_" + params.date + "\" })-[:" + stop[0].code + "_FLIGHT]->(f:Flight)-[:" + stop[0].code + "_FLIGHT]->(bd:AirportDay { code: \"" + stop[1].code + "_" + params.date + "\" }) MATCH (f)-[:OPERATED_BY]->(a:Airline) RETURN f as flight, a as company, $stop as stop, ($stop[0].code + $stop[1].code) as key", { stop: stop }) yield value
WITH stops, stop, collect(distinct value) as flights
WITH stops, SIZE(stops) - 2 as stopsCount, collect({ stop: stop, flights: flights }) as route
WITH apoc.coll.combinations(apoc.coll.flatten([ x IN route | x.flights]), stopsCount + 1, stopsCount + 1) as all_routes, stopsCount
WITH [ x IN all_routes WHERE stopsCount = 0 OR (stopsCount = 1 AND x[0].key <> x[1].key) OR (stopsCount = 2 AND x[0].key <> x[1].key AND x[0].key <> x[2].key AND x[1].key <> x[2].key) | x ] as unique_routes, stopsCount
UNWIND unique_routes as flights
RETURN stopsCount, flights
ORDER BY stopsCount ASC