#!/bin/sh
# do not run init script at each container strat but only at the first start
/var/lib/neo4j/bin/neo4j-admin import --database=flights.db --mode=csv --nodes:Airline=/var/lib/neo4j/import/airlines_headers.csv,/var/lib/neo4j/import/airlines.csv