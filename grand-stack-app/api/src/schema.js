import { GraphQLScalarType } from 'graphql';
import { neo4jgraphql  } from 'neo4j-graphql-js';
import { Neo4jDate } from 'neo4j-graphql-js/dist/augment/types/temporal';

export const typeDefs = `
scalar FlightsDateTime
scalar FlightsInt

type FlightDetails {
  departs_local: FlightsDateTime!
  arrival_local: FlightsDateTime!
}

type Airport {
  code: String!
  name: String!
  country: String!
  city: String!
  location: Point!
  directs: [Airport] @relation(name: "FLIES_TO", direction: "OUT")
  neighbors: [Airport] @cypher(statement: "MATCH (a:Airport) WHERE this.city = a.city AND this <> a RETURN a")
}

type Airline {
  code: String!
  name: String!
  country: String!
}

type FlightDetails {
  flight_number: String!
  duration: String!
  price: FlightsInt!
  departs_local: FlightsDateTime!
  arrival_local: FlightsDateTime!
}

type FlightInfo {
  flight: FlightDetails @neo4j_ignore
  company: Airline @neo4j_ignore
}

type RouteInfo {
  code: String!
  name: String!
  country: String!
  city: String!
}

type FlightsSearchResult {
  flights: [FlightInfo] @neo4j_ignore
  route: [RouteInfo] @neo4j_ignore
  stops: FlightsInt! 
}

type Query {
  FlightsSearchObjects(from: String, to: String, date: String): [FlightsSearchResult]
  FlightsSearchNodes(from: String, to: String, date: String): [FlightsSearchResult] @cypher(statement: "CALL custom.getFlightsNodes($from, $to, $date, 1, 6) YIELD result RETURN result")
}

`;

const pad = (s) => {
  let str = s + "";
  while (str.length < 2)
     str = "0" + str;
  return str;
}

const flightsDateTime = new GraphQLScalarType({
  name: 'FlightsDateTime',
  description: 'Description of my dateTime type',
  serialize(value) {
    return `${pad(value.day.low)}.${pad(value.month.low)}.${value.year.low} ${pad(value.hour.low)}:${pad(value.minute.low)}`;
  }
});

const flightsInt = new GraphQLScalarType({
  name: 'FlightsInt',
  description: 'Description of my int type',
  serialize(value) {
    return value.low;
  }
});

const query = "CALL custom.getFlightsObjects($from, $to, $date, 2, 6) YIELD result RETURN result";

export const resolvers = {
  FlightsInt: flightsInt,
  FlightsDateTime: flightsDateTime,
  Query: {
    FlightsSearchObjects : async (object, params, ctx, resolveInfo) => {
      var result;       
      var session = ctx.driver.session();      
      await session
        .run(query, params)
        .then(res => {
          result = res.records.map(rec => rec.get("result"));
        })
        .catch(error => {
          result = [];
          console.log(error);
        })
        .then(() => session.close());
      return result;
    }
  }
}