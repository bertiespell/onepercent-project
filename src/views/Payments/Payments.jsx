import React from "react";
import { drizzleConnect } from 'drizzle-react'
import { ContractData } from "components/drizzle-react-components";
import Web3 from 'web3';

// @material-ui/core components
import withStyles from "@material-ui/core/styles/withStyles";
import Grid from "@material-ui/core/Grid";

import PropTypes from 'prop-types';
// core components
import GridItem from "components/Grid/GridItem.jsx";
import Table from "components/Table/Table.jsx";
import Card from "components/Card/Card.jsx";
import CardHeader from "components/Card/CardHeader.jsx";
import CardBody from "components/Card/CardBody.jsx";

import InputAdornment from "@material-ui/core/InputAdornment";
// @material-ui/icons
import MonetizationOn from "@material-ui/icons/MonetizationOn";
//core components
import CustomInput from "components/CustomInput/CustomInput.jsx";
import CustomDropdown from "components/CustomDropdown/CustomDropdown.jsx";
import Button from 'components/CustomButtons/Button.jsx';

import getRandomInt from '../../utils/maths/getRandomNumber';

const styles = {
  cardCategoryWhite: {
    "&,& a,& a:hover,& a:focus": {
      color: "rgba(255,255,255,.62)",
      margin: "0",
      fontSize: "14px",
      marginTop: "0",
      marginBottom: "0"
    },
    "& a,& a:hover,& a:focus": {
      color: "#FFFFFF"
    }
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: "#777",
      fontSize: "65%",
      fontWeight: "400",
      lineHeight: "1"
    }
  }
};

class Payments extends React.Component {

  availableGanacheAccounts;
  tableData = [];
  transactionIndexToData = [];

  constructor(props, context) {
    super(props);
    this.contracts = context.drizzle.contracts;
    this.drizzle = context.drizzle;
    this.findGanacheAccounts();
  }

  async findGanacheAccounts() {
    this.availableGanacheAccounts = await new Web3(new Web3.providers.HttpProvider('http://localhost:7545')).eth.getAccounts();
  }

  async seedData() {
    const amount = this.context.drizzle.web3.utils.toWei(getRandomInt(10).toString(), "ether");
    const date = new Date(Date.now()).toString();

    const payment = [
      this.props.accounts[0],
      this.contracts.ExternalContractExample.address,
      this.context.drizzle.web3.utils.fromWei(amount) + " Ether",
      date
    ]

    const transactionIndex = await this.contracts.PaymentPipe.methods.callExternalContractWithOnePercentTax.cacheSend(this.contracts.ExternalContractExample.address, "paymentExample()", {from: this.props.accounts[0], value: amount, gasPrice: 10});
    this.transactionIndexToData[transactionIndex] = payment;
  }

  buildTableData() {
    this.tableData = [];

    const state = this.drizzle.store.getState();

    state.transactionStack.forEach((transactionHash, index) => {
      if (state.transactions[transactionHash].status === "success") {
        this.tableData.push(this.transactionIndexToData[index]);
      } else if (state.transactions[transactionHash].status === "pending") {
        this.tableData.push(['Loading...'])
      }
    });
  }

  componentDidUpdate(e) {
    this.buildTableData();
  }

  async makeNewPayment() {
    let accountIndex = getRandomInt(10);
    while (this.props.accounts[0] === this.availableGanacheAccounts[accountIndex]) {
      accountIndex = getRandomInt(10);
    }

    const amount = this.context.drizzle.web3.utils.toWei(getRandomInt(10).toString(), "ether");
    const date = new Date(Date.now()).toString();

    const payment = [
      this.props.accounts[0],
      this.availableGanacheAccounts[accountIndex],
      this.context.drizzle.web3.utils.fromWei(amount) + " Ether",
      date
    ]

    const transactionIndex = await this.contracts.PaymentPipe.methods.payAccountWithOnePercentTax.cacheSend(this.availableGanacheAccounts[accountIndex], {from: this.props.accounts[0], value: amount, gasPrice: 10});
    this.transactionIndexToData[transactionIndex] = payment;
  }

  render() {
    const { classes } = this.props;
    return (
      <Grid container>
      <p><strong>My Balance</strong>:

        <ContractData contract="PaymentPipe" method="totalFunds" /></p>

        <GridItem xs={12} sm={12} md={12}>
          <Button
            onClick={this.seedData.bind(this)}
          >
          Seed test data
          </Button>
        </GridItem>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="primary">
              <h4 className={classes.cardTitleWhite}>Payments</h4>
              <p className={classes.cardCategoryWhite}>
                All payments to date
              </p>
            </CardHeader>
            <CardBody>
              <Table
                tableHeaderColor="primary"
                tableHead={["From", "To", "Amount", "Date"]}
                tableData={this.tableData}
              />
            </CardBody>
          </Card>
        </GridItem>
        <Grid container>
          <GridItem xs={12} sm={12} md={3}>
            <CustomDropdown
              formControlProps={{
                fullWidth: true
              }}
            />
          </GridItem>
          <GridItem xs={12} sm={12} md={3}>
            <CustomInput
              labelText="Send to Address"
              id="error"
              error
              formControlProps={{
                fullWidth: true
              }}
            />
          </GridItem>
          <GridItem xs={12} sm={12} md={3}>
            <CustomInput
              labelText="Amount"
              id="material"
              formControlProps={{
                fullWidth: true
              }}
              inputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <MonetizationOn />
                  </InputAdornment>
                )
              }}
            />
          </GridItem>
          <GridItem xs={12} sm={12} md={3}>
            <Button
              onClick={this.makeNewPayment.bind(this)}
            >
            Seed test data
            </Button>
          </GridItem>
        </Grid>
      </Grid>
    );
  }
}

CustomInput.propTypes = {
  labelText: PropTypes.node,
  labelProps: PropTypes.object,
  id: PropTypes.string,
  inputProps: PropTypes.object,
  formControlProps: PropTypes.object,
  error: PropTypes.bool,
  success: PropTypes.bool
};



Payments.propTypes = {
  classes: PropTypes.object.isRequired
};

Payments.contextTypes = {
  drizzle: PropTypes.object
}

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    SimpleStorage: state.contracts.SimpleStorage,
    TutorialToken: state.contracts.TutorialToken,
    drizzleStatus: state.drizzleStatus,
    web3: state.web3
  }
}

const mapDispatchToProps = dispatch => {
  return {}
}

export default drizzleConnect(withStyles(styles)(Payments), mapStateToProps, mapDispatchToProps);
