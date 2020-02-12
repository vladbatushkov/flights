import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";

import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  CssBaseline,
  Drawer,
  List,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText
} from "@material-ui/core";

import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Language as GlobeIcon,
  Flight as AirlineIcon,
  Event as EventIcon,
  House as AirportIcon
} from "@material-ui/icons";

import AirportList from "./AirportList";
import AirlineList from "./AirlineList";
import FlightsSearch from "./FlightsSearch2";
import Map from "./Map";
import classNames from "classnames";

const drawerWidth = 240;

const styles = theme => ({
  root: {
    display: "flex"
  },
  toolbar: {
    paddingRight: 24
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    backgroundColor: "#383838"
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 36
  },
  menuButtonHidden: {
    display: "none"
  },
  title: {
    flexGrow: 1
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    width: theme.spacing.unit * 7,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing.unit * 9
    }
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    height: "100vh",
    overflow: "auto"
  }
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedView: "FlightsSearch",
      open: true
    };
  }

  setSelectedView(viewName) {
    this.setState({
      selectedView: viewName
    });
  }

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <CssBaseline />
        <div className={classes.root}>
          <AppBar
            position="absolute"
            className={classNames(
              classes.appBar,
              this.state.open && classes.appBarShift
            )}
          >
            <Toolbar
              disableGutters={!this.state.open}
              className={classes.toolbar}
            >
              <IconButton
                color="inherit"
                aria-label="Open drawer"
                onClick={this.handleDrawerOpen}
                className={classNames(
                  classes.menuButton,
                  this.state.open && classes.menuButtonHidden
                )}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                component="h1"
                variant="title"
                color="inherit"
                noWrap
                className={classes.title}
              >
                GRANDstack Flights Search
              </Typography>
            </Toolbar>
          </AppBar>
          <Drawer
            variant="permanent"
            classes={{
              paper: classNames(
                classes.drawerPaper,
                !this.state.open && classes.drawerPaperClose
              )
            }}
            open={this.state.open}
          >
            <div className={classes.toolbarIcon}>
              <IconButton onClick={this.handleDrawerClose}>
                <ChevronLeftIcon />
              </IconButton>
            </div>
            <Divider />
            <List>
              <div>
                <ListItem
                  button
                  onClick={() => this.setSelectedView("Airports")}
                >
                  <ListItemIcon>
                    <AirportIcon />
                  </ListItemIcon>
                  <ListItemText primary="Airports" />
                </ListItem>

                <ListItem
                  button
                  onClick={() => this.setSelectedView("Airlines")}
                >
                  <ListItemIcon>
                    <AirlineIcon />
                  </ListItemIcon>
                  <ListItemText primary="Airlines" />
                </ListItem>

                <ListItem
                  button
                  onClick={() => this.setSelectedView("FlightsSearch")}
                >
                  <ListItemIcon>
                    <EventIcon />
                  </ListItemIcon>
                  <ListItemText primary="Flights Search" />
                </ListItem>

                <ListItem button onClick={() => this.setSelectedView("Map")}>
                  <ListItemIcon>
                    <GlobeIcon />
                  </ListItemIcon>
                  <ListItemText primary="Map" />
                </ListItem>
              </div>
            </List>
          </Drawer>
          <main className={classes.content}>
            <div className={classes.appBarSpacer} />

            {/* FIXME: Use proper routing here instead :-) Nooo */}
            <Typography component="div" className={classes.chartContainer}>
              {this.state.selectedView === "Airports" ? <AirportList /> : null}
              {this.state.selectedView === "Airlines" ? <AirlineList /> : null}
              {this.state.selectedView === "FlightsSearch" ? (
                <FlightsSearch />
              ) : null}
              {this.state.selectedView === "Map" ? <Map /> : null}
            </Typography>
          </main>
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(App);
