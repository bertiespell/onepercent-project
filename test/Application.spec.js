var FundingApplications = artifacts.require("FundingApplications");
var Application = artifacts.require("Application");
var OPCToken = artifacts.require("OPCToken");
var PaymentPipe = artifacts.require('PaymentPipe');

contract('Application', function(accounts) {

    const owner = accounts[0];
    const alice = accounts[1];
    const bob = accounts[2];

    let fundingApplication;
    beforeEach(async () => {
        opcToken = await OPCToken.new();
        paymentPipe = await PaymentPipe.new(opcToken.address);
  
        await opcToken.approve(owner, 1000)
        await opcToken.transferFrom(owner, paymentPipe.address, 1000);

        fundingApplication = await FundingApplications.new(paymentPipe.address, opcToken.address);
    });

    it("the applications submission account should be the account that the application was made from", async () => {

    });

    it("any account should be able to spend OPC tokens voting for a proposal - when voting is open", async () => {
        await fundingApplication.openApplications({from: accounts[0]});

        await fundingApplication.submitApplication(
            "test application", 
            "this is a test application requiring ", 
            5,
            {
                from: accounts[2],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        application = await fundingApplication.proposals(0);
        const applicationInstance = Application.at(application[1]);

        const aliceBalance = await opcToken.balanceOf(alice)
        assert.equal(aliceBalance.toNumber(), 0);
        const paymentPipeBalance = await opcToken.balanceOf(paymentPipe.address)
        assert.equal(paymentPipeBalance.toNumber(), 1000);

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, gasPrice: 0});
        const aliceNewBalance = await opcToken.balanceOf(alice)
        assert.equal(aliceNewBalance.toNumber(), 1);  
        const paymentPipeNewBalance = await opcToken.balanceOf(paymentPipe.address)
        assert.equal(paymentPipeNewBalance.toNumber(), 999);
        
        // now Alice has funds - she should be able to cast a vote
        await opcToken.approve(applicationInstance.address, 1, {from: alice, gasPrice: 0})
        await applicationInstance.voteForApplication(1, {from: alice, gasPrice: 0})

        const votes = await applicationInstance.voteCount();
        assert.equal(votes, 1);

        // then we should see alice again has 0 balance
        // payment pipe has increased again
        const aliceBalanceAfterVote = await opcToken.balanceOf(alice)
        assert.equal(aliceBalanceAfterVote.toNumber(), 0);  
        const paymentPipeBalanceAfterVote = await opcToken.balanceOf(paymentPipe.address)
        assert.equal(paymentPipeBalanceAfterVote.toNumber(), 1000);
    });
    it("an account should be able to use multiple tokens", async () => {
        await fundingApplication.openApplications({from: accounts[0]});

        await fundingApplication.submitApplication(
            "test application", 
            "this is a test application requiring ", 
            5,
            {
                from: accounts[2],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        application = await fundingApplication.proposals(0);
        const applicationInstance = Application.at(application[1]);

        const votesBefore = await applicationInstance.voteCount();
        assert.equal(votesBefore.toNumber(), 0);

        const aliceBalance = await opcToken.balanceOf(alice)
        assert.equal(aliceBalance.toNumber(), 0);
        const paymentPipeBalance = await opcToken.balanceOf(paymentPipe.address)
        assert.equal(paymentPipeBalance.toNumber(), 1000);

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, gasPrice: 0});

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, gasPrice: 0});
        const aliceNewBalance = await opcToken.balanceOf(alice)
        assert.equal(aliceNewBalance.toNumber(), 2);  
        const paymentPipeNewBalance = await opcToken.balanceOf(paymentPipe.address)
        assert.equal(paymentPipeNewBalance.toNumber(), 998);
        
        // now Alice has funds - she should be able to cast a vote
        await opcToken.approve(applicationInstance.address, 2, {from: alice, gasPrice: 0})
        await applicationInstance.voteForApplication(2, {from: alice, gasPrice: 0})

        const votes = await applicationInstance.voteCount();
        assert.equal(votes.toNumber(), 2);

        // then we should see alice again has 0 balance
        // payment pipe has increased again
        const aliceBalanceAfterVote = await opcToken.balanceOf(alice)
        assert.equal(aliceBalanceAfterVote.toNumber(), 0);  
        const paymentPipeBalanceAfterVote = await opcToken.balanceOf(paymentPipe.address)
        assert.equal(paymentPipeBalanceAfterVote.toNumber(), 1000);
        
    });
    it("when voting closes - users should no longer be able to submit votes", async () => {
    
    });
});
