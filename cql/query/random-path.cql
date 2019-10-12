MATCH p=(a1:Airport { code: "BKK" })-[:FLIES_TO*1..2]->(a2:Airport { code: "ARN" })
RETURN p