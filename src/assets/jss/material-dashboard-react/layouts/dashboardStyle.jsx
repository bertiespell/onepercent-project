import {
  drawerWidth,
  transition,
  container
} from "assets/jss/material-dashboard-react.jsx";

import img from '../../../img/bg-01.jpg';

const appStyle = theme => ({
  wrapper: {
    position: "relative",
    top: "0",
    height: "100vh"
  },
  mainPanel: {
    [theme.breakpoints.up("md")]: {
      width: `calc(100% - ${drawerWidth}px)`
    },
    overflow: "auto",
    position: "relative",
    float: "right",
    // backgroundImage: `url(${img})`,
    ...transition,
    maxHeight: "100%",
    width: "100%",
    overflowScrolling: "touch"
  },
  content: {
    marginTop: "70px",
    padding: "30px 15px",
    minHeight: "calc(100vh - 123px)"
  },
  container,
  map: {
    marginTop: "70px"
  }
});

export default appStyle;
