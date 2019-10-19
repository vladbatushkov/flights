# FROM vladbatushkov/neo4j-apoc-algo-graphql:latest
FROM vladbatushkov/neo4j-apoc-algo-graphql:test

ENV REMOTE_IMPORT=https://github.com/vladbatushkov/flights/raw/master/import

ENV NEO4J_AUTH=none
ENV NEO4J_dbms_active__database=flights.db

# ADD import.sh import.sh
# ADD ${REMOTE_IMPORT}/airlines_headers.csv import/airlines_headers.csv
ADD ${REMOTE_IMPORT}/airlines.csv import/airlines.csv

# RUN bin/neo4j-admin import --database=flights.db --mode=csv --nodes:Airline=import/airlines_headers.csv,import/airlines.csv

# ENV EXTENSION_SCRIPT=import.sh

# VOLUME [ "/import" ]

CMD [ "neo4j" ]
# bin/neo4j-admin import --database=flights.db --mode=csv --nodes:Airline=import/airlines_headers.csv,import/airlines.csv && tail -f logs/neo4j.log