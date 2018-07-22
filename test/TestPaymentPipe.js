var PaymentPipe = artifacts.require('PaymentPipe');
var ExternalContractExample = artifacts.require('ExternalContractExample');

contract('PaymentPipe', function(accounts) {

    const owner = accounts[0];
    const alice = accounts[1];
    const bob = accounts[2];
    const emptyAddress = '0x0000000000000000000000000000000000000000';

    let value = web3.toWei(10, "ether");

    it("should transfer money to external account", async() => {
        const paymentPipe = await PaymentPipe.deployed();

        var aliceBalanceBefore = await web3.eth.getBalance(alice).toNumber();
        var bobBalanceBefore = await web3.eth.getBalance(bob).toNumber();

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: value, gasPrice: 0});

        var aliceBalanceAfter = await web3.eth.getBalance(alice).toNumber();
        var bobBalanceAfter = await web3.eth.getBalance(bob).toNumber();

        assert.equal(aliceBalanceAfter, aliceBalanceBefore - value, `Alice's balance should reduce by ${value}`);
        assert.equal(bobBalanceAfter, bobBalanceBefore + ((value - (value/100))), `Bob's balance should increase by ${value}`);
    });

    it("should increase the ether in the payment pipe contract after call to pay external account", async () => {
      const paymentPipe = await PaymentPipe.deployed();

      var paymentPipeValueBefore = await web3.eth.getBalance(paymentPipe.address).toNumber();

      await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: value, gasPrice: 0});

      var paymentPipeValueAfter = await web3.eth.getBalance(paymentPipe.address).toNumber();

      assert.equal(paymentPipeValueAfter, paymentPipeValueBefore + (value/100));
    });

    it("should pay an external contract, which is itself payable", async () => {
      value = web3.toWei(5, "ether");
      const paymentPipe = await PaymentPipe.deployed();
      const externalAccount = await ExternalContractExample.deployed();
      var aliceBalanceBefore = await web3.eth.getBalance(alice).toNumber();
      var externalAccountBalanceBefore = await web3.eth.getBalance(externalAccount.address).toNumber();

      await paymentPipe.callExternalContractWithOnePercentTax(externalAccount.address, "paymentExample()", {from: alice, value: value, gasPrice: 0});
      var externalAccountBalanceAfter = await web3.eth.getBalance(externalAccount.address).toNumber();
      var aliceBalanceAfter = await web3.eth.getBalance(alice).toNumber();
      assert.equal(externalAccountBalanceAfter, externalAccountBalanceBefore + (value - (value/100)), `The balance of the external account should increase by ${value}`);
    });

    it("should increase the ether in the payment pipe contract after call to pay external contract", async () => {
      const paymentPipe = await PaymentPipe.deployed();
      const externalAccount = await ExternalContractExample.deployed();

      var paymentPipeValueBefore = await web3.eth.getBalance(paymentPipe.address).toNumber();

      await paymentPipe.callExternalContractWithOnePercentTax(externalAccount.address, "paymentExample()", {from: alice, value: value, gasPrice: 0});

      var paymentPipeValueAfter = await web3.eth.getBalance(paymentPipe.address).toNumber();

      assert.equal(paymentPipeValueAfter, paymentPipeValueBefore + (value/100));
    });
});
