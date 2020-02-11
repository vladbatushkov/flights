import { GraphQLScalarType } from 'graphql';

export const typeDefs = `
scalar MyDateTime
scalar MyInt

type Airline {
  code: String!
  name: String!
  country: String!
}

type Airport {
  code: String!
  name: String!
  country: String!
  city: String!
}

type FlightDetails {
  flight_number: String!
  duration: String!
  price: MyInt!
  departs_local: MyDateTime!
  arrival_local: MyDateTime!
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
  stops: Int!
}

type Query {
  FlightsSearch(from: String, to: String, date: String): [FlightsSearchResult]
}

`;

const pad = (s) => {
  let str = s + "";
  while (str.length < 2)
     str = "0" + str;
  return str;
}

const myDateTime = new GraphQLScalarType({
  name: 'MyDateTime',
  description: 'Description of my dateTime type',
  serialize(value) {
    return `${pad(value.day.low)}.${pad(value.month.low)}.${value.year.low} ${pad(value.hour.low)}:${pad(value.minute.low)}`;
  }
});

const myInt = new GraphQLScalarType({
  name: 'MyInt',
  description: 'Description of my int type',
  serialize(value) {
    return value.low;
  }
});

export const resolvers = {
  MyDateTime: myDateTime,
  MyInt: myInt,
  Query: {
    FlightsSearch: async (object, params, ctx, resolveInfo) => {
      //console.log('ctx=' + JSON.stringify(ctx));
      var query = "CALL custom.getFlights($from, $to, $date, 1, 6) YIELD result RETURN result";
      var result = [];
      var session = ctx.driver.session();

      await new Promise((resolve, reject) => {
      
        session
          .run(query, params)
          .then(res => {
            var items = res.records.map(rec => rec.get("result"));
            items.forEach((item) => {
              console.log(item);
            });
            //console.log(items.map(x => x.flights.map(y => y.flight.properties)));
            result = items;
            resolve();
          })
          .catch(error => {
            console.log(error);
            reject();
          })
          .then(() => session.close());

      });

      //console.log('result=' + JSON.stringify(result));      

      return result;
    }
  }
}