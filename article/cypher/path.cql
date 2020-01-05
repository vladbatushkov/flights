WITH { a: "Moscow", b: "New York" } as params
MATCH path = ((a:Airport { city: params.a })-[:FLIES_TO*..3]->(b:Airport { city: params.b }))
WITH nodes(path) as routes
RETURN routes, SIZE(routes) - 2 as stops
ORDER BY stops