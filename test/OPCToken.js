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
    it("any C level address can open the contract for applications", async () => {
        assert.equal(await opcToken.open(), false);

        await opcToken.openApplications({from: owner});
        assert.equal(await opcToken.open(), true);
    });
    it("any C level address can close the contract for applications", async () => {
        assert.equal(await opcToken.open(), false);

        await opcToken.openApplications({from: owner});
        assert.equal(await opcToken.open(), true);

        await opcToken.closeFunding({from: owner});
        assert.equal(await opcToken.open(), false);
    });
    it("should prevent other accounts from opening and closing applications", async () => {
        assert.equal(await opcToken.open(), false);

        await opcToken.openApplications({from: owner});
        assert.equal(await opcToken.open(), true);

        await opcToken.closeFunding({from: owner});
        assert.equal(await opcToken.open(), false);

        try {
            await opcToken.openApplications({from: accounts[3]});
        } catch (e) {

        }
        assert.equal(await opcToken.open(), false);
    });
    it("the entire total supply should begin with the owner", async () => {
        const ownerBalance = await opcToken.balanceOf(accounts[0]);
        const bigNumber = web3.fromWei(ownerBalance.toNumber(), "ether" )
        assert.equal(bigNumber, 1000000);
    })
    it("should increase a users token allowance after a payment", async () => {
        const balance = await opcToken.balanceOf(alice)
        assert.equal(balance.toNumber(), 0);
        await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, gasPrice: 0});
        const newBalance = await opcToken.balanceOf(alice)
        assert.equal(newBalance.toNumber(), 1);        
    });
    it("should increase a users token allowance after a payment made to an external contract", async () => {
        const balance = await opcToken.balanceOf(alice)
        assert.equal(balance.toNumber(), 0);
        const externalAccount = await ExternalContractExample.deployed();
       
        await paymentPipe.callExternalContractWithOnePercentTax(externalAccount.address, "paymentExample()", {from: alice, value: web3.toWei(1, "ether"), gasPrice: 0});
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
    })
});
