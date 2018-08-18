var OPCToken = artifacts.require("OPCToken");
var PaymentPipe = artifacts.require('PaymentPipe');
var ExternalContractExample = artifacts.require('ExternalContractExample');

contract('PaymentPipe', function(accounts) {

    const owner = accounts[0];
    const alice = accounts[1];
    const bob = accounts[2];
    const emptyAddress = '0x0000000000000000000000000000000000000000';

    let value = web3.toWei(1, "ether");

    beforeEach(async () => {
      opcToken = await OPCToken.new();
      paymentPipe = await PaymentPipe.new(opcToken.address);

      await opcToken.approve(owner, 1000)
      await opcToken.transferFrom(owner, paymentPipe.address, 1000);
  });
    it("payment pipe ether amount should be accessed via getTotalFunds method", async () => {

      await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: value, gasPrice: 0});

      var paymentPipeFundValue = await paymentPipe.getTotalFunds.call();

      const balance = await paymentPipeFundValue.toNumber();

      assert.equal(balance, value/100);
    });

    it("should transfer money to external account", async() => {

        var aliceBalanceBefore = await web3.eth.getBalance(alice).toNumber();
        var bobBalanceBefore = await web3.eth.getBalance(bob).toNumber();

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: value, gasPrice: 0});

        var aliceBalanceAfter = await web3.eth.getBalance(alice).toNumber();
        var bobBalanceAfter = await web3.eth.getBalance(bob).toNumber();

        assert.equal(aliceBalanceAfter, aliceBalanceBefore - value, `Alice's balance should reduce by ${value}`);
        assert.equal(bobBalanceAfter, bobBalanceBefore + ((value - (value/100))), `Bob's balance should increase by ${value}`);
    });

    it("should increase the ether in the payment pipe contract after call to pay external account", async () => {

      var paymentPipeValueBefore = await web3.eth.getBalance(paymentPipe.address).toNumber();

      await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: value, gasPrice: 0});

      var paymentPipeValueAfter = await web3.eth.getBalance(paymentPipe.address).toNumber();

      assert.equal(paymentPipeValueAfter, paymentPipeValueBefore + (value/100));
    });

    it("should pay an external contract, which is itself payable", async () => {
      const externalAccount = await ExternalContractExample.deployed();
      var aliceBalanceBefore = await web3.eth.getBalance(alice).toNumber();
      var externalAccountBalanceBefore = await web3.eth.getBalance(externalAccount.address).toNumber();

      await paymentPipe.callExternalContractWithOnePercentTax(externalAccount.address, "paymentExample()", {from: alice, value: value, gasPrice: 0});
      var externalAccountBalanceAfter = await web3.eth.getBalance(externalAccount.address).toNumber();
      var aliceBalanceAfter = await web3.eth.getBalance(alice).toNumber();
      assert.equal(externalAccountBalanceAfter, externalAccountBalanceBefore + (value - (value/100)), `The balance of the external account should increase by ${value}`);
    });

    it("should not give out OPC tokens when no ether is sent", async () => {

    });
    it("should increase the ether in the payment pipe contract after call to pay external contract", async () => {
      const externalAccount = await ExternalContractExample.deployed();

      var paymentPipeValueBefore = await web3.eth.getBalance(paymentPipe.address).toNumber();

      await paymentPipe.callExternalContractWithOnePercentTax(externalAccount.address, "paymentExample()", {from: alice, value: value, gasPrice: 0});

      var paymentPipeValueAfter = await web3.eth.getBalance(paymentPipe.address).toNumber();

      assert.equal(paymentPipeValueAfter, paymentPipeValueBefore + (value/100));
    });
});
