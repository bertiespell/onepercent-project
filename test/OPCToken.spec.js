var OPCToken = artifacts.require("OPCToken");
var PaymentPipe = artifacts.require('PaymentPipe');
var ExternalContractExample = artifacts.require('ExternalContractExample');

contract('OPCToken', function(accounts) {

    const owner = accounts[0];
    // Deploys a new contract for each test
    let opcToken;
    let paymentPipe;
    const alice = accounts[1];
    const bob = accounts[2];

    beforeEach(async () => {
        opcToken = await OPCToken.new();
        paymentPipe = await PaymentPipe.new(opcToken.address);

        await opcToken.approve(owner, 1000)
        await opcToken.transferFrom(owner, paymentPipe.address, 1000);
    });
    it("the entire total supply should begin with the owner", async () => {
        const ownerBalance = await opcToken.balanceOf(accounts[0]);
        const bigNumber = web3.fromWei(ownerBalance.toNumber(), "ether" )
        assert.equal(bigNumber, 1000000);
    })
    it("should increase a users token allowance after a payment", async () => {
        const balance = await opcToken.balanceOf(alice)
        assert.equal(balance.toNumber(), 0);
        await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: web3.toWei(1, "ether"), gasPrice: 0});
        const newBalance = await opcToken.balanceOf(alice)
        assert.equal(newBalance.toNumber(), 1);        
    });
    it("should increase a users token allowance after a payment made to an external contract", async () => {
        const balance = await opcToken.balanceOf(alice)
        assert.equal(balance.toNumber(), 0);
        const externalAccount = await ExternalContractExample.deployed();
       
        await paymentPipe.callUntrustedContractWithOnePercentTax(externalAccount.address, "paymentExample()", {from: alice, value: web3.toWei(1, "ether"), gasPrice: 0});
        const newBalance = await opcToken.balanceOf(alice)
        assert.equal(newBalance.toNumber(), 1);        
    });
    it("should be able to call methods from inherited classes", async () => {
        const balance = await opcToken.balanceOf(alice);
        assert.equal(balance.toNumber(), 0);
        await opcToken.approve(owner, 1)
        await opcToken.transferFrom(owner, alice, 1);
        const newBalance = await opcToken.balanceOf(alice)
        assert.notEqual(newBalance.toNumber(), 0);
        assert.equal(newBalance.toNumber(), 1);
    });
    it("C level accounts should be able to kill the contract", async () => {
        await opcToken.kill({from: accounts[0], gasPrice: 0});
        let error = false;
        try {
            await opcToken.name();
        } catch (e) {
            error = true;
        }
        assert.equal(error, true);
    });
    it("outside accounts should not be able to kill the contract", async () => {
        let error = false;
        try {
            await opcToken.kill({from: accounts[6], gasPrice: 0});
        } catch (e) {
            error = true;
        }
        assert.equal(error, true);
    });
});
