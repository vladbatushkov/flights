//Source_Airport,Destination_Airport
LOAD CSV WITH HEADERS FROM 'https://github.com/vladbatushkov/flights/raw/master/data/unique_routes.csv' AS line
MATCH (a1:Airport { code: line.Source_Airport })
MATCH (a2:Airport { code: line.Destination_Airport })
MERGE (a1)-[:FLIES_TO { dist: distance(a1.coords, a2.coords) }]->(a2)