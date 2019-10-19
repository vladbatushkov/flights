FROM vladbatushkov/neo4j-apoc-algo-graphql:latest

ENV REMOTE_IMPORT https://github.com/vladbatushkov/flights/raw/master/import
ENV HOME_IMPORT ./var/lib/neo4j/import

ADD ${REMOTE_IMPORT}/airlines_headers.csv ${HOME_IMPORT}/airlines_headers.csv
ADD ${REMOTE_IMPORT}/airlines.csv ${HOME_IMPORT}/airlines.csv

RUN ./var/lib/neo4j/bin/neo4j-admin import --mode=csv --database=flights.db --nodes:Airline ../import/airlines_headers.csv,../import/airlines.csv --ignore-duplicate-nodes=true --ignore-missing-nodes=true

CMD [ "neo4j" ]