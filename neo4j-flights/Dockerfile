FROM vladbatushkov/neo4j-apoc-algo-graphql:latest

ENV NEO4J_dbms_security_procedures_unrestricted=apoc.*,algo.*,graphql.*
ENV NEO4J_dbms_active__database=flights.db
ENV NEO4J_AUTH=neo4j/test

COPY import.sh import.sh
COPY import/*.csv import/

COPY getFlightsObjects.cql getFlightsObjects.cql
COPY getFlightsNodes.cql getFlightsNodes.cql
COPY setup.sh setup.sh
COPY wrapper.sh wrapper.sh

ENV EXTENSION_SCRIPT=import.sh

EXPOSE 7474 7473 7687

ENTRYPOINT [ "./wrapper.sh" ]
