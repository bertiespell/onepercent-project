var PaymentPipe = artifacts.require('PaymentPipe');

contract('PaymentPipe', function(accounts) {

    const owner = accounts[0];
    const alice = accounts[1];
    const bob = accounts[2];
    const emptyAddress = '0x0000000000000000000000000000000000000000';

    const value = web3.toWei(10, "ether");

    it("should transfer money to external account", async() => {
        const paymentPipe = await PaymentPipe.deployed();

        var aliceBalanceBefore = await web3.eth.getBalance(alice).toNumber();
        var bobBalanceBefore = await web3.eth.getBalance(bob).toNumber();
        // TODO: Test the contract balance has received the 1%
        var paymentPipeValueBefore = paymentPipe.balance;

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: value, gasPrice: 0});

        var aliceBalanceAfter = await web3.eth.getBalance(alice).toNumber();
        var bobBalanceAfter = await web3.eth.getBalance(bob).toNumber();
        var paymentPipeValueAfter = (await paymentPipe.getTotalFunds()).toNumber();
        // var paymentAfterInWei = web3.fromWei(paymentPipeValueAfter.toNumber(), "ether" );

        // assert.equal(paymentPipeValueBefore, paymentPipeValueAfter + (value/100));
        assert.equal(aliceBalanceAfter, aliceBalanceBefore - value, `Alice's balance should reduce by ${value}`);
        assert.equal(bobBalanceAfter, bobBalanceBefore + ((value - (value/100))), `Bob's balance should reduce by ${value}`);

    });
});
