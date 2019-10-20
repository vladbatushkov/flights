#!/bin/sh
/var/lib/neo4j/bin/neo4j-admin import \
--database=flights.db \
--mode=csv \
--nodes:Airline=/var/lib/neo4j/import/airlines_headers.csv,/var/lib/neo4j/import/airlines.csv \
--nodes:Airport=/var/lib/neo4j/import/airports_headers.csv,/var/lib/neo4j/import/airports.csv \
&& chmod -R 777 /data && chmod -R 777 /logs