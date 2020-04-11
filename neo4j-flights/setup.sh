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

create_procedure_getFlightsNodes()
{
    echo "CREATE PROCEDURE getFlightsNodes"
	until cat getFlightsNodes.cql | cypher-shell -u neo4j -p test --format plain
	do
	  echo "CREATE PROCEDURE getFlightsNodes FAILED, SLEEPING"
	  sleep 10
	done
	echo "CREATE PROCEDURE getFlightsNodes COMPLETE"
}

create_procedure_getFlightsObjects()
{
    echo "CREATE PROCEDURE getFlightsObjects"
	until cat getFlightsObjects.cql | cypher-shell -u neo4j -p test --format plain
	do
	  echo "CREATE PROCEDURE getFlightsObjects FAILED, SLEEPING"
	  sleep 10
	done
	echo "CREATE PROCEDURE getFlightsObjects COMPLETE"
}

while true; do
    sleep 5
    if curl -s -I http://localhost:7474 | grep -q "200 OK"; then
        echo "Setup Start"
        create_index "Airport" "city"
        create_index "AirportDay" "code"
        create_procedure_getFlightsNodes
        create_procedure_getFlightsObjects
        echo "Setup End"
        break
    else
        echo "Not Ready for Setup"
        continue
    fi
done