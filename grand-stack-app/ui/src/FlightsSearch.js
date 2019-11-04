import React from "react";
import { withStyles } from "@material-ui/core/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions
} from "@material-ui/core";

const styles = theme => ({
  root: {
    maxWidth: 1200,
    marginTop: theme.spacing.unit * 3,
    overflowX: "auto",
    margin: "auto"
  },
  table: {
    minWidth: 1200
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    minWidth: 300
  },
  margined: {
    marginLeft: theme.spacing.unit,
    marginTop: theme.spacing.unit * 2,
    minWidth: 200,
    minHeight: 55
  },
  button: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    marginTop: theme.spacing.unit * 3,
    minWidth: 200
  },
  routeCell: {
    minWidth: "250px"
  },
  card: {
    marginBottom: theme.spacing.unit * 2,
  },
});

class FlightsSearch extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoaded: true,
      items: [],
      order: "asc",
      orderBy: "name",
      page: 0,
      rowsPerPage: 100,
      filter: {
        from: "",
        to: "",
        date: ""
      }
    };

    this.handleClick = this.handleClick.bind(this)
  }

  handleSortRequest = property => {
    const orderBy = property;
    let order = "desc";

    if (this.state.orderBy === property && this.state.order === "desc") {
      order = "asc";
    }

    this.setState({ order, orderBy });
  };

  getFilter = () =>
    Object.keys(this.state.filter)
      .map(x => ({ [x + "_contains"]: this.state.filter[x] }))
      .reduce((a, b) => ({ ...a, ...b }), {});

  handleFilterChange = filterName => event => {
    const val = event.target.value;

    this.setState({
      filter: {
        ...this.state.filter,
        [filterName]: val
      }
    });
  };

  handleClick() {

    this.setState({
      isLoaded: false,
      items: []
    });

    fetch(process.env.REACT_APP_NEO4J_REST_API_URI, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json; charset=UTF-8' },
      body: JSON.stringify({
        "statements" : [ {
          "statement" :
            `MATCH (a:Airport), (b:Airport)
            WHERE a.city = "` + this.state.filter.from + `" AND b.city = "` + this.state.filter.to + `"
            WITH distance(point({ latitude: AVG(a.location.latitude), longitude: AVG(a.location.longitude) }),
            point({ latitude: AVG(b.location.latitude), longitude: AVG(b.location.longitude) })) / 1000 * 1.25 as max_distance
            MATCH p = ((a:Airport)-[:FLIES_TO*1..3]->(b:Airport))
            WHERE a.city = "` + this.state.filter.from + `" AND b.city = "` + this.state.filter.to + `" AND apoc.coll.sum([x IN relationships(p) | x.distance ]) <= max_distance AND SIZE(apoc.coll.duplicates(nodes(p))) = 0
            WITH nodes(p) as stops
            UNWIND apoc.coll.pairsMin(stops) as stop
            CALL apoc.cypher.run('MATCH (ad:AirportDay { code: $' + 'adcode })-[:' + stop[0].code + '_FLIGHT]->(f:Flight)-[:' + stop[0].code + '_FLIGHT]->(bd:AirportDay { code: $' + 'bdcode }) MATCH (f)-[:OPERATED_BY]->(c:Airline) RETURN f as flight, a, b, c as company',
            { a: stop[0], adcode: stop[0].code + '_' + "` + this.state.filter.date + `", b: stop[1], bdcode: stop[1].code + '_' + "` + this.state.filter.date + `" }) yield value
            WITH stops, stop, collect(distinct value) as flights
            RETURN stops as route, { stopsCount: SIZE(stops) - 1, stops: collect({ stop: stop, flights: flights }) } as routeDetails
            ORDER BY routeDetails.stopsCount ASC`
        }]
      }),
    }).then(res => res.json())
      .then(
        (res) => {
          console.log(res.results);
          this.setState({
            isLoaded: true,
            items: this.mapResults(res.results[0])
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  mapResults = (res) =>{
    var data = res.data.map(x => ({ route: x.row[0], routeDetails: x.row[1] }));
    console.log(data);
    return data;
  }
  
  cartesian = (result, data, idx) => {    
    if (data.length === 1){
      var temp = [];
      for(var j = 0; j < data[0].length; j++) {
        temp[j] = [];
        temp[j].push(data[0][j]);
      }
      return [...temp];
    }

    if (idx === data.length) {      
      return result;
    }
    
    result = this.merge(result, data[idx]);
    var res = this.cartesian(result, data, idx + 1);
    console.log(`result cartesian:`+ JSON.stringify(res));
    return res;
  }

  merge = (arr1, arr2) => {
    if (arr1.length === 0) {
      return arr2;
    }
    var result = [];
    for(var i = 0; i < arr1.length; i++) {
      result[i] = [];
      for(var j = 0; j < arr2.length; j++) {
        result[i][j] = [arr1[i]];
        result[i][j].push(arr2[j]);
        result[i][j] = result[i][j].flat();
      }
    }
    console.log('result merge:' + JSON.stringify(result));
    return result.flat();
  }

  render() {
    const { classes } = this.props;    
    const { error, isLoaded } = this.state;


    let body = null;
    
    if (error) {
      body = (<div>Error: {error.message}</div>);
    } else if (!isLoaded) {
      body = (<div>Loading...</div>);
    } else {
      body = (<Table className={this.props.classes.table}>
      <TableBody>
        {this.state.items.map(n => {
          const flights = this.cartesian([], n.routeDetails.stops.map(x => x.flights), 0);
          return (
            <TableRow>
              <TableCell>
                  {flights.map(y => {
                      const total = y.map(z => z.flight.price).reduce((a, b) => a + b, 0);
                      return (<Card className={classes.card}>
                        <CardContent>
                      {y.map(z => <p>Flight {z.flight.duration} from {z.a.name} ({z.a.code}, {z.a.city}) to {z.b.name} ({z.b.code}, {z.b.city}) by {z.company.name}: ${z.flight.price} THB</p>)}
                        </CardContent>
                        <CardActions>
                          <Button size="small" color="primary">
                            {total} THB
                          </Button>
                        </CardActions>
                      </Card>);
                    }
                  )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>);
    }
      return (
        <Paper className={classes.root}>
          <Typography variant="h2" gutterBottom className={classes.margined}>
            Flights Search
          </Typography>
          <div>
          <TextField
            id="from"
            label="Flying from"
            className={classes.textField}
            value={this.state.filter.city}
            onChange={this.handleFilterChange("from")}
            margin="normal"
            variant="outlined"
            type="text"
            InputProps={{
              className: classes.input
            }}
          />
          <TextField
            id="to"
            label="Flying to"
            className={classes.textField}
            value={this.state.filter.country}
            onChange={this.handleFilterChange("to")}
            margin="normal"
            variant="outlined"
            type="text"
            InputProps={{
              className: classes.input
            }}
          />
          <TextField
            id="date"
            label="Departure date"
            className={classes.textField}
            value={this.state.filter.country}
            onChange={this.handleFilterChange("date")}
            margin="normal"
            variant="outlined"
            type="text"
            InputProps={{
              className: classes.input
            }}
          />
          <Button
            id="search"
            variant="contained"
            color="primary"
            size="large"
            margin="normal"
            className={classes.margined}
            onClick={this.handleClick}
            >
            Search
          </Button>
          </div>
          {body}
        </Paper>
      );
  }
}

export default withStyles(styles)(FlightsSearch);
