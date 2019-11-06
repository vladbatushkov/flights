# Flights Search Engine: Experimental Neo4j GRANDstack Implementation

## Solution structure

### /cql
place to store cypher queries
 
### /data
original .csv files from [openflights.org](openflights.org)

### /generator
dotnet core C# console application to generate .csv files of nodes and relationships to import to *flights.db*

### /grand-stack-app
#### /api
Apollo GraphQL API
#### /ui
React App
#### /neo4j
docker file for blank neo4j (not used)

### /neo4j-apoc-algo-graphql
Docker Image  with APOC,  Algorithms and GraphQL plugins based on [neo4j official image](https://hub.docker.com/_/neo4j)
#### neo4j.conf - configuration file used for neo4j

### /neo4j-flights
Docker Image [neo4j-flights](https://hub.docker.com/r/vladbatushkov/neo4j-flights) with *flights.db* based on [neo4j-apoc-algo-graphql](https://hub.docker.com/r/vladbatushkov/neo4j-apoc-algo-graphql)
#### import.sh - extention script executed to import data create *flights.db* 
#### /import - .csv files with *flights.db* nodes and relationships
