neo4j-admin import \
--mode=csv \
--database=flights.db \
--report-file=flights.report \
--nodes:Airline ../import/airlines_headers.csv,../import/airlines.csv \
--ignore-duplicate-nodes=true \
--ignore-missing-nodes=true