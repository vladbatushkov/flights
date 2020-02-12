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
  Tooltip,
  Paper,
  TableSortLabel,
  Typography,
  TextField
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
    marginTop: theme.spacing.unit
  }
});

class AirlineList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      order: "asc",
      orderBy: "name",
      page: 0,
      rowsPerPage: 100,
      filter: {
        name: "",
        country: ""
      }
    };
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

  render() {
    const { order, orderBy } = this.state;
    const { classes } = this.props;
    return (
      <Paper className={classes.root}>
        <Typography variant="h2" gutterBottom className={classes.margined}>
          Airlines
        </Typography>
        <TextField
          id="search"
          label="City"
          className={classes.textField}
          value={this.state.filter.city}
          onChange={this.handleFilterChange("name")}
          margin="normal"
          variant="outlined"
          type="text"
          InputProps={{
            className: classes.input
          }}
        />
        <TextField
          id="search"
          label="Country"
          className={classes.textField}
          value={this.state.filter.country}
          onChange={this.handleFilterChange("country")}
          margin="normal"
          variant="outlined"
          type="text"
          InputProps={{
            className: classes.input
          }}
        />

        <Query
          query={gql`
            query airlinesPaginateQuery(
              $first: Int
              $offset: Int
              $orderBy: [_AirlineOrdering]
              $filter: _AirlineFilter
            ) {
              Airline(
                first: $first
                offset: $offset
                orderBy: $orderBy
                filter: $filter
              ) {
                code
                name
                country
              }
            }
          `}
          variables={{
            first: this.state.rowsPerPage,
            offset: this.state.rowsPerPage * this.state.page,
            orderBy: this.state.orderBy + "_" + this.state.order,
            filter: this.getFilter()
          }}
        >
          {({ loading, error, data }) => {
            const msg = loading ? "Loading..." : error ? "Error" : null;

            if (msg) return <p className={classes.margined}>{msg}</p>;

            return (
              <Table className={this.props.classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      key="name"
                      sortDirection={orderBy === "name" ? order : false}
                    >
                      <Tooltip
                        title="Sort"
                        placement="bottom-start"
                        enterDelay={300}
                      >
                        <TableSortLabel
                          active={orderBy === "name"}
                          direction={order}
                          onClick={() => this.handleSortRequest("name")}
                        >
                          Name
                        </TableSortLabel>
                      </Tooltip>
                    </TableCell>
                    <TableCell
                      key="code"
                      sortDirection={orderBy === "code" ? order : false}
                      numeric
                    >
                      <Tooltip
                        title="Sort"
                        placement="bottom-start"
                        enterDelay={300}
                      >
                        <TableSortLabel
                          active={orderBy === "code"}
                          direction={order}
                          onClick={() => this.handleSortRequest("code")}
                        >
                          Code
                        </TableSortLabel>
                      </Tooltip>
                    </TableCell>
                    <TableCell
                      key="country"
                      sortDirection={orderBy === "country" ? order : false}
                      numeric
                    >
                      <Tooltip
                        title="Sort"
                        placement="bottom-start"
                        enterDelay={300}
                      >
                        <TableSortLabel
                          active={orderBy === "country"}
                          direction={order}
                          onClick={() => this.handleSortRequest("country")}
                        >
                          Country
                        </TableSortLabel>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.Airline.map(n => {
                    return (
                      <TableRow key={n.code}>
                        <TableCell component="th" scope="row">
                          {n.code}
                        </TableCell>
                        <TableCell>{n.name}</TableCell>
                        <TableCell>{n.country}</TableCell>
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

export default withStyles(styles)(AirlineList);
