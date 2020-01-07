import React from "react";
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
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json; charset=UTF-8', 'Authorization': 'Basic bmVvNGo6dGVzdA==' },
      body: JSON.stringify({
        "statements" : [ {
          "statement" :
            "CALL custom.getFlights('" + this.state.filter.from +"', '" + this.state.filter.to +"', '" + this.state.filter.date + "', 1, 4) YIELD result RETURN result"
        }]
      }),
    }).then(res => res.json())
      .then(
        (res) => {
          console.log(res.results);
          this.setState({
            isLoaded: true,
            items: res.results[0].data
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
      <TableHead>
        <TableRow>
        <TableCell>Total result: {this.state.items.length} flights founded</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {this.state.items.map((x, xi) => {
          const total = x.row[0].flights.map(y => y.flight.price).reduce((a, b) => a + b, 0);
          return (
            <TableRow>
              <TableCell>
                <p>Item №{xi + 1}</p>
                <Card className={classes.card}>
                  {x.row[0].flights.map((y, yi) => {
                    return (
                      <CardContent>
                        <p>Flight {y.flight.flight_number} duration {y.flight.duration.substr(2)} operates by {y.company.name}: {y.flight.price} THB</p>
                        <p>From {x.row[0].route[yi].name} departure {y.flight.departs_local} to {x.row[0].route[yi + 1].name} arrival {y.flight.arrival_local}</p>
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
