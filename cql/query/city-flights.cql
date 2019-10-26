MATCH (a1:Airport)-[]->(ad1:AirportDay)-[]-(f:Flight)-[]-(ad2:AirportDay)<-[]-(a2:Airport)
WHERE a1.city = "Bangkok" and a2.city = "Tokyo"
RETURN *

MATCH (a1:Airport)-[]->(ad1:AirportDay)-[]-(f:Flight)-[]-(ad2:AirportDay)<-[]-(a2:Airport)
WHERE ad1.code =~ ".*20191101" AND a1.city = "Bangkok" and a2.city = "Stockholm"
RETURN *

MATCH (a1:Airport)-[]->(ad1:AirportDay)-[]->(f1:Flight)-[]->(ad2:AirportDay)
<-[]-(a2:Airport)-[]->(ad3:AirportDay)-[]->(f2:Flight)-[]->(ad4:AirportDay)<-[]-(a3:Airport)
WHERE ad1.code =~ ".*20191101" AND a1.city = "Bangkok" and a3.city = "Stockholm"
RETURN *

MATCH p = ((a1:Airport)-[:FLIES_TO*2]->(a2:Airport))
WHERE a1.city = "Bangkok" and a2.city = "Stockholm"
RETURN p