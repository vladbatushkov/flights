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
  Box
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
    marginTop: theme.spacing.unit
  },
  button: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    marginTop: theme.spacing.unit * 2,
    minWidth: 200
  }
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
            CALL apoc.cypher.run('MATCH (ad:AirportDay { code: $' + 'adcode })-[:' + stop[0].code + '_FLIGHT]->(f:Flight)-[:' + stop[0].code + '_FLIGHT]->(bd:AirportDay { code: $' + 'bdcode }) RETURN f',
            { adcode: stop[0].code + '_' + "` + this.state.filter.date + `", bdcode: stop[1].code + '_' + "` + this.state.filter.date + `" }) yield value
            WITH stops, stop, collect(distinct value.f) as flights
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

  cartesian(arr) {
    return arr;
  }

  render() {
    const { classes } = this.props;    
    const { error, isLoaded, items } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
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
          <Table className={this.props.classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel>
                    Number of Stops
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel>
                    Route
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel>
                    Details
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.items.map(n => {
                return (
                  <TableRow>
                  <TableCell>
                    {n.routeDetails.stopsCount}
                  </TableCell>
                    <TableCell component="th" scope="row">
                      {n.route.map(x => x.code).join(" -> ")}
                    </TableCell>
                    <TableCell>
                      {this.cartesian(n.routeDetails.stops).map(x => {
                        return (
                          <Box>
                            <Typography>
                              {x.flights.map(y => `#${y.flightNumber} of ${y.price} THB`)}
                            </Typography>
                          </Box>
                          )}
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      );
          }
  }
}

export default withStyles(styles)(FlightsSearch);
