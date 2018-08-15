var OPCToken = artifacts.require("OPCToken");
var PaymentPipe = artifacts.require('PaymentPipe');

contract('OPCToken', function(accounts) {

    const owner = accounts[0];


    // Deploys a new contract for each test
    let opcToken;
    let paymentPipe;
    const alice = accounts[1];
    const bob = accounts[2];

    beforeEach(async () => {
        opcToken = await OPCToken.new();
        paymentPipe = await PaymentPipe.new();
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
    it("address should be able to submit a funding application", async () => {
        // const fundingApplications = await opcToken.fundingApplications();
        // web3.eth.getStorageAt
        // console.log(web3)

        // accounts[0] is owner
        // TODO:!

        console.log('yap', web3.toDecimal(web3.eth.getStorageAt(accounts[0], 1)));
    });
    it("the entire total supply should begin with the owner", async () => {
        const ownerBalance = await opcToken.balanceOf(accounts[0]);
        const bigNumber = web3.fromWei(ownerBalance.toNumber(), "ether" )
        assert.equal(bigNumber, 1000000);
    })
    xit("should increase a users token allowance after a payment", async () => {
        // alice coin balance should be 0

        assert.equal(await opcToken.balanceOf(alice), 0);
        console.log(await opcToken.balanceOf(alice))
        await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, gasPrice: 0});
        // alice coin balance should be 1
        console.log(await opcToken.balanceOf(alice))

        assert.equal(await opcToken.balanceOf(alice), 1);        
    });
});
