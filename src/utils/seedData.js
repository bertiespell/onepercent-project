import Web3 from 'web3';

const seedData = async (drizzle, activeAccount) => {
  // loop over available accounts from web3 and initiate transactions with them
  const accounts = await new Web3(new Web3.providers.HttpProvider('http://localhost:7545')).eth.getAccounts();
  console.log(accounts);
  accounts.forEach( async (account) => {
    if (account != activeAccount) {
      // await drizzle.contracts.PaymentPipe.methods.payAccountWithOnePercentTax(account).send({from: activeAccount, value: drizzle.web3.utils.toWei("10.0", "ether"), gasPrice: 0});
    }
  })

  await drizzle.contracts.PaymentPipe.methods.payAccountWithOnePercentTax(accounts[5]).send({from: activeAccount, value: drizzle.web3.utils.toWei("10.0", "ether"), gasPrice: 0});

}

export default seedData;
