import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { withStyles } from "@material-ui/core/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
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
    marginBottom: theme.spacing.unit * 2
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

    this.handleClick = this.handleClick.bind(this);
  }

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
      searchRequest: {
        from: this.state.filter.from,
        to: this.state.filter.to,
        date: this.state.filter.date,
        startAt: Date.now()
      }
    });
  }

  render() {
    const { classes } = this.props;
    const { searchRequest } = this.state;

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
        <Query
          query={gql`
            query flightsSearchQuery(
              $from: String
              $to: String
              $date: String
            ) {
              FlightsSearch(from: $from, to: $to, date: $date) {
                flights {
                  flight {
                    flight_number
                    price
                    duration
                    departs_local
                    arrival_local
                  }
                  company {
                    name
                    code
                    country
                  }
                }
                route {
                  code
                  name
                  city
                  country
                }
              }
            }
          `}
          variables={{
            from: (searchRequest && searchRequest.from) || "",
            to: (searchRequest && searchRequest.to) || "",
            date: (searchRequest && searchRequest.date) || ""
          }}
        >
          {({ loading, error, data }) => {
            const msg = loading
              ? "Loading..."
              : error
              ? "Error"
              : data.FlightsSearch.length > 0
              ? null
              : "";
            const elapsedSec =
              searchRequest &&
              Math.floor(
                (Date.now() - this.state.searchRequest.startAt) / 1000
              );
            if (msg) return <p className={classes.margined}>{msg}</p>;

            return (
              <Table className={this.props.classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      {searchRequest
                        ? `Total result: ${data.FlightsSearch.length} flights founded in ${elapsedSec} sec`
                        : ""}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.FlightsSearch.map((x, xi) => {
                    const total = x.flights
                      .map(y => y.flight.price)
                      .reduce((a, b) => a + b, 0);
                    return (
                      <TableRow key={xi}>
                        <TableCell>
                          <p>Item №{xi + 1}</p>
                          <Card className={classes.card}>
                            {x.flights.map((y, yi) => {
                              return (
                                <CardContent key={yi}>
                                  <p>
                                    Flight {y.flight.flight_number} duration{" "}
                                    {y.flight.duration.substr(2)} operates by{" "}
                                    {y.company.name}: {y.flight.price} THB
                                  </p>
                                  <p>
                                    From {x.route[yi].name} departure{" "}
                                    {y.flight.departs_local} to{" "}
                                    {x.route[yi + 1].name} arrival{" "}
                                    {y.flight.arrival_local}
                                  </p>
                                </CardContent>
                              );
                            })}
                            <CardActions>
                              <Button size="small" color="primary">
                                {total} THB
                              </Button>
                            </CardActions>
                          </Card>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            );
          }}
        </Query>
      </Paper>
    );
  }
}

export default withStyles(styles)(FlightsSearch);
