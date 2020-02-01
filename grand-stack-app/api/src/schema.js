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

type Flight {
  flight_number: String!
}

type FlightInfo {
  flight: Flight @neo4j_ignore
  company: Airline @neo4j_ignore
}

type FlightsSearchResult {
  flights: [FlightInfo] @neo4j_ignore
  route: [Airport] @neo4j_ignore
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
      var result = null;
      var session = ctx.driver.session();

      await new Promise((resolve, reject) => {
      
        session
          .run(query, params)
          .then(res => {
            // res.records.forEach(x => {
            //   console.log(JSON.stringify(x));
            // });
            result = res;
            resolve();
          })
          .catch(error => {
            console.log(error);
            reject();
          })
          .then(() => session.close());

      });

      console.log('result=' + JSON.stringify(result));      

      return result;
    }
  }
}