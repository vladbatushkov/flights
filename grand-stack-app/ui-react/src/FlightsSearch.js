import React from "react";
import { useQuery } from "@apollo/react-hooks";
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
    maxWidth: "100%",
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

const GET_FLIGHTS = gql`
  query flightsSearchQuery(
    $from: String
    $to: String
    $date: String
  ) {
    FlightsSearchObjects(from: $from, to: $to, date: $date) {
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
      stops
      }
    }
`;


function FlightsSearch(props) {
  const { classes } = props;
  const [filterState, setFilterState] = React.useState({
    from: "Bangkok",
    to: "Moscow",
    date: "20200101"
  });
  const [requestState, setRequestState] = React.useState({
    from: "",
    to: "",
    date: "",
    startAt: Date.now()
  });

  const elapsedSec = () => {
    return requestState && requestState.startAt ? (Math.floor(
      (Date.now() - requestState.startAt) / 1000
    )) : 0;
  }

  const { loading, data, error } = useQuery(GET_FLIGHTS, {
    variables: {
      from: (requestState && requestState.from) || "",
      to: (requestState && requestState.to) || "",
      date: (requestState && requestState.date) || ""
    }
  });

  const handleFilterChange = filterName => event => {
    const val = event.target.value;

    setFilterState(x => ({
      ...x,
      [filterName]: val
    }));
  };

  const handleClick = _ => {
    setRequestState(x => ({
      ...x,
      from: filterState.from,
      to: filterState.to,
      date: filterState.date,
      startAt: Date.now()
    }));
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
          value={filterState.from}
          onChange={handleFilterChange("from")}
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
          value={filterState.to}
          onChange={handleFilterChange("to")}
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
          value={filterState.date}
          onChange={handleFilterChange("date")}
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
          onClick={handleClick}
        >
          Search
        </Button>
      </div>
    {loading && !error && <p>Loading...</p>}
    {error && !loading && <p>Error</p>}
    {data && !loading && !error && data.FlightsSearchObjects && data.FlightsSearchObjects.length > 0 && (
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>
              {requestState
                ? `Total result: ${data.FlightsSearchObjects.length} flights founded in ${elapsedSec()} sec`
                : ""}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.FlightsSearchObjects.map((x, xi) => {
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
    )}
    </Paper>
  );
}

export default withStyles(styles)(FlightsSearch);
