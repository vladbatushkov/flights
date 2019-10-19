docker run -p7474:7474 -p7473:7473 -p7687:7687 vladbatushkov/neo4j-flights:latest
--env NEO4J_dbms_active__database=flights.db

--docker exec -it NAME bash
--ls -l --block-size=M