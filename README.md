# The One PerCent Project

## Description

This project is an experiment in redistributive economics. It sets up a "payment pipe", which allows users to pay accounts or external contracts and in doing so, the pipe retains 1% of the total ether per transaction in a communal pot, passing the rest on to the desire account/contract. In return for making payments through this system a user is rewarded in OPC (One PerCent) tokens.

The pot of money generated by these payments is periodically handed out to charitable and artistic projects as determined by user votes. Anybody is able to submit their project application to receive funding. This can be done via the front-end for a small fee. 

Once a number of applications have been submitted, these applications are then able to be voted on. Each OPC token can then be used to vote for a project. The funding applications with the most votes are then rewarded with an Ether collected via the payment pipe channel.

## Project Structure

The one percent siphon is handled in the `PaymentPipe.sol`, which exposes two primary user facing methods: `payAccountWithOnePercentTax` and `callUntrustedContractWithOnePercentTax`. The user may interact with these in the front-end via the `payments` tab (at `http://localhost:3000/payments`). The payments is set-up to demonstrate the functionality of the contract: the user can either select `PAY RANDOM ACCOUNT`, which pays a randomly generated amount to another account, or the user may select `PAY EXTERNAL CONTRACT` - which pays an example contract a randomly generated amount. (The contract that is used here is `ExternalContractExample.sol` - as it is an example contract and not important to the application there is no need to test this).

One a user has made a successful payment (via meta-mask) they will see this reflected in both the payments page and the `Dashboard` page. The Dashboard displays both data from the blockchain which is persitant in between reloading the application (i.e. total generated amount and the OPC tokens available to an account), as well as data that is generated each session (i.e. total number of payments made and the personally generated amount (since these are not critical to store on the blockchain and instead would in a production environment be saved in a database)).

By making payments the user generates OPC tokens, and these may then be used to vote for applications. The user may also submit applications for funding. This is managed in the front-end on the `Funding` page. In order to submit an application the contract must be open to voting. There are a set of buttons on the Funding page to control the application state - which needs to move always in this order:

open applications -> close applications -> open voting -> close voting -> open applications -> ...

In order to modify the state the user must be the CEO account associated with the Funding application (i.e. you will have to have logged in to metamask as accounts[0] as output by ganache-cli).

The funding page also shows the current state of the contract (whether it is open or closed to voting and application submissions).

Once applications are open, the user may then submit an application. Please note that the form to do this is still under development - but the user may input nothing and simply click the `SUBMIT APPLICATION` button at the bottom of the page. Once the application is submitted it should appear on the same page. Once voting opens (you will need to first close applications **and then** open voting), you will be able to use your OPC tokens to vote an application. **Please note** that you will need to first approve the use of your OPC tokens by the Application contract. Use the approval button first, followed by the vote button. Once you are done voting (you may submit and then vote for multiple applications), you can then close voting and the application with the most submissions will be reimbursed the ether in the payment pipe.

## Set- up, Dependencies and Running

To run this project you will need to have installed

1) node
2) npm
3) ganache-cli
4) truffle

To interact with the project via the front-end you will need 

4) metamask

You will also need to download yarn **before** you install. This is because the yarn.lock file is used to manage the dependencies that the project relies on. You can use npm to install yarn like so:

```bash
npm i -g yarn
```

First make sure that ganache-cli is running on port 8545 by running the following in a terminal:

```bash
ganache-cli
```

In a separate terminal, you may now use truffle to run the tests

```bash
truffle test
```

It is important that you first compile and migrate the contracts using truffle. This populates the build folder, and these json files are needed before you can build the front-end. In order to do this, run the following commands in a terminal:

```bash
truffle compile --all
truffle migrate --reset
```

In order to run the front-end application the node modules need to be installed and then the server started:

``` bash
git clone https://github.com/bertiespell/onepercent-project.git
cd onepercent-project
yarn install
yarn start
```

If you encounter compilation errors here first check that you have run the truffle commands above (the compiled code relies upon the output of the truffle compile command (for the contract ABI)).

You will need to make sure that metamask is configured to run on port 8545 (to match the where the blockchain is being hosted by ganache-cli):

Open metamask and select 8545, if it is not there you will need to set up a custom RPC.

If you want to have ether to spend on the application you will also need to sign into metamask with one of the accounts generated by ganache-cli. This can be done by using the private key immediately output when running `ganache-cli` in the terminal:

Go to metamask, select "Import account", and then copy and paste the private key from ganache-cli into this. (Alternatively, if you have not logged in to metamask, you can use the seed phrase generated by ganache-cli to log in to metamask)

It is recommended that for testing you use the first account (i.e. account[0]), as this account has special priviledges due to the deployment of the contracts - it controls the `FundingApplication.sol` and whether it is open to applications and/or voting.

Now you can navigate to: http://localhost:3000/

### General User Flow / Marking

It is recommended to follow the following flow:

1) Make a Payment via the payments tab (observe metamask interaction and the effects on ganache-cli)
   **Here you will see the address of the current account in the payments tab, as well as the address it is sending to**
2) Return to the Dashboard (observe the data is updated from the blockchain)
3) Go to the Funding tab
4) Select open applications (observe metamask interaction and the effects on ganache-cli)
5) Select submit application (observe metamask interaction and the effects on ganache-cli)
6) Close applications
7) Open voting
8) Approve tokens
9) Vote for application
10) Close voting

## Debugging

If you encounter problems when running the application it may be necessary to ensure that your metamask account is synced with ganache-cli. If there are errors in the console try the following steps in order:

1) Reset ganache-cli - check it is running on port 8545
2) Check that the contracts are compiled and migrated onto the blockchain:

    ```bash
    truffle compile --all
    truffle migrate --reset
    ```
3) Check that metamask is running with port 8545

4) Check that you are using the correct account as output by ganache-cli:
    - When ganache-cli starts copy the **first private key** it outputs
    - Go to metamask and select import account - use this private key

5) Reset your metamask accout
    -> Go to metamask, select settings and then "reset account'.

6) Restart the development server

    ```bash
    yarn start
    ```
