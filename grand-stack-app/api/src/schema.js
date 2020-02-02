export const typeDefs = `
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
}

type FlightInfo {
  flight: FlightDetails @neo4j_ignore
  company: Airline @neo4j_ignore
}

type FlightsSearchResult {
  flights: [FlightInfo] @neo4j_ignore
  stops: Int!
}

type Query {
  FlightsSearch(from: String, to: String, date: String): [FlightsSearchResult]
}

`;

export const resolvers = {
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