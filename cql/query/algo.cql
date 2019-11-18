MATCH (a:Airport { code: 'BKK' }), (b:Airport { code: 'SVO' })
CALL algo.kShortestPaths(a, b, 1, 'time' ,{
nodeQuery:'MATCH (a:Airport) WHERE not n.name = "C" RETURN id(n) as id',
relationshipQuery:'MATCH (n:Loc)-[r:ROAD]->(m:Loc) RETURN id(n) as source, id(m) as target, r.cost as weight',
graph:'cypher',writePropertyPrefix:'cypher_'})
YIELD resultCount
RETURN resultCount