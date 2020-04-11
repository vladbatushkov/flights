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

const GET_AIRPORTS = gql`
  query airportsPaginateQuery(
    $first: Int
    $offset: Int
    $orderBy: [_AirportOrdering]
    $filter: _AirportFilter
  ) {
    Airport(
      first: $first
      offset: $offset
      orderBy: $orderBy
      filter: $filter
    ) {
      code
      name
      city
      country
      location {
        longitude
        latitude
      }
    }
  }
`;

function AirportList(props) {
  const { classes } = props;
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("name");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(100);
  const [filterState, setFilterState] = React.useState({ 
    code: "",
    city: "",
    country: ""
  });

  const getFilter = () =>
    Object.keys(filterState)
      .map(x => ({ [x + "_contains"]: filterState[x] }))
      .reduce((a, b) => ({ ...a, ...b }), {});

  const { loading, data, error } = useQuery(GET_AIRPORTS, {
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
        Airports
      </Typography>
      <TextField
        id="search"
        label="Code"
        className={classes.textField}
        value={filterState.code}
        onChange={handleFilterChange("code")}
        margin="normal"
        variant="outlined"
        type="text"
        InputProps={{
          className: classes.input
        }}
      />
      <TextField
        id="search"
        label="City"
        className={classes.textField}
        value={filterState.city}
        onChange={handleFilterChange("city")}
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
                    <TableCell
                      key="city"
                      sortDirection={orderBy === "city" ? order : false}
                      numeric
                    >
                      <Tooltip
                        title="Sort"
                        placement="bottom-start"
                        enterDelay={300}
                      >
                        <TableSortLabel
                          active={orderBy === "city"}
                          direction={order}
                          onClick={() => handleSortRequest("city")}
                        >
                          City
                        </TableSortLabel>
                      </Tooltip>
                    </TableCell>
                    <TableCell
                      key="location"
                      numeric
                    >
                      Coords.
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.Airport.map(n => {
                    return (
                      <TableRow key={n.code}>
                        <TableCell component="th" scope="row">
                          {n.name}
                        </TableCell>
                        <TableCell>{n.code}</TableCell>
                        <TableCell>{n.city}</TableCell>
                        <TableCell>{n.country}</TableCell>
                        <TableCell>{`(${n.location.latitude},${n.location.longitude})`}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
      </Paper>
  );
}

export default withStyles(styles)(AirportList);
