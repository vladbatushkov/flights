PROFILE WITH { a: "Moscow", b: "Paris", date: date("2020-01-01") } as params
MATCH (a:Airport), (b:Airport)
WHERE a.city = params.a AND b.city = params.b
WITH AVG(a.location.latitude) as alatitude, AVG(a.location.longitude) as alongitude, AVG(b.location.latitude) as blatitude, AVG(b.location.longitude) as blongitude, params
WITH distance(point({ latitude: alatitude, longitude: alongitude }), point({ latitude: blatitude, longitude:blongitude })) / 1000 as max_distance, params
//MATCH path = ((a:Airport)-[:FLIES_TO*..3]->(b:Airport))
//WHERE a.city = params.a AND b.city = params.b AND apoc.coll.sum([x IN relationships(path) | x.distance ]) <= max_distance * 1.05 AND SIZE(apoc.coll.duplicates([ x IN nodes(path) | x.city ])) = 0
//WITH nodes(path) as route, params
RETURN max_distance//, apoc.coll.sum([x IN relationships(path) | x.distance ]) as path
LIMIT 10
//BUG IN DISTANCE METER


MATCH (a:Airport)-[:HAS_DAY]->(ad:AirportDay)-[r1:SVO_FLIGHT]->(f:Flight)-[r2:SVO_FLIGHT]->(bd:AirportDay)<-[:HAS_DAY]-(b:Airport)
WHERE a.code = "BKK"
RETURN a, b, ad, bd, f

WITH { acode: 'BKK', bcode: 'SVO', date: date('2020-01-01') } as params
WITH params, params.date.year + CASE WHEN params.date.month > 9 THEN "" ELSE "0" END + params.date.month + CASE WHEN params.date.day > 9 THEN "" ELSE "0" END + params.date.day as dateCode
MATCH (ad:AirportDay { code: params.acode + "_" + dateCode })-[r1]->(f:Flight)-[r2]->(bd:AirportDay { code: params.bcode + "_" + dateCode })
WHERE type(r1) = params.bcode + "_FLIGHT" AND type(r2) = params.bcode + "_FLIGHT"
MATCH (f)-[:OPERATED_BY]->(a:Airline)
RETURN f, a

CALL apoc.custom.asProcedure('getFlights',
  'WITH $acode + "_" + $date.year + CASE WHEN $date.month > 9 THEN "" ELSE "0" END + $date.month + CASE WHEN $date.day > 9 THEN "" ELSE "0" END + $date.day as dateCode MATCH (ad:AirportDay { code: dateCode })-[r1]->(f:Flight)-[r2]->(bd:AirportDay) WHERE type(r1) = $bcode + "_FLIGHT" AND type(r2) = $bcode + "_FLIGHT" MATCH (f)-[:OPERATED_BY]->(a:Airline) RETURN f as flight, a as company', 'read',
  [['flight','NODE'], ['company','NODE']],[['acode','STRING'], ['bcode','STRING'], ['date','DATE']], 'get flights by code A to B and date')

CALL custom.getFlights('DME', 'BKK', '20200101') YIELD flight, company
RETURN flight, company

CALL dbms.clearQueryCaches()

//hop0, hop1, hop2
PROFILE WITH { a: "Moscow", b: "Bangkok", date: date("2020-01-01") } as params
MATCH (a:Airport), (b:Airport)
WHERE a.city = params.a AND b.city = params.b
WITH distance(point({ latitude: AVG(a.location.latitude), longitude: AVG(a.location.longitude) }),
  point({ latitude: AVG(b.location.latitude), longitude: AVG(b.location.longitude) })) / 1000 as max_distance, params
MATCH path = ((a:Airport)-[:FLIES_TO*..3]->(b:Airport))
WHERE a.city = params.a AND b.city = params.b
  AND apoc.coll.sum([x IN relationships(path) | x.distance ]) <= max_distance * 1.25 AND SIZE(apoc.coll.duplicates([ x IN nodes(path) | x.city ])) = 0
WITH nodes(path) as route, params
CALL custom.getFlights(route[0].code, route[1].code, params.date) YIELD flight, company
WITH collect({ flights: [{ flight: flight, company: company }], next: flight.arrival + duration("PT1H"), route: route }) as flights, params
WITH filter(x IN flights WHERE size(x.route) = 2) as listhop0, filter(x IN flights WHERE size(x.route) = 3) as listhop1, filter(x IN flights WHERE size(x.route) = 4) as listhop2, params
UNWIND listhop1 as hop1
CALL custom.getFlights(hop1.route[1].code, hop1.route[2].code, hop1.next) YIELD flight, company
WITH listhop2, collect({ stops: 1, flights: apoc.coll.union(hop1.flights, [{ flight: flight, company: company, transfer: duration.between(datetime(hop1.next - duration("PT1H")), datetime(flight.departs)).minutes }]), route: hop1.route }) as listhop1, [ x IN listhop0 | { stops: 0, flights: x.flights, route: x.route }] as listhop0
WITH listhop2, listhop1, listhop0
UNWIND listhop2 as hop2
CALL custom.getFlights(hop2.route[1].code, hop2.route[2].code, hop2.next) YIELD flight, company
WITH collect({ flights: apoc.coll.union(hop2.flights, [{ flight: flight, company: company, transfer: duration.between(datetime(hop2.next - duration("PT1H")), datetime(flight.departs)).minutes }]), next: flight.arrival + duration("PT1H"), route: hop2.route }) as listhop2, listhop1, listhop0
UNWIND listhop2 as hop3
CALL custom.getFlights(hop3.route[2].code, hop3.route[3].code, hop3.next) YIELD flight, company
WITH collect({ stops: 2, flights: apoc.coll.union(hop3.flights, [{ flight: flight, company: company }]), route: hop3.route }) as listhop2, listhop1, listhop0
UNWIND apoc.coll.union(apoc.coll.union(listhop0, listhop1), listhop2) as flight
RETURN flight.flights, flight.stops
ORDER BY flight.stops

PROFILE WITH { a: "Moscow", b: "Paris", date: date("2020-01-01") } as params
MATCH (a:Airport), (b:Airport)
WHERE a.city = params.a AND b.city = params.b
WITH distance(point({ latitude: AVG(a.location.latitude), longitude: AVG(a.location.longitude) }), point({ latitude: AVG(b.location.latitude), longitude: AVG(b.location.longitude) })) / 1000 as max_distance, params
MATCH path = ((a:Airport)-[:FLIES_TO*..3]->(b:Airport))
WHERE a.city = params.a AND b.city = params.b AND apoc.coll.sum([x IN relationships(path) | x.distance ]) <= max_distance * 1.25 AND SIZE(apoc.coll.duplicates([ x IN nodes(path) | x.city ])) = 0
WITH nodes(path) as route, params
CALL custom.getFlights(route[0].code, route[1].code, params.date) YIELD flight, company
WITH collect({ flights: [{ flight: flight, company: company, next: date(flight.arrival + duration("PT1H")) }], route: route }) as flights, params
WITH filter(x IN flights WHERE size(x.route) = 2) as listhop0,
	 filter(x IN flights WHERE size(x.route) = 3) as listhop1,
     filter(x IN flights WHERE size(x.route) = 4) as listhop2, params
UNWIND listhop1 as hop1
CALL custom.getFlights(hop1.route[1].code, hop1.route[2].code, hop1.next) YIELD flight, company
WITH listhop2, collect({ stops: 1, flights: apoc.coll.union(hop1.flights, [{ flight: flight, company: company, transfer: duration.between(flight.arrival, flight.departs).minutes }]), route: hop1.route }) as listhop1, [ x IN listhop0 | { stops: 0, flights: x.flights, route: x.route }] as listhop0
RETURN listhop1
//WITH listhop2, listhop1, listhop0
//UNWIND listhop2 as hop2
//CALL custom.getFlights(hop2.route[1].code, hop2.route[2].code, hop2.next) YIELD flight, company
//WITH collect({ flights: apoc.coll.union(hop2.flights, [{ flight: flight, company: company, transfer: duration.between(datetime(hop2.next - duration("PT1H")), datetime(flight.departs)).minutes }]), next: flight.arrival + duration("PT1H"), route: hop2.route }) as listhop2, listhop1, listhop0
//UNWIND listhop2 as hop3
//CALL custom.getFlights(hop3.route[2].code, hop3.route[3].code, hop3.next) YIELD flight, company
//WITH collect({ stops: 2, flights: apoc.coll.union(hop3.flights, [{ flight: flight, company: company }]), route: hop3.route }) as listhop2, listhop1, listhop0
//UNWIND apoc.coll.union(apoc.coll.union(listhop0, listhop1), listhop2) as flight
//NWIND apoc.coll.union(listhop0, listhop1) as flight
//RETURN flight.flights, flight.stops
//ORDER BY flight.stops