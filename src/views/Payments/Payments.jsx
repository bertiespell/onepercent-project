import React from "react";
import { drizzleConnect } from 'drizzle-react'
import { ContractData } from "components/drizzle-react-components";
import Web3 from 'web3';

import storePayment from "../../actions/store-payment.js";
import paymentSuccess from "../../actions/payment-successful";
import updatePaymentAsSuccessfull from "../../actions/update-payment";
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
  transactionIndexToData = [];
  trackedTransactionHashes = [];

  constructor(props, context) {
    super(props);
    this.contracts = context.drizzle.contracts;
    this.drizzle = context.drizzle;
    this.findGanacheAccounts();
    this.startPaymentPoll();
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

    // send payment and transactionIndex to

    const transactionIndex = await this.contracts.PaymentPipe.methods.callExternalContractWithOnePercentTax.cacheSend(this.contracts.ExternalContractExample.address, "paymentExample()", {from: this.props.accounts[0], value: amount, gasPrice: 10});

    const reduxData = payment.concat();
    reduxData.push(amount/100);
    this.props.storePayment({
      [transactionIndex]: reduxData
    });
    this.transactionIndexToData[transactionIndex] = payment;

    this.props.paymentSuccess({
      paymentData: ["Pending", ...reduxData, transactionIndex]
    })
  }

  componentDidCatch(error, info) {
    console.warn('Error encountered running application', error, info)
  }

  startPaymentPoll() {
    setInterval(() => {
      const dataToMutate = this.props.tableData.concat();
      const state = this.drizzle.store.getState();
      this.drizzleTransactionCount = state.transactionStack.length;

      dataToMutate
        .filter(transaction => transaction && transaction[0] === "Pending")
        .forEach(transaction => {
          const correspondingTransactionInDrizzle = state.transactions[state.transactionStack[transaction[6]]];

          if (correspondingTransactionInDrizzle && correspondingTransactionInDrizzle.status === "success") {
            this.props.updatePaymentAsSuccessfull({
              paymentData: transaction[6]
            });
          }
      });
    }, 1000)
  }


  componentDidUpdate(e) { }

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

    const reduxData = payment.concat();
    reduxData.push(amount/100);
    this.props.storePayment({
      [transactionIndex]: reduxData
    });

    this.transactionIndexToData[transactionIndex] = payment;
  }

  render() {
    const { classes } = this.props;
    return (
      <Grid container>
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
                tableHead={["Status", "From", "To", "Amount", "Date"]}
                tableData={this.props.tableData.splice(5, 1)}
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
            Make Payment
            </Button>
          </GridItem>
          <GridItem xs={12} sm={12} md={6}>
            <Button
              onClick={this.makeNewPayment.bind(this)}
            >
            Pay Random Account
            </Button>
          </GridItem>
          <GridItem xs={12} sm={12} md={6}>
            <Button
              onClick={this.seedData.bind(this)}
            >
            Pay External Contract
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
    paymentData: state.data,
    tableData: state.paymentDataReducer.paymentData,
    web3: state.web3
  }
}

const mapDispatchToProps = dispatch => {
  return {
    storePayment: (paymentData) => dispatch(storePayment(paymentData)),
    paymentSuccess: (paymentData) => dispatch(paymentSuccess(paymentData)),
    updatePaymentAsSuccessfull: (transactionIndex) => dispatch(updatePaymentAsSuccessfull(transactionIndex))
  }
}

export default drizzleConnect(withStyles(styles)(Payments), mapStateToProps, mapDispatchToProps);
