var PaymentPipe = artifacts.require('PaymentPipe');
var ExternalContractExample = artifacts.require('ExternalContractExample');
var OPCToken = artifacts.require("OPCToken");

contract('Access Control', function(accounts) {

    const owner = accounts[0];
    const alice = accounts[1];
    const bob = accounts[2];

    beforeEach(async () => {
        opcToken = await OPCToken.new();
        paymentPipe = await PaymentPipe.new(opcToken.address);
    });
    it("should be able to set the CEO on payment pipe", async () => {
        await paymentPipe.setCEO(accounts[2], {from: owner});
        assert.equal(await paymentPipe.ceoAddress(), accounts[2])
    });
    it("should be able to set the COO on payment pipe", async () => {
        await paymentPipe.setCOO(accounts[3], {from: owner});
        assert.equal(await paymentPipe.cooAddress(), accounts[3])
    });
    it("should be able to set the CFO on payment pipe", async () => {
        await paymentPipe.setCFO(accounts[4], {from: owner});
        assert.equal(await paymentPipe.cfoAddress(), accounts[4])
    });
    it("any c level account should be able to pause the contract", async () => {
        await paymentPipe.setCEO(accounts[1], {from: owner});
        await paymentPipe.setCOO(accounts[2], {from: accounts[1]});
        await paymentPipe.setCFO(accounts[3], {from: accounts[1]});
        assert.equal(await paymentPipe.paused(), false)

        // the CEO should be able to pause
        await paymentPipe.pause({from: accounts[1]});
        assert.equal(await paymentPipe.paused(), true)
        await paymentPipe.unpause({from: accounts[1]});
        assert.equal(await paymentPipe.paused(), false)

        // the COO should be able to pause
        await paymentPipe.pause({from: accounts[2]});
        assert.equal(await paymentPipe.paused(), true)
        await paymentPipe.unpause({from: accounts[1]});
        assert.equal(await paymentPipe.paused(), false)

        // the CFO should be able to pause
        await paymentPipe.pause({from: accounts[3]});
        assert.equal(await paymentPipe.paused(), true)
        await paymentPipe.unpause({from: accounts[1]});
        assert.equal(await paymentPipe.paused(), false)
    });
    it('only CEO can unpause the contract', async () => {
        await paymentPipe.setCEO(accounts[1], {from: owner});
        await paymentPipe.setCOO(accounts[2], {from: accounts[1]});
        await paymentPipe.setCFO(accounts[3], {from: accounts[1]});
        assert.equal(await paymentPipe.paused(), false)

        // the COO should not be able to pause
        await paymentPipe.pause({from: accounts[2]});
        assert.equal(await paymentPipe.paused(), true)

        try {
            await paymentPipe.unpause({from: accounts[2]});
        } catch (e) {
            // catches that the VM rejected
        }
        assert.equal(await paymentPipe.paused(), true)

        await paymentPipe.unpause({from: accounts[1]});
        assert.equal(await paymentPipe.paused(), false);

        // the COO should not be able to pause
        await paymentPipe.pause({from: accounts[3]});
        assert.equal(await paymentPipe.paused(), true)
        try {
            await paymentPipe.unpause({from: accounts[3]});
        } catch (e) {
            // catches that the VM rejected
        }
        assert.equal(await paymentPipe.paused(), true)
    })
});
