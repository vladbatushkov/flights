MATCH p=(a1:Airport { code: "BKK" })-[:FLIES_TO*1..2]->(a2:Airport { code: "ARN" })
RETURN p

MATCH (f:Flight)-[:OPERATED_BY]->(a:Airline) WHERE a.country = "Thailand" RETURN DISTINCT a LIMIT 10