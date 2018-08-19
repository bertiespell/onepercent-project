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
        await paymentPipe.setFundingApplicationAddress(fundingApplication.address, {from: accounts[0], gasPrice: 0});
    });

    it("the applications submission account should be the account that the application was made from", async () => {
        await fundingApplication.openApplications({from: accounts[0]});

        await fundingApplication.submitApplication(
            "test application", 
            "this is a test application requiring ", 
            {
                from: accounts[7],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        application = await fundingApplication.proposals(0);
        const applicationInstance = Application.at(application[1]);

        const submissionAddress = await applicationInstance.submissionAddress();

        assert.equal(submissionAddress, accounts[7]);
    });
    it("any account should be able to spend OPC tokens voting for a proposal - when voting is open", async () => {
        await fundingApplication.openApplications({from: accounts[0]});

        await fundingApplication.submitApplication(
            "test application", 
            "this is a test application requiring ", 
            {
                from: accounts[2],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        await fundingApplication.closeApplications({from: accounts[0]});
        await fundingApplication.openVoting({from: accounts[0]});

        application = await fundingApplication.proposals(0);
        const applicationInstance = Application.at(application[1]);

        const aliceBalance = await opcToken.balanceOf(alice)
        assert.equal(aliceBalance.toNumber(), 0);
        const paymentPipeBalance = await opcToken.balanceOf(paymentPipe.address)
        assert.equal(paymentPipeBalance.toNumber(), 1000);

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: web3.toWei(1, "ether"), gasPrice: 0});
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
            {
                from: accounts[2],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        await fundingApplication.closeApplications({from: accounts[0]});
        await fundingApplication.openVoting({from: accounts[0]});

        application = await fundingApplication.proposals(0);
        const applicationInstance = Application.at(application[1]);

        const votesBefore = await applicationInstance.voteCount();
        assert.equal(votesBefore.toNumber(), 0);

        const aliceBalance = await opcToken.balanceOf(alice)
        assert.equal(aliceBalance.toNumber(), 0);
        const paymentPipeBalance = await opcToken.balanceOf(paymentPipe.address)
        assert.equal(paymentPipeBalance.toNumber(), 1000);

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: web3.toWei(1, "ether"), gasPrice: 0});

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: web3.toWei(1, "ether"), gasPrice: 0});
        const aliceNewBalance = await opcToken.balanceOf(alice)
        assert.equal(aliceNewBalance.toNumber(), 2);  
        const paymentPipeNewBalance = await opcToken.balanceOf(paymentPipe.address)
        assert.equal(paymentPipeNewBalance.toNumber(), 998);
        
        // now Alice has funds - she should be able to cast multiple votes
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
        await fundingApplication.openApplications({from: accounts[0]});

        await fundingApplication.submitApplication(
            "test application", 
            "this is a test application requiring ", 
            {
                from: accounts[2],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        await fundingApplication.closeApplications({from: accounts[0]});
        await fundingApplication.openVoting({from: accounts[0]});

        application = await fundingApplication.proposals(0);
        const applicationInstance = Application.at(application[1]);

        const aliceBalance = await opcToken.balanceOf(alice)
        assert.equal(aliceBalance.toNumber(), 0);
        const paymentPipeBalance = await opcToken.balanceOf(paymentPipe.address)
        assert.equal(paymentPipeBalance.toNumber(), 1000);

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: web3.toWei(1, "ether"), gasPrice: 0});
        const aliceNewBalance = await opcToken.balanceOf(alice)
        assert.equal(aliceNewBalance.toNumber(), 1);  
        const paymentPipeNewBalance = await opcToken.balanceOf(paymentPipe.address)
        assert.equal(paymentPipeNewBalance.toNumber(), 999);
        
        const votes = await applicationInstance.voteCount();
        await fundingApplication.closeVoting({from: accounts[0]});

        let error;
        try {
            await opcToken.approve(applicationInstance.address, 1, {from: alice, gasPrice: 0})
            await applicationInstance.voteForApplication(1, {from: alice, gasPrice: 0})
        } catch (e) {
            error = e;
        }

        assert.equal(votes.toNumber(), 0);
        assert.notEqual(error, undefined);
        const aliceBalanceAfterVote = await opcToken.balanceOf(alice)
        assert.equal(aliceBalanceAfterVote.toNumber(), 1);  
        const paymentPipeBalanceAfterVote = await opcToken.balanceOf(paymentPipe.address);
        assert.equal(paymentPipeBalanceAfterVote.toNumber(), 999);
    });
    it("no accounts other than the funding application should be able to call kill", async () => {
        await fundingApplication.openApplications({from: accounts[0]});

        await fundingApplication.submitApplication(
            "test application", 
            "this is a test application requiring ", 
            {
                from: accounts[2],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        await fundingApplication.closeApplications({from: accounts[0]});
        await fundingApplication.openVoting({from: accounts[0]});

        application = await fundingApplication.proposals(0);
        const applicationInstance = Application.at(application[1]);

        let error1 = false;
        try {
            await applicationInstance.kill({from: accounts[0]});
        } catch (e) {
            error1 = true;
        }

        assert.equal(error1, true);

        let error3 = false;
        try {
            await applicationInstance.kill({from: accounts[0]});
        } catch (e) {
            error3 = true;
        }

        assert.equal(error3, true);

        let error4 = false;
        try {
            await applicationInstance.kill({from: accounts[0]});
        } catch (e) {
            error4 = true;
        }

        assert.equal(error4, true);

        await fundingApplication.closeVoting({from: accounts[0]});
        
        let error5 = false;
        
        applicationAfterKill = await fundingApplication.proposals(0);
        const applicationInstanceAfterKill = Application.at(applicationAfterKill[1]);
        
        try {
            await applicationInstanceAfterKill.voteCount();
        } catch (e) {
            error5 = true;
        }
        assert.equal(error5, true);
    });
});
