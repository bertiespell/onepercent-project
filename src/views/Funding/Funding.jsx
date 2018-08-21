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

import InputLabel from "@material-ui/core/InputLabel";
import CustomInput from "components/CustomInput/CustomInput.jsx";

import submitApplication from "../../actions/submit-application";

import Application from "../../../build/contracts/Application.json";

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
    this.drizzle = context.drizzle;

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
    this.votingIsOpen = await this.isVotingOpenTransactionalObject.call();
  }

  async submitApplication(name, description) {
    const transactionObject = this.context.drizzle.contracts.FundingApplications.methods.submitApplication(name, description);

    const data = await transactionObject.send({from: this.props.accounts[0], value: this.drizzle.web3.utils.toWei(String(0.004), "ether")});

    const applicationAddress = data.events.ApplicationSubmitted.address;


    var currentProvider = new Web3.providers.HttpProvider('http://localhost:7545'); 
    const web3Instance = new Web3(currentProvider);

    const application = new web3Instance.eth.Contract(Application.abi, applicationAddress);

    this.props.submitApplication(application, name, description);
  }

  async voteForApplication(contract) {
    console.log('Attempting to vote for', contract);

    // await opcToken.approve(contract.address, 1, {from: accounts[3], gasPrice: 0});

    const approvalObject = this.context.drizzle.contracts.OPCToken.methods.approve(contract._address, this.props.accounts[0]);
    const approvalGas = await approvalObject.estimateGas();
    const approvalTransaction = await approvalObject.send({from: this.props.accounts[0], gas: approvalGas*2});
    console.log(approvalTransaction);


    const transactionalObject = contract.methods.voteForApplication(1);
    console.log(transactionalObject)
    const gas = await transactionalObject.estimateGas();
    console.log(gas);
    const transaction = await transactionalObject.send({from: this.props.accounts[0], gas: gas*2});
  } 
    
  render() {
    const classNames = ['success', "warning", "danger"];
    let classNamesIndex = 3;
    const gridItems = this.props.applications.map(((application, index) => {
      classNamesIndex++;
      if (classNamesIndex > 2) {
          classNamesIndex = 0;
      }
      return (
        <GridItem xs={12} sm={12} md={4} key={index}>
          <Card chart>
            <CardHeader color={classNames[classNamesIndex]}>
              {application.applicationInstance._address}
            </CardHeader>
            <CardBody>
              <h4 className={this.classes.cardTitle}>{application.name}</h4>
              <p className={this.classes.cardCategory}>
                <span className={this.classes.successText}>
                {application.description}
                </span>{" "}
              </p>
            </CardBody>
            <CardFooter chart>
              <div className={this.classes.stats}>
              <Button color="info" round onClick={() => this.voteForApplication(application.applicationInstance)}>
                  Vote for this Application!
              </Button>
              </div>
            </CardFooter>
          </Card>
        </GridItem>
      )
    }))

    return (
      <div>
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
            <GridItem xs={12} sm={12} md={12}>

            The current status of the contract:
            <br/>
            Applications are open: {String(this.applicationsAreOpen)}
            <br/>
            Voting is open: {String(this.votingIsOpen)}
            </GridItem>
          </Grid>
          <Grid container>

{gridItems}

                {/* <GridItem xs={12} sm={12} md={4}>
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
                </GridItem> */}
              </Grid>
        </Card>


      <Grid container>
          <GridItem xs={12} sm={12} md={2}>
          </GridItem>
        <GridItem xs={12} sm={12} md={8}>
          <Card>
            <CardHeader color="primary">
              <h4 className={this.classes.cardTitleWhite}>Application</h4>
              <p className={this.classes.cardCategoryWhite}>Submit a funding application</p>
            </CardHeader>
            <CardBody>
              <Grid container>
                <GridItem xs={12} sm={12} md={3}>
                  <CustomInput
                    labelText="Project Name"
                    id="username"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={4}>
                  <CustomInput
                    labelText="Email address"
                    id="email-address"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
              </Grid>
              <Grid container>
                <GridItem xs={12} sm={12} md={6}>
                  <CustomInput
                    labelText="First Name"
                    id="first-name"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={6}>
                  <CustomInput
                    labelText="Last Name"
                    id="last-name"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
              </Grid>
              <Grid container>
                <GridItem xs={12} sm={12} md={4}>
                  <CustomInput
                    labelText="City"
                    id="city"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={4}>
                  <CustomInput
                    labelText="Country"
                    id="country"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={4}>
                  <CustomInput
                    labelText="Postal Code"
                    id="postal-code"
                    formControlProps={{
                      fullWidth: true
                    }}
                  />
                </GridItem>
              </Grid>
              <Grid container>
                <GridItem xs={12} sm={12} md={12}>
                  <InputLabel style={{ color: "#AAAAAA" }}>Description</InputLabel>
                  <CustomInput
                    labelText="Explain what your idea is, and what you would use the funding for"
                    id="about-me"
                    formControlProps={{
                      fullWidth: true
                    }}
                    inputProps={{
                      multiline: true,
                      rows: 5
                    }}
                  />
                </GridItem>
              </Grid>
            </CardBody>
            <CardFooter>
              <Button color="primary" onClick={() => this.submitApplication("Build a school", "We'd like funds to build a new school in our town")}>Submit Application</Button>
            </CardFooter>
          </Card>
          <GridItem xs={12} sm={12} md={4}>
          </GridItem>
        </GridItem>
      </Grid>
      </div>
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
    applications: state.paymentDataReducer.applications,
    OPCToken: state.contracts.OPCToken,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    submitApplication: (application, name, description) => dispatch(submitApplication(application, name, description)),
  }
}

export default drizzleConnect(withStyles(style)(Funding), mapStateToProps, mapDispatchToProps);

