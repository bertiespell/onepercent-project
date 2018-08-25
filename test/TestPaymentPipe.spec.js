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

      await paymentPipe.callUntrustedContractWithOnePercentTax(externalAccount.address, "paymentExample()", {from: alice, value: value, gasPrice: 0});
      var externalAccountBalanceAfter = await web3.eth.getBalance(externalAccount.address).toNumber();
      var aliceBalanceAfter = await web3.eth.getBalance(alice).toNumber();
      assert.equal(externalAccountBalanceAfter, externalAccountBalanceBefore + (value - (value/100)), `The balance of the external account should increase by ${value}`);
    });
    it("should not give out OPC tokens when no ether is sent to payAccountWithOnePercentTax", async () => {
      const aliceBalance = await opcToken.balanceOf(alice);
      assert.equal(aliceBalance.toNumber(), 0);
      const paymentPipeBalance = await opcToken.balanceOf(paymentPipe.address)
      assert.equal(paymentPipeBalance.toNumber(), 1000);

      await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, gasPrice: 0});

      await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, gasPrice: 0});
      const aliceNewBalance = await opcToken.balanceOf(alice)
      assert.equal(aliceNewBalance.toNumber(), 0);  
      const paymentPipeNewBalance = await opcToken.balanceOf(paymentPipe.address)
      assert.equal(paymentPipeNewBalance.toNumber(), paymentPipeBalance);
    });
    it("should not give out OPC tokens when no ether is sent to callUntrustedContractWithOnePercentTax", async () => {
      const externalAccount = await ExternalContractExample.deployed();

      const aliceBalance = await opcToken.balanceOf(alice);
      assert.equal(aliceBalance.toNumber(), 0);
      const paymentPipeBalance = await opcToken.balanceOf(paymentPipe.address)
      assert.equal(paymentPipeBalance.toNumber(), 1000);

      await paymentPipe.callUntrustedContractWithOnePercentTax(externalAccount.address, "paymentExample()", {from: alice, gasPrice: 0});

      await paymentPipe.callUntrustedContractWithOnePercentTax(externalAccount.address, "paymentExample()", {from: alice, gasPrice: 0});

      const aliceNewBalance = await opcToken.balanceOf(alice)
      assert.equal(aliceNewBalance.toNumber(), aliceBalance);  
      const paymentPipeNewBalance = await opcToken.balanceOf(paymentPipe.address)
      assert.equal(paymentPipeNewBalance.toNumber(), paymentPipeBalance);
    });
    it("should increase the ether in the payment pipe contract after call to pay external contract", async () => {
      const externalAccount = await ExternalContractExample.deployed();

      var paymentPipeValueBefore = await web3.eth.getBalance(paymentPipe.address).toNumber();

      await paymentPipe.callUntrustedContractWithOnePercentTax(externalAccount.address, "paymentExample()", {from: alice, value: value, gasPrice: 0});

      var paymentPipeValueAfter = await web3.eth.getBalance(paymentPipe.address).toNumber();

      assert.equal(paymentPipeValueAfter, paymentPipeValueBefore + (value/100));
    });
    it("only C level accounts can set new minimum payment amounts", async () => {
      await paymentPipe.setNewMinimumPayment(400000000, {from: accounts[0], gasPrice: 0});
      const newPaymentAmount = await paymentPipe.minimumPayment();
      assert.equal(newPaymentAmount, 400000000);
      try {
        await paymentPipe.setNewMinimumPayment(200000000, {from: accounts[7], gasPrice: 0});
      } catch (e) {

      }
      const newPaymentAmount2 = await paymentPipe.minimumPayment();

      assert.equal(newPaymentAmount2, 400000000);
    });
    it("only C level accounts should be able to set the fundingApplication address", async () => {
      let error = false;
      try {
        await paymentPipe.setFundingApplicationAddress(fundingApplication.address, {from: accounts[7], gasPrice: 0});
      } catch (e) {
        error = true;
      }
      assert.equal(error, true);
    })
    it("only the funding application address should be able to call payWinner", async () => {
      await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: value, gasPrice: 0});

      await paymentPipe.setFundingApplicationAddress(accounts[7], {from: accounts[0], gasPrice: 0});

      await paymentPipe.payWinner(accounts[4], {from: accounts[7]});

      // need to put more funds in to avoid the no funds exception
      await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: value, gasPrice: 0});

      let error = false;
      try {
        await paymentPipe.payWinner(accounts[4], {from: accounts[3]});
      } catch (e) {
        error = true;
      }

      assert.equal(error, true);
    });
    it("only the funding application address should be able to call payWinners", async () => {
      await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: value, gasPrice: 0});

      await paymentPipe.setFundingApplicationAddress(accounts[7], {from: accounts[0], gasPrice: 0});

      await paymentPipe.setMultipleWinners(accounts[4], {from: accounts[7]});

      await paymentPipe.payWinners({from: accounts[7]});

      // need to put more funds in to avoid the no funds exception
      await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: value, gasPrice: 0});

      let error = false;
      try {
        await paymentPipe.payWinners({from: accounts[3]});
      } catch (e) {
        error = true;
      }

      assert.equal(error, true);
    });
    it("only the funding application address should be able to call setMultipleWinners", async () => {
      await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: value, gasPrice: 0});

      await paymentPipe.setFundingApplicationAddress(accounts[7], {from: accounts[0], gasPrice: 0});

      await paymentPipe.setMultipleWinners(accounts[4], {from: accounts[7]});

      let error = false;
      try {
        await paymentPipe.setMultipleWinners(accounts[4], {from: accounts[3]});
      } catch (e) {
        error = true;
      }

      assert.equal(error, true);
    });
    it("should not pay winners if the balance is 0", async () => {
      await paymentPipe.setFundingApplicationAddress(accounts[7], {from: accounts[0], gasPrice: 0});

      let error = false;
      try {
        await paymentPipe.payWinners(accounts[4], {from: accounts[7]});
      } catch (e) {
        error = true;
      }

      assert.equal(error, true);
    });
    it("should not be able to pay any winners if none have been set", async () => {
      await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: value, gasPrice: 0});

      await paymentPipe.setFundingApplicationAddress(accounts[7], {from: accounts[0], gasPrice: 0});

      let error = false;
      try {
        await paymentPipe.payWinners({from: accounts[7]});
      } catch (e) {
        error = true;
      }

      assert.equal(error, true);
    })
});
