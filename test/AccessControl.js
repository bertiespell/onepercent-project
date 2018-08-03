var PaymentPipe = artifacts.require('PaymentPipe');
var ExternalContractExample = artifacts.require('ExternalContractExample');

contract('PaymentPipe', function(accounts) {

    const owner = accounts[0];
    const alice = accounts[1];
    const bob = accounts[2];

    it("should be able to set the CEO on payment pipe", async () => {
        const paymentPipe = await PaymentPipe.deployed();

        await paymentPipe.setCEO(bob, {from: owner});
        assert.equal(await paymentPipe.ceoAddress(), bob)
    });
});
