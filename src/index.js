import React from "react";
import ReactDOM from "react-dom";
import { createBrowserHistory } from "history";
import { Router, Route, Switch } from "react-router-dom";

import getWeb3 from './utils/getWeb3'

import "assets/css/material-dashboard-react.css?v=1.3.0";

import indexRoutes from "routes/index.jsx";

const hist = createBrowserHistory();

getWeb3(process.env.ETHEREUM_NODE)
.then(results => {
  console.log('Web3 initialized!')
})
.catch(() => {
  console.log('Error in web3 initialization.')
})

ReactDOM.render(
  <Router history={hist}>
    <Switch>
      {indexRoutes.map((prop, key) => {
        return <Route path={prop.path} component={prop.component} key={key} />;
      })}
    </Switch>
  </Router>,
  document.getElementById("root")
);
