import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { withStyles } from "@material-ui/core/styles";
import {
  Paper,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel
} from "@material-ui/core";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line
} from "react-simple-maps";

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

const geoUrl =
  "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

class Map extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filter: {
        code: "",
        city: "Bangkok",
        country: "Thailand",
        showNeighbors: false,
        showDestinations: false
      }
    };
  }

  getFilter = () =>
    Object.keys(this.state.filter)
      .filter(x => !x.startsWith("show"))
      .map(x => ({ [x + "_contains"]: this.state.filter[x] }))
      .reduce((a, b) => ({ ...a, ...b }), {});

  handleFilterChange = filterName => event => {
    this.setState({
      filter: {
        ...this.state.filter,
        [filterName]: event.target.value
      }
    });
  };

  handleFilterChecked = filterName => event => {
    this.setState({
      filter: {
        ...this.state.filter,
        [filterName]: event.target.checked
      }
    });
  };

  render() {
    const { classes } = this.props;
    return (
      <Paper className={classes.root}>
        <Typography variant="h2" gutterBottom className={classes.margined}>
          Map
        </Typography>
        <TextField
          id="search"
          label="Code"
          className={classes.textField}
          value={this.state.filter.code}
          onChange={this.handleFilterChange("code")}
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
          value={this.state.filter.city}
          onChange={this.handleFilterChange("city")}
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
        <FormControlLabel
          value="bottom"
          control={
            <Checkbox
              id="search"
              label="Neighbors"
              value="Neighbors"
              checked={this.state.filter.showNeighbors}
              onChange={this.handleFilterChecked("showNeighbors")}
              margin="normal"
            />
          }
          label="Neighbors"
          labelPlacement="bottom"
        />
        <FormControlLabel
          value="bottom"
          control={
            <Checkbox
              id="search"
              label="Destinations"
              value="Destinations"
              checked={this.state.filter.showDestinations}
              onChange={this.handleFilterChecked("showDestinations")}
              margin="normal"
            />
          }
          label="Destinations"
          labelPlacement="bottom"
        />

        <Query
          query={gql`
            query airportsPaginateQuery($filter: _AirportFilter) {
              Airport(filter: $filter) {
                code
                name
                city
                country
                location {
                  longitude
                  latitude
                }
                destinations {
                  code
                  name
                  city
                  country
                  location {
                    longitude
                    latitude
                  }
                }
                neighbors {
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
            }
          `}
          variables={{
            filter: this.getFilter()
          }}
        >
          {({ loading, error, data }) => {
            const msg = loading
              ? "Loading..."
              : error
              ? "Error"
              : data.Airport.length > 0
              ? null
              : "";

            if (msg) return <p className={classes.margined}>{msg}</p>;

            console.log(data.Airport);

            return (
              <ComposableMap projection="geoMercator">
                <Geographies
                  geography={geoUrl}
                  fill="#D6D6DA"
                  stroke="#FFFFFF"
                  strokeWidth={0.2}
                >
                  {({ geographies }) =>
                    geographies.map(geo => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="#DDD"
                        stroke="#FFF"
                      />
                    ))
                  }
                </Geographies>
                {data.Airport.map(x => {
                  return (
                    <Marker
                      key={x.code}
                      coordinates={[
                        x.location.longitude.toFixed(3),
                        x.location.latitude.toFixed(3)
                      ]}
                    >
                      <circle r={1} fill="#ff5533" />
                    </Marker>
                  );
                })}

                {this.state.filter.showNeighbors
                  ? data.Airport.flatMap(x => x.neighbors).map(x => {
                      return (
                        <Marker
                          key={x.code}
                          coordinates={[
                            x.location.longitude.toFixed(3),
                            x.location.latitude.toFixed(3)
                          ]}
                        >
                          <circle r={1} fill="#33ff55" />
                        </Marker>
                      );
                    })
                  : null}

                {this.state.filter.showDestinations
                  ? data.Airport.flatMap(x => x.destinations).map(x => {
                      return (
                        <Marker
                          key={x.code}
                          coordinates={[
                            x.location.longitude.toFixed(3),
                            x.location.latitude.toFixed(3)
                          ]}
                        >
                          <circle r={1} fill="#5533ff" />
                        </Marker>
                      );
                    })
                  : null}
              </ComposableMap>
            );
          }}
        </Query>
      </Paper>
    );
  }
}

export default withStyles(styles)(Map);
