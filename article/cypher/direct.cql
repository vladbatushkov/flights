WITH { a: "Moscow", b: "New York", date: "20200101" } as params
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
WHERE list.size = 2 AND ad.code = list.route[0].code + "_" + params.date AND type(r1) = list.route[1].code + "_FLIGHT"
OPTIONAL MATCH (f1)-[:OPERATED_BY]->(a1:Airline)
WITH collect({ stops: 0, route: list.route, flights: [{ flight: f1, company: a1 }] }) as direct
WITH [x IN direct WHERE x.flights[0].flight IS NOT NULL] as results
UNWIND results as result
RETURN result