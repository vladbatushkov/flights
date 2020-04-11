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

const GET_AIRLINES = gql`
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
`;

function AirlineList(props) {
  const { classes } = props;
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("name");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(100);
  const [filterState, setFilterState] = React.useState({ 
    name: "",
    country: ""
  });

  const getFilter = () =>
    Object.keys(filterState)
      .map(x => ({ [x + "_contains"]: filterState[x] }))
      .reduce((a, b) => ({ ...a, ...b }), {});

  const { loading, data, error } = useQuery(GET_AIRLINES, {
    variables: {
      first: rowsPerPage,
      offset: rowsPerPage * page,
      orderBy: orderBy + "_" + order,
      filter: getFilter()
    }
  });

  const handleSortRequest = property => {
    const newOrderBy = property;
    let newOrder = "desc";

    if (orderBy === property && order === "desc") {
      newOrder = "asc";
    }

    setOrder(newOrder);
    setOrderBy(newOrderBy);
  };

  const handleFilterChange = filterName => event => {
    const val = event.target.value;

    setFilterState(x => ({
      ...x,
      [filterName]: val
    }));
  };

  return (
    <Paper className={classes.root}>
      <Typography variant="h2" gutterBottom className={classes.margined}>
          Airlines
        </Typography>
        <TextField
          id="search"
          label="Name"
          className={classes.textField}
          value={filterState.city}
          onChange={handleFilterChange("name")}
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
          value={filterState.country}
          onChange={handleFilterChange("country")}
          margin="normal"
          variant="outlined"
          type="text"
          InputProps={{
            className: classes.input
          }}
        />
        {loading && !error && <p>Loading...</p>}
        {error && !loading && <p>Error</p>}
        {data && !loading && !error && (
          <Table className={classes.table}>
          <TableHead>
            <TableRow>
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
                    onClick={() => handleSortRequest("code")}
                  >
                    Code
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
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
                    onClick={() => handleSortRequest("name")}
                  >
                    Name
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
                    onClick={() => handleSortRequest("country")}
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
        )}
      </Paper>
    );
}

export default withStyles(styles)(AirlineList);
