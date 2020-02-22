import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { withStyles } from "@material-ui/core/styles";
import {
  Paper,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select
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
    marginTop: theme.spacing(3),
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
  label: {
    marginLeft: theme.spacing.unit,
    fontSize: "0.4rem"
  }
});

const geoUrl =
  "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

class Map extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filter: {
        code: "SVO",
        city: "",
        country: "",
        showNeighbors: false,
        showDirects: false
      }
    };
  }

  getFilter = () =>
    Object.keys(this.state.filter)
      .filter(x => !x.startsWith("show"))
      .map(x => ({ [x + "_contains"]: this.state.filter[x] }))
      .reduce((a, b) => ({ ...a, ...b }), {});

  handleFilterChange = (filterName, targetValue) => event => {
    this.setState({
      filter: {
        ...this.state.filter,
        [filterName]: event.target[targetValue]
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
          onChange={this.handleFilterChange("code", "value")}
          margin="normal"
          variant="outlined"
          type="text"
          InputProps={{
            className: classes.input
          }}
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
                directs {
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
              <React.Fragment>
                <FormControl>
                  <InputLabel shrink htmlFor="select-native">
                    Neighbors
                  </InputLabel>
                  <Select
                    native
                    value={""}
                    onChange={this.handleFilterChange("code", "value")}
                    inputProps={{
                      id: "select-native"
                    }}
                  >
                    <option value="" />
                    {data.Airport.flatMap(x => x.neighbors).map(x => (
                      <option key={x.code + "_Select"} value={x.code}>
                        {x.code}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControlLabel
                  value="bottom"
                  control={
                    <Checkbox
                      id="search"
                      label="Direct Flights"
                      value="Directs"
                      checked={this.state.filter.showDirects}
                      onChange={this.handleFilterChange(
                        "showDirects",
                        "checked"
                      )}
                      margin="normal"
                    />
                  }
                  label="Destinations"
                  labelPlacement="bottom"
                />
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
                        <text className={classes.label}>{x.code}</text>
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
                            <text className={classes.label}>{x.code}</text>
                          </Marker>
                        );
                      })
                    : null}

                  {this.state.filter.showDirects
                    ? data.Airport.flatMap(x => x.directs).map(x => {
                        return (
                          <React.Fragment>
                            <Marker
                              key={x.code + "_Marker"}
                              coordinates={[
                                x.location.longitude.toFixed(3),
                                x.location.latitude.toFixed(3)
                              ]}
                            >
                              <circle r={1} fill="#5533ff" />
                              <text className={classes.label}>{x.code}</text>
                            </Marker>
                            <Line
                              key={x.code + "_Line"}
                              from={[
                                data.Airport[0].location.longitude.toFixed(3),
                                data.Airport[0].location.latitude.toFixed(3)
                              ]}
                              to={[
                                x.location.longitude.toFixed(3),
                                x.location.latitude.toFixed(3)
                              ]}
                              stroke="#FF5533"
                              strokeWidth={0.2}
                              strokeLinecap="round"
                            />
                          </React.Fragment>
                        );
                      })
                    : null}
                </ComposableMap>
              </React.Fragment>
            );
          }}
        </Query>
      </Paper>
    );
  }
}

export default withStyles(styles)(Map);
