FROM vladbatushkov/neo4j-apoc-algo-graphql:latest

ENV NEO4J_dbms_active__database=flights.db

COPY import.sh import.sh
COPY import/*.csv import/

COPY indexes.sh indexes.sh
COPY getFlights.sh getFlights.sh
COPY wrapper.sh wrapper.sh

ENV EXTENSION_SCRIPT=import.sh

ENTRYPOINT [ "./wrapper.sh" ]