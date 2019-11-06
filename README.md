# Flights Search Application GRANDstack Experimental Implementation

## Solution structure

### /cql
Cypher queries
 
### /data
Original .csv files from [openflights.org](https://openflights.org/data.html)

### /generator
Dotnet core C# console application to generate .csv files of nodes and relationships to import to *flights.db*

### /grand-stack-app
#### /api
Apollo GraphQL API
#### /ui
React App
#### /neo4j
Docker file for blank neo4j (not used)

### /neo4j-apoc-algo-graphql
Docker Image  with APOC,  Algorithms and GraphQL plugins based on [neo4j official image](https://hub.docker.com/_/neo4j)
#### neo4j.conf - configuration file used for neo4j

### /neo4j-flights
Docker Image [neo4j-flights](https://hub.docker.com/r/vladbatushkov/neo4j-flights) with *flights.db* based on [neo4j-apoc-algo-graphql](https://hub.docker.com/r/vladbatushkov/neo4j-apoc-algo-graphql)
#### import.sh - extention script executed to import data create *flights.db* 
#### /import - .csv files with *flights.db* nodes and relationships

## Domain

Project provides a set of tools to solve real world problem of flights search for all possible routes in between 2 locations such as cities/airports.
![Routes](https://raw.githubusercontent.com/vladbatushkov/flights/master/images/1.png)

## Database Schema

Project based on the [original idea of Max De Marzi](https://maxdemarzi.com/2017/05/24/flight-search-with-neo4j/) of graph database [POC](https://github.com/maxdemarzi/neoflights).
![Schema](https://raw.githubusercontent.com/vladbatushkov/flights/master/images/2.png)

## Architecture

Project is build with using GRANDstack framework and special Docker image with original *flights database* with predefined imported data.
![Architecture](https://raw.githubusercontent.com/vladbatushkov/flights/master/images/3.png)

## Neo4j
[neo4j-admin import tool](https://neo4j.com/docs/operations-manual/current/tutorial/import-tool/) to prepare *flights.db* data.
![Database](https://raw.githubusercontent.com/vladbatushkov/flights/master/images/4.png)
