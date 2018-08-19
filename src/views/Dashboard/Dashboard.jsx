import React from "react";
import PropTypes from "prop-types";
import { drizzleConnect } from 'drizzle-react'

import PaymentPipe from "../../../build/contracts/PaymentPipe.json";
import Web3 from 'web3'

// @material-ui/core
import withStyles from "@material-ui/core/styles/withStyles";
import Grid from "@material-ui/core/Grid";
// @material-ui/icons
import ContentCopy from "@material-ui/icons/ContentCopy";
import Store from "@material-ui/icons/Store";
import InfoOutline from "@material-ui/icons/InfoOutline";
import Warning from "@material-ui/icons/Warning";
import DateRange from "@material-ui/icons/DateRange";
import LocalOffer from "@material-ui/icons/LocalOffer";
import Update from "@material-ui/icons/Update";
import Accessibility from "@material-ui/icons/Accessibility";
// core components
import GridItem from "components/Grid/GridItem.jsx";
import Danger from "components/Typography/Danger.jsx";
import Card from "components/Card/Card.jsx";
import CardHeader from "components/Card/CardHeader.jsx";
import CardIcon from "components/Card/CardIcon.jsx";
import CardFooter from "components/Card/CardFooter.jsx";

import dashboardStyle from "assets/jss/material-dashboard-react/views/dashboardStyle.jsx";

class Dashboard extends React.Component {

  paymentsMade = 0;
  UserOPCTokens;
  personallyGenerated;
  globallyGenerated;
  globallyGeneratedCacheCall;
  generatedAmmount = 0;

  constructor(props, context) {
    super(props)
    this.globallyGeneratedCacheCall = context.drizzle.contracts.PaymentPipe.methods.totalFunds.call();
  }

  state = {
    value: 0
  };
  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  componentDidUpdate(e) {
    this.generateDashboardData();
  }

  async generateDashboardData() {
    const state = this.context.drizzle.store.getState();
    this.paymentsMade = state.transactionStack.length;
 
    this.globallyGenerated = await this.globallyGeneratedCacheCall.call()

    this.generatedAmount = Number(this.context.drizzle.web3.utils.fromWei(this.globallyGenerated)).toFixed(2);
  }

  async findAccounts() {
    this.contracts.TutorialToken.methods.transfer(this.contracts.TutorialToken.address, 1000).send()
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <Grid container>
          <GridItem xs={12} sm={6} md={3}>
            <Card>
              <CardHeader color="warning" stats icon>
                <CardIcon color="warning">
                  <ContentCopy />
                </CardIcon>
                <p className={classes.cardCategory}>Payments Made</p>{/*number of payments made by user*/}
                <h3 className={classes.cardTitle}>
                  {this.paymentsMade}
                </h3>
              </CardHeader>
              <CardFooter stats>
                <div className={classes.stats}>
                  <Danger>
                    <Warning />
                  </Danger>
                  <a href="#pablo" onClick={() => this.findAccounts()}>
                    Get more space
                  </a>
                </div>
              </CardFooter>
            </Card>
          </GridItem>
          <GridItem xs={12} sm={6} md={3}>
            <Card>
              <CardHeader color="success" stats icon>
                <CardIcon color="success">
                  <Store />
                </CardIcon>
                <p className={classes.cardCategory}>OPC Tokens</p>
                <h3 className={classes.cardTitle}>
                  {/* <ContractData contract="PaymentPipe" method="getCoinBalance"/> */}
                </h3>
              </CardHeader>
              <CardFooter stats>
                <div className={classes.stats}>
                  <DateRange />
                  Last 24 Hours
                </div>
              </CardFooter>
            </Card>
          </GridItem>
          <GridItem xs={12} sm={6} md={3}>
            <Card>
              <CardHeader color="danger" stats icon>
                <CardIcon color="danger">
                  <InfoOutline />
                </CardIcon>
                <p className={classes.cardCategory}>Personally Generated</p> {/* amount the user has individually generated over time to the funding circle */}
                <h3 className={classes.cardTitle}>{this.context.drizzle.web3.utils.fromWei(this.props.paymentValue.toString())}</h3>
              </CardHeader>
              <CardFooter stats>
                <div className={classes.stats}>
                  <LocalOffer />
                  Tracked from Github
                </div>
              </CardFooter>
            </Card>
          </GridItem>
          <GridItem xs={12} sm={6} md={3}>
            <Card>
              <CardHeader color="info" stats icon>
                <CardIcon color="info">
                  <Accessibility />
                </CardIcon>
                <p className={classes.cardCategory}>Globally Generated</p>{/* The total amount of money generated by all users through payments */}
                <h3 className={classes.cardTitle}>
                {this.generatedAmount}
                </h3>
              </CardHeader>
              <CardFooter stats>
                <div className={classes.stats}>
                  <Update />
                  Just Updated
                </div>
              </CardFooter>
            </Card>
          </GridItem>
        </Grid>
      </div>
    );
  }
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired
};

Dashboard.contextTypes = {
  drizzle: PropTypes.object
}

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    SimpleStorage: state.contracts.SimpleStorage,
    TutorialToken: state.contracts.TutorialToken,
    drizzleStatus: state.drizzleStatus,
    paymentValue: state.paymentDataReducer.paymentValue,
    paymentPipeContract: state.contracts.PaymentPipe,
    web3: state.web3
  }
}

const mapDispatchToProps = dispatch => {
  return {}
}

export default drizzleConnect(withStyles(dashboardStyle)(Dashboard), mapStateToProps, mapDispatchToProps);
