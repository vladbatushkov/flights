#!/bin/bash

create_index()
{
	echo "CREATE INDEX ON :$1($2);"
	until cypher-shell -u neo4j -p test "CREATE INDEX ON :$1($2);"
	do
	  echo "CREATE INDEX ON ($1) FAILED, SLEEPING"
	  sleep 10
	done
	echo "CREATE INDEX ON ($1) COMPLETE"
}

create_procedure_getFlights()
{
    echo "CREATE PROCEDURE getFlights"
	until cat getFlights.cql | cypher-shell -u neo4j -p test --format plain
	do
	  echo "CREATE PROCEDURE getFlights FAILED, SLEEPING"
	  sleep 10
	done
	echo "CREATE PROCEDURE getFlights COMPLETE"
}

while true; do
    sleep 5
    if curl -s -I http://localhost:7474 | grep -q "200 OK"; then
        echo "Setup Start"
        create_index "Airport" "city"
        create_index "AirportDay" "code"
        create_procedure_getFlights
        echo "Setup End"
        break
    else
        echo "Not Ready for Setup"
        continue
    fi
done