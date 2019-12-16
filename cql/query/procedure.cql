WITH { acode: 'KZN', bcode: 'EGO', date: '20200101' } as params
MATCH (ad:AirportDay { code: params.acode + "_" + params.date })-[r1]->(f:Flight)-[r2]->(bd:AirportDay { code: params.bcode + "_" + params.date })
WHERE type(r1) = params.acode + "_FLIGHT" AND type(r2) = params.acode + "_FLIGHT"
MATCH (f)-[:OPERATED_BY]->(a:Airline)
RETURN f, a

CALL apoc.custom.asProcedure('getFlights',
  'MATCH (ad:AirportDay { code: $acode + "_" + $date })-[r1]->(f:Flight)-[r2]->(bd:AirportDay { code: $bcode + "_" + $date }) WHERE type(r1) = $acode + "_FLIGHT" AND type(r2) = $acode + "_FLIGHT" MATCH (f)-[:OPERATED_BY]->(a:Airline) RETURN f as flight, a as company', 'read',
  [['flight','NODE'], ['company','NODE']],[['acode','STRING'], ['bcode','STRING'], ['date','STRING']], 'get flights by code A to B and date')

CALL custom.getFlights('DME', 'BKK', '20200101') YIELD flight, company
RETURN flight, company

//hop0, hop1, hop2
PROFILE WITH { a: "Moscow", b: "Stockholm", date: "20200101" } as params
MATCH (a:Airport), (b:Airport)
WHERE a.city = params.a AND b.city = params.b
WITH distance(point({ latitude: AVG(a.location.latitude), longitude: AVG(a.location.longitude) }),
  point({ latitude: AVG(b.location.latitude), longitude: AVG(b.location.longitude) })) / 1000 as max_distance, params
MATCH path = ((a:Airport)-[:FLIES_TO*..3]->(b:Airport))
WHERE a.city = params.a AND b.city = params.b
  AND apoc.coll.sum([x IN relationships(path) | x.distance ]) <= max_distance * 1.05 AND SIZE(apoc.coll.duplicates([ x IN nodes(path) | x.city ])) = 0
WITH nodes(path) as route, params
CALL custom.getFlights(route[0].code, route[1].code, params.date) YIELD flight, company
WITH collect({ flights: [{ flight: flight, company: company }], next: datetime(flight.departs) + duration(flight.duration) + duration("PT1H"), route: route }) as flights, params
WITH filter(x IN flights WHERE size(x.route) = 2) as listhop0, filter(x IN flights WHERE size(x.route) = 3) as listhop1, filter(x IN flights WHERE size(x.route) = 4) as listhop2, params
UNWIND listhop1 as hop1
CALL custom.getFlights(hop1.route[1].code, hop1.route[2].code, apoc.date.format(datetime({ year: hop1.next.year, month: hop1.next.month, day: hop1.next.day }).epochSeconds, 's', 'yyyyMMdd')) YIELD flight, company
WITH listhop2, collect({ stops: 1, flights: apoc.coll.union(hop1.flights, [{ flight: flight, company: company, transfer: duration.between(datetime(hop1.next - duration("PT1H")), datetime(flight.departs)).minutes }]), route: hop1.route }) as listhop1, [ x IN listhop0 | { stops: 0, flights: x.flights, route: x.route }] as listhop0
WITH listhop2, listhop1, listhop0
UNWIND listhop2 as hop2
CALL custom.getFlights(hop2.route[1].code, hop2.route[2].code, apoc.date.format(datetime({ year: hop2.next.year, month: hop2.next.month, day: hop2.next.day }).epochSeconds, 's', 'yyyyMMdd')) YIELD flight, company
WITH collect({ flights: apoc.coll.union(hop2.flights, [{ flight: flight, company: company, transfer: duration.between(datetime(hop2.next - duration("PT1H")), datetime(flight.departs)).minutes }]), next: datetime(flight.departs) + duration(flight.duration) + duration("PT1H"), route: hop2.route }) as listhop2, listhop1, listhop0
UNWIND listhop2 as hop2
CALL custom.getFlights(hop2.route[2].code, hop2.route[3].code, apoc.date.format(datetime({ year: hop2.next.year, month: hop2.next.month, day: hop2.next.day }).epochSeconds, 's', 'yyyyMMdd')) YIELD flight, company
WITH collect({ stops: 2, flights: apoc.coll.union(hop2.flights, [{ flight: flight, company: company }]), route: hop2.route }) as listhop2, listhop1, listhop0
UNWIND apoc.coll.union(apoc.coll.union(listhop0, listhop1), listhop2) as flight
RETURN flight.flights, flight.stops
ORDER BY flight.stops