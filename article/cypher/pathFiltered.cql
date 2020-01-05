WITH { a: "Moscow", b: "New York" } as params
MATCH (a:Airport { city: params.a })
WITH params, AVG(a.location.latitude) as ala, AVG(a.location.longitude) as alo
MATCH (b:Airport { city: params.b })
WITH params, ala, alo, AVG(b.location.latitude) as bla, AVG(b.location.longitude) as blo
WITH params, distance(point({ latitude: ala, longitude: alo }), point({ latitude: bla, longitude: blo })) / 1000 * 1.05 as max
MATCH path = ((a:Airport { city: params.a })-[:FLIES_TO*..3]->(b:Airport { city: params.b }))
WHERE apoc.coll.sum([x IN relationships(path) | x.distance ]) <= max AND SIZE(apoc.coll.duplicates([ x IN nodes(path) | x.city ])) = 0
RETURN nodes(path) as routes