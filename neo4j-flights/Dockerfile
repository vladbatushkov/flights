FROM vladbatushkov/neo4j-apoc-algo-graphql:latest

ENV NEO4J_AUTH=none
ENV NEO4J_dbms_active__database=flights.db

COPY import.sh import.sh
COPY import/*.csv import/

ENV EXTENSION_SCRIPT=import.sh

CMD [ "neo4j" ]
