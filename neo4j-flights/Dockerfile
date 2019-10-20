FROM vladbatushkov/neo4j-apoc-algo-graphql:latest

ENV REMOTE_IMPORT=https://github.com/vladbatushkov/flights/raw/master/import

ENV NEO4J_AUTH=none
ENV NEO4J_dbms_active__database=flights.db

ADD import.sh import.sh
ADD ${REMOTE_IMPORT}/airlines_headers.csv import/airlines_headers.csv
ADD ${REMOTE_IMPORT}/airlines.csv import/airlines.csv
ADD ${REMOTE_IMPORT}/airports_headers.csv import/airports_headers.csv
ADD ${REMOTE_IMPORT}/airports.csv import/airports.csv

ENV EXTENSION_SCRIPT=import.sh

CMD [ "neo4j" ]
