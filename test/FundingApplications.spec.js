var FundingApplications = artifacts.require("FundingApplications");
var Application = artifacts.require("Application");
var OPCToken = artifacts.require("OPCToken");
var PaymentPipe = artifacts.require('PaymentPipe');

contract('FundingApplications', function(accounts) {

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
    it("an account should be able to submit a funding proposal when the contract is open for applications", async () => {
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

        let error, proposal;
        try {
            proposal = await fundingApplication.proposals(0);
        } catch (e) {
            error = e;
        }
        assert.equal(error, undefined);
        assert.notEqual(proposal, undefined);
    });
    it("multiple accounts should be able to submit a funding proposal when the contract is open for applications", async () => {
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

        let error, proposal;
        try {
            proposal = await fundingApplication.proposals(0);
        } catch (e) {
            error = e;
        }
        assert.equal(error, undefined);
        assert.notEqual(proposal, undefined);

        await fundingApplication.submitApplication(
            "test application", 
            "this is a test application requiring ", 
            {
                from: accounts[3],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        let error2, proposal2;
        try {
            proposal2 = await fundingApplication.proposals(1);
        } catch (e) {
            error2 = e;
        }
        assert.equal(error2, undefined);
        assert.notEqual(proposal2, undefined);
        assert.notEqual(proposal, proposal2);

    });
    it("should not create an application if the application fee is not met", async () => {

        await fundingApplication.openApplications({from: accounts[0]});

        let error, proposal;
        try {
            proposal = await fundingApplication.submitApplication(
                "test application", 
                "this is a test application requiring ", 
                5,
                {
                    from: accounts[2],
                    value: web3.toWei(0.002, "ether"), 
                    gasPrice: 0
    
                }
            );
        } catch (e) {
            error = e;
        }
        assert.equal(proposal, undefined);
        assert.notEqual(error, undefined);
       
    });
    it("c level accounts should be able to change the application fee", async () => {
        await fundingApplication.openApplications({from: accounts[0]});
        // set new application cost
        await fundingApplication.setApplicationCostInWei(8000000000000000, {from: accounts[0]});

        let error, proposal;
        try {
            // this should be succesful as it meets new cost
            proposal = await fundingApplication.submitApplication(
                "test application", 
                "this is a test application requiring ", 
                {
                    from: accounts[2],
                    value: web3.toWei(1, "ether"), 
                    gasPrice: 0
    
                }
            );
        } catch (e) {
            error = e;
        }

        assert.notEqual(proposal, undefined);
        assert.equal(error, undefined);

        try {
            // this should not be succesful as it does not meet new cost
            proposal = await fundingApplication.submitApplication(
                "test application", 
                "this is a test application requiring ", 
                {
                    from: accounts[2],
                    value: web3.toWei(0.001, "ether"), 
                    gasPrice: 0
    
                }
            );
        } catch (e) {
            error = e;
        }
        assert.notEqual(error, undefined);

    });
    it("other accounts should not be able to change the application fee", async () => {
        await fundingApplication.openApplications({from: accounts[0]});

        let error, newCost;
        try {
            newCost = await fundingApplication.setApplicationCost(20, {from: accounts[5]})
        } catch (e) {
            error = e;
        }
        assert.equal(newCost, undefined);
        assert.notEqual(error, undefined);
    });
    it("an account should not be able to submit a funding proposal when the contract is not open for applications", async () => {

        let error, proposal;
        try {
            proposal = await fundingApplication.submitApplication(
                "test application", 
                "this is a test application requiring ", 
                5,
                {
                    from: accounts[2],
                    value: web3.toWei(0.004, "ether"), 
                    gasPrice: 0
    
                }
            );
        } catch (e) {
            error = e;
        }
        assert.equal(proposal, undefined);
        assert.notEqual(error, undefined)
    });
    it("an account should be able to submit more than one funding proposal", async () => {
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

        let error, proposal;
        try {
            proposal = await fundingApplication.proposals(0);
        } catch (e) {
            error = e;
        }
        assert.equal(error, undefined);
        assert.notEqual(proposal, undefined);

        await fundingApplication.submitApplication(
            "test application", 
            "this is a test application requiring ", 
            {
                from: accounts[2],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        let error2, proposal2;
        try {
            proposal2 = await fundingApplication.proposals(0);
        } catch (e) {
            error2 = e;
        }
        assert.equal(error2, undefined);
        assert.notEqual(proposal2, undefined);
        assert.notEqual(proposal, proposal2);
    });
    it("multiple accounts should be able to submit multiple proposals", async () => {
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

        let error, proposal;
        try {
            proposal = await fundingApplication.proposals(0);
        } catch (e) {
            error = e;
        }
        assert.equal(error, undefined);
        assert.notEqual(proposal, undefined);

        await fundingApplication.submitApplication(
            "test application", 
            "this is a test application requiring ", 
            {
                from: accounts[2],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        let error2, proposal2;
        try {
            proposal2 = await fundingApplication.proposals(0);
        } catch (e) {
            error2 = e;
        }
        assert.equal(error2, undefined);
        assert.notEqual(proposal2, undefined);
        assert.notEqual(proposal, proposal2);

        await fundingApplication.closeApplications({from: accounts[0]});
        await fundingApplication.openApplications({from: accounts[0]});

        await fundingApplication.submitApplication(
            "test application", 
            "this is a test application requiring ", 
            {
                from: accounts[3],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        let error3, proposal3;
        try {
            proposal3 = await fundingApplication.proposals(0);
        } catch (e) {
            error3 = e;
        }
        assert.equal(error3, undefined);
        assert.notEqual(proposal3, undefined);

        await fundingApplication.submitApplication(
            "test application", 
            "this is a test application requiring ", 
            {
                from: accounts[3],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        let error4, proposal4;
        try {
            proposal4 = await fundingApplication.proposals(0);
        } catch (e) {
            error4 = e;
        }
        assert.equal(error4, undefined);
        assert.notEqual(proposal4, undefined);
        assert.notEqual(proposal4, proposal2);
        proposal1 = await fundingApplication.proposals(0);
        proposal2 = await fundingApplication.proposals(1);
        proposal3 = await fundingApplication.proposals(2);
        proposal4 = await fundingApplication.proposals(3);
        let error5;
        try {
            proposal5 = await fundingApplication.proposals(4);
        } catch (e) {
            error5 = e;
        }
        assert.notEqual(proposal1, undefined);
        assert.notEqual(proposal2, undefined);
        assert.notEqual(proposal3, undefined);
        assert.notEqual(proposal4, undefined);
        assert.notEqual(error5, undefined);
        assert.notEqual(proposal1, proposal2);
        assert.notEqual(proposal2, proposal3);
        assert.notEqual(proposal3, proposal4);
        assert.notEqual(proposal4, proposal1);
    });
    it("once applications close, the last set of proposals should be open to be voted on - i.e. voting should be open", async () => {
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

        await fundingApplication.submitApplication(
            "test application2", 
            "this is a test 2222 applicationrequiring ", 
            {
                from: accounts[2],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        application1 = await fundingApplication.proposals(0);
        application2 = await fundingApplication.proposals(1);

        const application1Instance = Application.at(application1[1]);
        const application2Instance = Application.at(application2[1]);

        const firstIsOpenBefore = await application1Instance.isOpenToVote();
        const secondIsOpenBefore = await application2Instance.isOpenToVote();

        assert.equal(firstIsOpenBefore, false);
        assert.equal(secondIsOpenBefore, false);

        await fundingApplication.closeApplications({from: accounts[0]});
        await fundingApplication.openVoting({from: accounts[0]});
        // now these two applications should be open to voting
        const firstIsOpenAfter = await application1Instance.isOpenToVote();
        const secondIsOpenAfter = await application2Instance.isOpenToVote();

        assert.equal(firstIsOpenAfter, true);
        assert.equal(secondIsOpenAfter, true);
    });
    it("multiple rounds of opening (and then closing) applications should reveal fresh applications to vote on", async () => {
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

        await fundingApplication.submitApplication(
            "test application2", 
            "this is a test 2222 applicationrequiring ", 
            {
                from: accounts[2],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        application1 = await fundingApplication.proposals(0);
        application2 = await fundingApplication.proposals(1);

        const application1Instance = Application.at(application1[1]);
        const application2Instance = Application.at(application2[1]);

        const firstIsOpenBefore = await application1Instance.isOpenToVote();
        const secondIsOpenBefore = await application2Instance.isOpenToVote();

        assert.equal(firstIsOpenBefore, false);
        assert.equal(secondIsOpenBefore, false);

        await fundingApplication.closeApplications({from: accounts[0]});
        await fundingApplication.openVoting({from: accounts[0]});
        // now these two applications should be open to voting
        const firstIsOpenAfter = await application1Instance.isOpenToVote();
        const secondIsOpenAfter = await application2Instance.isOpenToVote();

        assert.equal(firstIsOpenAfter, true);
        assert.equal(secondIsOpenAfter, true);

        await fundingApplication.closeVoting({from: accounts[0]});

        /**  SECOND ROUND OF VOTES **/

        await fundingApplication.openApplications({from: accounts[0]});

        await fundingApplication.submitApplication(
            "test application3", 
            "this is a test 3333 application requiring ", 
            {
                from: accounts[2],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        await fundingApplication.submitApplication(
            "test application4", 
            "this is a test 4444 applicationrequiring ", 
            {
                from: accounts[2],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        await fundingApplication.closeApplications({from: accounts[0]});
        await fundingApplication.openVoting({from: accounts[0]});

        application3 = await fundingApplication.proposals(2);
        application4 = await fundingApplication.proposals(3);

        const application3Instance = Application.at(application3[1]);
        const application4Instance = Application.at(application4[1]);

        const firstIsOpenLater = await application1Instance.isOpenToVote();
        const secondIsOpenLater = await application2Instance.isOpenToVote();

        assert.equal(firstIsOpenLater, false);
        assert.equal(secondIsOpenLater, false);

        const thirdIsOpenBefore = await application3Instance.isOpenToVote();
        const fourthIsOpenBefore = await application4Instance.isOpenToVote();

        assert.equal(thirdIsOpenBefore, true);
        assert.equal(fourthIsOpenBefore, true);

        /**  THIRD ROUND OF VOTES **/

        await fundingApplication.closeVoting({from: accounts[0]});
        await fundingApplication.openApplications({from: accounts[0]});

        await fundingApplication.submitApplication(
            "test application5", 
            "this is a test 5555 application requiring ", 
            {
                from: accounts[2],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        await fundingApplication.submitApplication(
            "test application6", 
            "this is a test 6666 applicationrequiring ", 
            {
                from: accounts[2],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        await fundingApplication.closeApplications({from: accounts[0]});
        await fundingApplication.openVoting({from: accounts[0]});

        application5 = await fundingApplication.proposals(4);
        application6 = await fundingApplication.proposals(5);

        const application5Instance = Application.at(application5[1]);
        const application6Instance = Application.at(application6[1]);

        const firstIsOpenEvenLater = await application1Instance.isOpenToVote();
        const secondIsOpenEvenLater = await application2Instance.isOpenToVote();
        const thirdIsOpenEvenLater = await application3Instance.isOpenToVote();
        const fourthIsOpenEvenLater = await application4Instance.isOpenToVote();

        assert.equal(firstIsOpenEvenLater, false);
        assert.equal(secondIsOpenEvenLater, false);
        assert.equal(thirdIsOpenEvenLater, false);
        assert.equal(fourthIsOpenEvenLater, false);

        const fifthIsOpenBefore = await application5Instance.isOpenToVote();
        const sixthIsOpenBefore = await application6Instance.isOpenToVote();

        assert.equal(fifthIsOpenBefore, true);
        assert.equal(sixthIsOpenBefore, true);
    });
    it("only c level accounts can open and close applications", async () => {
        await fundingApplication.setCEO(accounts[1], {from: owner});
        await fundingApplication.setCOO(accounts[2], {from: accounts[1]});
        await fundingApplication.setCFO(accounts[3], {from: accounts[1]});

        let applicationsOpen = await fundingApplication.applicationsOpen();
        assert.equal(applicationsOpen, false);      
        await fundingApplication.openApplications({from: accounts[1]});
        applicationsOpen = await fundingApplication.applicationsOpen();
        assert.equal(applicationsOpen, true);
        await fundingApplication.closeApplications({from: accounts[1]});
        applicationsOpen = await fundingApplication.applicationsOpen();
        assert.equal(applicationsOpen, false);

        await fundingApplication.openApplications({from: accounts[2]});
        applicationsOpen = await fundingApplication.applicationsOpen();
        assert.equal(applicationsOpen, true);
        await fundingApplication.closeApplications({from: accounts[2]});
        applicationsOpen = await fundingApplication.applicationsOpen();
        assert.equal(applicationsOpen, false);

        await fundingApplication.openApplications({from: accounts[3]});
        applicationsOpen = await fundingApplication.applicationsOpen();
        assert.equal(applicationsOpen, true);
        await fundingApplication.closeApplications({from: accounts[3]});
        applicationsOpen = await fundingApplication.applicationsOpen();
        assert.equal(applicationsOpen, false);

        try {
            await fundingApplication.openApplications({from: accounts[4]});
        } catch(e) {
            // do nothing - catch the VM exception we expect here
        }

        applicationsOpen = await fundingApplication.applicationsOpen();
        assert.equal(applicationsOpen, false);

        await fundingApplication.openApplications({from: accounts[3]});
        applicationsOpen = await fundingApplication.applicationsOpen();
        assert.equal(applicationsOpen, true);

        try {
            await fundingApplication.closeApplications({from: accounts[4]});
        } catch(e) {
            // do nothing - catch the VM exception we expect here
        }
        applicationsOpen = await fundingApplication.applicationsOpen();
        assert.equal(applicationsOpen, true);
    });
    it("only c level accounts can open and close voting", async () => {
        await fundingApplication.setCEO(accounts[1], {from: owner});
        await fundingApplication.setCOO(accounts[2], {from: accounts[1]});
        await fundingApplication.setCFO(accounts[3], {from: accounts[1]});

        let votingOpen = await fundingApplication.votingOpen();
        assert.equal(votingOpen, false);      
        await fundingApplication.openVoting({from: accounts[1]});
        votingOpen = await fundingApplication.votingOpen();
        assert.equal(votingOpen, true);
        await fundingApplication.closeVoting({from: accounts[1]});
        votingOpen = await fundingApplication.votingOpen();
        assert.equal(votingOpen, false);

        await fundingApplication.openVoting({from: accounts[2]});
        votingOpen = await fundingApplication.votingOpen();
        assert.equal(votingOpen, true);
        await fundingApplication.closeVoting({from: accounts[2]});
        votingOpen = await fundingApplication.votingOpen();
        assert.equal(votingOpen, false);

        await fundingApplication.openVoting({from: accounts[3]});
        votingOpen = await fundingApplication.votingOpen();
        assert.equal(votingOpen, true);
        await fundingApplication.closeVoting({from: accounts[3]});
        votingOpen = await fundingApplication.votingOpen();
        assert.equal(votingOpen, false);

        try {
            await fundingApplication.openVoting({from: accounts[4]});
        } catch(e) {
            // do nothing - catch the VM exception we expect here
        }

        votingOpen = await fundingApplication.votingOpen();
        assert.equal(votingOpen, false);

        await fundingApplication.openVoting({from: accounts[3]});
        votingOpen = await fundingApplication.votingOpen();
        assert.equal(votingOpen, true);

        try {
            await fundingApplication.closeVoting({from: accounts[4]});
        } catch(e) {
            // do nothing - catch the VM exception we expect here
        }
        votingOpen = await fundingApplication.votingOpen();
        assert.equal(votingOpen, true);
    });
    it('should only allow a c level account to open applications when it is closed', async () => {
        await fundingApplication.openApplications({from: accounts[0]});
        applicationsOpen = await fundingApplication.applicationsOpen();
        assert.equal(applicationsOpen, true);

        let error;
        try {
            await fundingApplication.openApplications({from: accounts[0]});
        } catch (e) {
            // do nothing - catch the VM exception we expect here
            error = e;
        }
        assert.notEqual(error, undefined);
    });
    it('should only allow a c level account to close applications when it is open', async () => {        
        let error;
        try {
            await fundingApplication.closeApplications({from: accounts[0]});
        } catch (e) {
            // do nothing - catch the VM exception we expect here
            error = e;
        }
        applicationsOpen = await fundingApplication.applicationsOpen();
        assert.equal(applicationsOpen, false);
        assert.notEqual(error, undefined);
    });
    it('should only allow a c level account to open voting when it is closed', async () => {
        await fundingApplication.openVoting({from: accounts[0]});
        votingOpen = await fundingApplication.votingOpen();
        assert.equal(votingOpen, true);

        let error;
        try {
            await fundingApplication.openVoting({from: accounts[0]});
        } catch (e) {
            // do nothing - catch the VM exception we expect here
            error = e;
        }
        assert.notEqual(error, undefined);
    });
    it('should only allow a c level account to close voting when it is open', async () => {        
        let error;
        try {
            await fundingApplication.closeVoting({from: accounts[0]});
        } catch (e) {
            // do nothing - catch the VM exception we expect here
            error = e;
        }
        votingOpen = await fundingApplication.votingOpen();
        assert.equal(votingOpen, false);
        assert.notEqual(error, undefined);
    });
    it("should only allow a c level account to open voting if applications are closed (applications should close first)", async () => {

        await fundingApplication.openApplications({from: accounts[0]});
        applicationsOpen = await fundingApplication.applicationsOpen();
        assert.equal(applicationsOpen, true);

        let votingOpen = await fundingApplication.votingOpen();
        assert.equal(votingOpen, false);
        
        let error;
        try {
            await fundingApplication.openVoting({from: accounts[0]});
        } catch(e) {
            // do nothing - catch the VM exception we expect here
            error = e;
        }
        assert.notEqual(error, undefined);
        votingOpen = await fundingApplication.votingOpen();
        assert.equal(votingOpen, false);
    });
    it("should only allow a c level account to open applications/proposals when voting is closed (voting should close first)", async () => {
        await fundingApplication.openVoting({from: accounts[0]});
        votingOpen = await fundingApplication.votingOpen();
        assert.equal(votingOpen, true);

        let applicationsOpen = await fundingApplication.applicationsOpen();
        assert.equal(applicationsOpen, false);
        
        let error;
        try {
            await fundingApplication.openApplications({from: accounts[0]});
        } catch(e) {
            // do nothing - catch the VM exception we expect here
            error = e;
        }
        assert.notEqual(error, undefined);
        votingOpen = await fundingApplication.applicationsOpen();
        assert.equal(votingOpen, false);
    });
    it("when voting closes - the correct last winner should be emitted", async () => {
        await fundingApplication.openApplications({from: accounts[0]});

        await fundingApplication.submitApplication(
            "test application1", 
            "this is a test 1111 application requiring ", 
            {
                from: accounts[5],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        await fundingApplication.submitApplication(
            "test application2", 
            "this is a test 2222 application requiring ", 
            {
                from: accounts[6],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        await fundingApplication.closeApplications({from: accounts[0]});
        await fundingApplication.openVoting({from: accounts[0]});

        application1 = await fundingApplication.proposals(0);
        const application1Instance = Application.at(application1[1]);
        application2 = await fundingApplication.proposals(0);
        const application2Instance = Application.at(application2[1]);

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: web3.toWei(1, "ether"), gasPrice: 0});

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: web3.toWei(1, "ether"), gasPrice: 0});

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: accounts[3], value: web3.toWei(1, "ether"), gasPrice: 0});

        const onePercentTotal = (web3.toWei(1, "ether") * 3)/100;

        const winningApplicationBalanceBefore = await web3.eth.getBalance(accounts[5]).toNumber();
        const paymentPipeBalanceBefore = await web3.eth.getBalance(paymentPipe.address).toNumber();

        // now Alice has funds - she should be able to cast multiple votes
        await opcToken.approve(application1Instance.address, 2, {from: alice, gasPrice: 0});
        await opcToken.approve(application2Instance.address, 1, {from: accounts[3], gasPrice: 0});
        await application1Instance.voteForApplication(2, {from: alice, gasPrice: 0});
        await application2Instance.voteForApplication(1, {from: accounts[3], gasPrice: 0});

        await fundingApplication.closeVoting({from: accounts[0]});

        const winningApplicationBalanceAfter = await web3.eth.getBalance(accounts[5]).toNumber();
        const paymentPipeBalanceAfter = await web3.eth.getBalance(paymentPipe.address).toNumber();

        assert.equal(paymentPipeBalanceAfter, 0);
        assert.equal(winningApplicationBalanceAfter, winningApplicationBalanceBefore + onePercentTotal);
    });
    it("should pay out multiple accounts if they are tied for votes", async () => {
        await fundingApplication.openApplications({from: accounts[0]});

        await fundingApplication.submitApplication(
            "test application1", 
            "this is a test 1111 application requiring ", 
            {
                from: accounts[5],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        await fundingApplication.submitApplication(
            "test application2", 
            "this is a test 2222 application requiring ", 
            {
                from: accounts[6],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        await fundingApplication.closeApplications({from: accounts[0]});
        await fundingApplication.openVoting({from: accounts[0]});

        application1 = await fundingApplication.proposals(0);
        const application1Instance = Application.at(application1[1]);
        application2 = await fundingApplication.proposals(1);
        const application2Instance = Application.at(application2[1]);

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: web3.toWei(1, "ether"), gasPrice: 0});

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: web3.toWei(1, "ether"), gasPrice: 0});

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: accounts[3], value: web3.toWei(1, "ether"), gasPrice: 0});

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: accounts[3], value: web3.toWei(1, "ether"), gasPrice: 0});

        const onePercentTotal = (web3.toWei(1, "ether") * 4)/100;

        const firstWinningApplicationBalanceBefore = await web3.eth.getBalance(accounts[5]).toNumber();
        const secondWinningApplicationBalanceBefore = await web3.eth.getBalance(accounts[6]).toNumber();

        // now Alice has funds - she should be able to cast multiple votes
        await opcToken.approve(application1Instance.address, 2, {from: alice, gasPrice: 0});
        await opcToken.approve(application2Instance.address, 2, {from: accounts[3], gasPrice: 0});
        await application1Instance.voteForApplication(2, {from: alice, gasPrice: 0});
        await application2Instance.voteForApplication(2, {from: accounts[3], gasPrice: 0});

        await fundingApplication.closeVoting({from: accounts[0]});

        const firstWinningApplicationBalanceAfter = await web3.eth.getBalance(accounts[5]).toNumber();
        const secondWinningApplicationBalanceAfter = await web3.eth.getBalance(accounts[6]).toNumber();
        const paymentPipeBalanceAfter = await web3.eth.getBalance(paymentPipe.address).toNumber();

        assert.equal(paymentPipeBalanceAfter, 0);
        assert.equal(firstWinningApplicationBalanceAfter, firstWinningApplicationBalanceBefore + (onePercentTotal/2));
        assert.equal(secondWinningApplicationBalanceAfter, secondWinningApplicationBalanceBefore + (onePercentTotal/2))
    });
    it("should pay not pay out if there are no winner", async () => {
        await fundingApplication.openApplications({from: accounts[0]});
        
        await fundingApplication.submitApplication(
            "test application1", 
            "this is a test 1111 application requiring ", 
            {
                from: accounts[5],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: web3.toWei(1, "ether"), gasPrice: 0});
        
        const paymentPipeBalanceBefore = await web3.eth.getBalance(paymentPipe.address).toNumber();

        await fundingApplication.closeApplications({from: accounts[0]});
        await fundingApplication.openVoting({from: accounts[0]});

        let error;
        try {
            await fundingApplication.closeVoting({from: accounts[0]});
        } catch (e) {
            error = e;
        }

        const paymentPipeBalanceAfter = await web3.eth.getBalance(paymentPipe.address).toNumber();

        assert.equal(error, undefined);
        assert.equal(paymentPipeBalanceBefore, paymentPipeBalanceAfter);
    });
    it("should pay out multiple accounts if they are tied for votes, in multiple rounds", async () => {
        await fundingApplication.openApplications({from: accounts[0]});

        await fundingApplication.submitApplication(
            "test application1", 
            "this is a test 1111 application requiring ", 
            {
                from: accounts[5],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        await fundingApplication.submitApplication(
            "test application2", 
            "this is a test 2222 application requiring ", 
            {
                from: accounts[6],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        await fundingApplication.closeApplications({from: accounts[0]});
        await fundingApplication.openVoting({from: accounts[0]});

        application1 = await fundingApplication.proposals(0);
        const application1Instance = Application.at(application1[1]);
        application2 = await fundingApplication.proposals(1);
        const application2Instance = Application.at(application2[1]);

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: web3.toWei(1, "ether"), gasPrice: 0});

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: web3.toWei(1, "ether"), gasPrice: 0});

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: accounts[3], value: web3.toWei(1, "ether"), gasPrice: 0});

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: accounts[3], value: web3.toWei(1, "ether"), gasPrice: 0});

        const onePercentTotal = (web3.toWei(1, "ether") * 4)/100;

        const firstWinningApplicationBalanceBefore = await web3.eth.getBalance(accounts[5]).toNumber();
        const secondWinningApplicationBalanceBefore = await web3.eth.getBalance(accounts[6]).toNumber();

        // now Alice has funds - she should be able to cast multiple votes
        await opcToken.approve(application1Instance.address, 2, {from: alice, gasPrice: 0});
        await opcToken.approve(application2Instance.address, 2, {from: accounts[3], gasPrice: 0});
        await application1Instance.voteForApplication(2, {from: alice, gasPrice: 0});
        await application2Instance.voteForApplication(2, {from: accounts[3], gasPrice: 0});

        await fundingApplication.closeVoting({from: accounts[0]});

        const firstWinningApplicationBalanceAfter = await web3.eth.getBalance(accounts[5]).toNumber();
        const secondWinningApplicationBalanceAfter = await web3.eth.getBalance(accounts[6]).toNumber();
        const paymentPipeBalanceAfter = await web3.eth.getBalance(paymentPipe.address).toNumber();

        assert.equal(paymentPipeBalanceAfter, 0);
        assert.equal(firstWinningApplicationBalanceAfter, firstWinningApplicationBalanceBefore + (onePercentTotal/2));
        assert.equal(secondWinningApplicationBalanceAfter, secondWinningApplicationBalanceBefore + (onePercentTotal/2))

        /** SECOND ROUND OF VOTING */

        await fundingApplication.openApplications({from: accounts[0]});

        await fundingApplication.submitApplication(
            "test application1", 
            "this is a test 1111 application requiring ", 
            {
                from: accounts[7],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        await fundingApplication.submitApplication(
            "test application2", 
            "this is a test 2222 application requiring ", 
            {
                from: accounts[8],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        await fundingApplication.closeApplications({from: accounts[0]});
        await fundingApplication.openVoting({from: accounts[0]});

        application3 = await fundingApplication.proposals(2);
        const application3Instance = Application.at(application3[1]);
        application4 = await fundingApplication.proposals(3);
        const application4Instance = Application.at(application4[1]);

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: web3.toWei(1, "ether"), gasPrice: 0});

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: web3.toWei(1, "ether"), gasPrice: 0});

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: accounts[4], value: web3.toWei(1, "ether"), gasPrice: 0});

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: accounts[4], value: web3.toWei(1, "ether"), gasPrice: 0});

        const onePercentTotalSecondRound = (web3.toWei(1, "ether") * 4)/100;

        const thirdWinningApplicationBalanceBefore = await web3.eth.getBalance(accounts[7]).toNumber();
        const fourthWinningApplicationBalanceBefore = await web3.eth.getBalance(accounts[8]).toNumber();

        // now Alice has funds - she should be able to cast multiple votes
        await opcToken.approve(application3Instance.address, 2, {from: alice, gasPrice: 0});
        await opcToken.approve(application4Instance.address, 2, {from: accounts[4], gasPrice: 0});
        await application3Instance.voteForApplication(2, {from: alice, gasPrice: 0});
        await application4Instance.voteForApplication(2, {from: accounts[4], gasPrice: 0});

        await fundingApplication.closeVoting({from: accounts[0]});

        const thirdWinningApplicationBalanceAfter = await web3.eth.getBalance(accounts[7]).toNumber();
        const fourthWinningApplicationBalanceAfter = await web3.eth.getBalance(accounts[8]).toNumber();
        const paymentPipeBalanceAfterSecondRound = await web3.eth.getBalance(paymentPipe.address).toNumber();

        assert.equal(paymentPipeBalanceAfterSecondRound, 0);
        assert.equal(thirdWinningApplicationBalanceAfter, thirdWinningApplicationBalanceBefore + (onePercentTotalSecondRound/2));
        assert.equal(fourthWinningApplicationBalanceAfter, fourthWinningApplicationBalanceBefore + (onePercentTotalSecondRound/2));

        // the old checks from the first round should still be true
        assert.equal(paymentPipeBalanceAfterSecondRound, 0);
        assert.equal(firstWinningApplicationBalanceAfter, firstWinningApplicationBalanceBefore + (onePercentTotalSecondRound/2));
        assert.equal(secondWinningApplicationBalanceAfter, secondWinningApplicationBalanceBefore + (onePercentTotalSecondRound/2));

        /** THIRD ROUND OF VOTING */

        await fundingApplication.openApplications({from: accounts[0]});
        
        await fundingApplication.submitApplication(
            "test application1", 
            "this is a test 1111 application requiring ", 
            {
                from: accounts[5],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        await paymentPipe.payAccountWithOnePercentTax(bob, {from: alice, value: web3.toWei(1, "ether"), gasPrice: 0});
        
        const paymentPipeBalanceBeforeThirdRound = await web3.eth.getBalance(paymentPipe.address).toNumber();

        await fundingApplication.closeApplications({from: accounts[0]});
        await fundingApplication.openVoting({from: accounts[0]});

        let error;
        try {
            await fundingApplication.closeVoting({from: accounts[0]});
        } catch (e) {
            error = e;
        }

        const paymentPipeBalanceAfterThirdRound = await web3.eth.getBalance(paymentPipe.address).toNumber();

        assert.equal(error, undefined);
        assert.equal(paymentPipeBalanceBeforeThirdRound, paymentPipeBalanceAfterThirdRound);
    });
    it("when voting closes - the winner should be reimbursed with the ether funds from the paymentPipe", async () => {
       
    });
});