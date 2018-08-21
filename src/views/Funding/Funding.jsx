import React from "react";
import { drizzleConnect } from 'drizzle-react'
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
// core components
import Card from "components/Card/Card.jsx";
import CardHeader from "components/Card/CardHeader.jsx";
import Grid from "@material-ui/core/Grid";
import GridItem from "components/Grid/GridItem.jsx";
import CardBody from "components/Card/CardBody.jsx";
import CardFooter from "components/Card/CardFooter.jsx";
import Button from "components/CustomButtons/Button.jsx";
const Web3 = require('web3');// @material-ui/core components

const style = {
  typo: {
    paddingLeft: "25%",
    marginBottom: "40px",
    position: "relative"
  },
  note: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    bottom: "10px",
    color: "#c0c1c2",
    display: "block",
    fontWeight: "400",
    fontSize: "13px",
    lineHeight: "13px",
    left: "0",
    marginLeft: "20px",
    position: "absolute",
    width: "260px"
  },
  cardCategoryWhite: {
    color: "rgba(255,255,255,.62)",
    margin: "0",
    fontSize: "14px",
    marginTop: "0",
    marginBottom: "0"
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none"
  }
};
class Funding extends React.Component {

  classes;
  fundingApplicationContract;
  web3;
  openApplicationTransactionObject;
  closeApplicationTransactionObject;
  openVotingTransactionObject;
  closeVotingTransactionObject;

  votingIsOpen = false;
  applicationsAreOpen = false;

  isVotingOpenTransactionalObject;
  areApplicationsOpenTransactionalObject;

  constructor(props, context) {
    super(props);
    const { classes } = props;
    this.classes = classes;

    // store methods to check the status of the contract 
    this.areApplicationsOpenTransactionalObject = context.drizzle.contracts.FundingApplications.methods.getApplicationStatus();

    this.isVotingOpenTransactionalObject = context.drizzle.contracts.FundingApplications.methods.getVotingStatus();

    // store methods to open and close voting and applications

    this.openApplicationTransactionObject = context.drizzle.contracts.FundingApplications.methods.openApplications();

    this.closeApplicationTransactionObject = context.drizzle.contracts.FundingApplications.methods.closeApplications();

    this.openVotingTransactionObject = context.drizzle.contracts.FundingApplications.methods.openVoting();

    this.closeVotingTransactionObject = context.drizzle.contracts.FundingApplications.methods.closeVoting();

    this.fundingApplicationContract = context.drizzle.contracts.FundingApplications;
  }

  async openApplications() {
    const gas = await this.openApplicationTransactionObject.estimateGas();
    const result = await this.openApplicationTransactionObject.send({from: this.props.accounts[0], gas: gas*2})
  }

  async closeApplications() {
    const gas = await this.closeApplicationTransactionObject.estimateGas();
    const result = await this.closeApplicationTransactionObject.send({from: this.props.accounts[0], gas: gas*2})
  }

  async openVoting() {
    const gas = await this.openVotingTransactionObject.estimateGas();
    await this.openVotingTransactionObject.send({from: this.props.accounts[0], gas: gas*2})
  }

  async closeVoting() {
    const gas = await this.closeVotingTransactionObject.estimateGas();
    await this.closeVotingTransactionObject.send({from: this.props.accounts[0], gas: gas*2})
  }

  async componentDidUpdate () {
    this.applicationsAreOpen = await this.areApplicationsOpenTransactionalObject.call();
    console.log('are applics open?!', this.applicationsAreOpen);
    this.votingIsOpen = await this.isVotingOpenTransactionalObject.call();
    console.log('Is voting open?', this.votingIsOpen)
  }
    
  render() {

    return (
      <Card>
        <CardHeader color="primary">
          <h4 className={this.classes.cardTitleWhite}>Projects</h4>
          <p className={this.classes.cardCategoryWhite}>
            View and vote for projects to receive funding
          </p>
        </CardHeader>
        <Grid container>
          <GridItem xs={12} sm={12} md={12}>

          <p>These controls would not be here in the final dapp, they would be controlled by the C level accounts. They are here for ease when interacting with the dapp during testing...</p>
          </GridItem>
        </Grid>
        <Grid container>
          <GridItem xs={4} sm={4} md={3} onClick={() => this.openApplications()}>
            <Button color="primary" round>
                Open Applications
            </Button>
          </GridItem>
          <GridItem xs={4} sm={4} md={3}>
            <Button color="primary" round onClick={() => this.closeApplications()}>
                Close Applications
            </Button>
          </GridItem>
          <GridItem xs={4} sm={4} md={3}>
            <Button color="primary" round onClick={() => this.openVoting()}>
                Open Voting
            </Button>
          </GridItem>
          <GridItem xs={4} sm={4} md={3}>
            <Button color="primary" round onClick={() => this.closeVoting()}>
                Close Voting
            </Button>
          </GridItem>
        </Grid>

        <Grid container>
              <GridItem xs={12} sm={12} md={4}>
                <Card chart>
                  <CardHeader color="success">
                    ohhhh go on then
                  </CardHeader>
                  <CardBody>
                    <h4 className={this.classes.cardTitle}>Daily Sales</h4>
                    <p className={this.classes.cardCategory}>
                      <span className={this.classes.successText}>
                        no arrow here
                      </span>{" "}
                      increase in today sales.
                    </p>
                  </CardBody>
                  <CardFooter chart>
                    <div className={this.classes.stats}>
                      Noooo time
                    </div>
                  </CardFooter>
                </Card>
              </GridItem>
              <GridItem xs={12} sm={12} md={4}>
                <Card chart>
                  <CardHeader color="warning">
                    hellllloooo
                  </CardHeader>
                  <CardBody>
                    <h4 className={this.classes.cardTitle}>Email Subscriptions</h4>
                    <p className={this.classes.cardCategory}>
                      Last Campaign Performance
                    </p>
                  </CardBody>
                  <CardFooter chart>
                    <div className={this.classes.stats}>
                      Nooooo time
                    </div>
                  </CardFooter>
                </Card>
              </GridItem>
              <GridItem xs={12} sm={12} md={4}>
                <Card chart>
                  <CardHeader color="danger">
                    hello
                  </CardHeader>
                  <CardBody>
                    <h4 className={this.classes.cardTitle}>Completed Tasks</h4>
                    <p className={this.classes.cardCategory}>
                      Last Campaign Performance
                    </p>
                  </CardBody>
                  <CardFooter chart>
                    <div className={this.classes.stats}>
                      No access time
                    </div>
                  </CardFooter>
                </Card>
              </GridItem>
            </Grid>
      </Card>
    );
  }
}

Funding.propTypes = {
  classes: PropTypes.object.isRequired
};

Funding.contextTypes = {
  drizzle: PropTypes.object
}

const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    FundingApplications: state.contracts.FundingApplications,
    drizzleStatus: state.drizzleStatus,
  }
}

const mapDispatchToProps = dispatch => {
  return {}
}

export default drizzleConnect(withStyles(style)(Funding), mapStateToProps, mapDispatchToProps);

