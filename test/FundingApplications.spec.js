var FundingApplications = artifacts.require("FundingApplications");
var Application = artifacts.require("Application");

contract('FundingApplications', function(accounts) {

    const owner = accounts[0];
    const alice = accounts[1];
    const bob = accounts[2];

    let fundingApplication;
    beforeEach(async () => {
        fundingApplication = await FundingApplications.new();
    });
    it("an account should be able to submit a funding proposal when the contract is open for applications", async () => {
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
            5,
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
            5,
            {
                from: accounts[3],
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
                5,
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
                5,
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
            5,
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
            5,
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
            5,
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
            5,
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

        await fundingApplication.openApplications({from: accounts[0]});

        await fundingApplication.submitApplication(
            "test application", 
            "this is a test application requiring ", 
            5,
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
            5,
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
            5,
            {
                from: accounts[2],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        await fundingApplication.submitApplication(
            "test application2", 
            "this is a test 2222 applicationrequiring ", 
            5,
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
    it.only("multiple rounds of opening (and then closing) applications should reveal fresh applications to vote on", async () => {
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

        await fundingApplication.submitApplication(
            "test application2", 
            "this is a test 2222 applicationrequiring ", 
            5,
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
            5,
            {
                from: accounts[2],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        await fundingApplication.submitApplication(
            "test application4", 
            "this is a test 4444 applicationrequiring ", 
            5,
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
            5,
            {
                from: accounts[2],
                value: web3.toWei(0.004, "ether"), 
                gasPrice: 0

            }
        );

        await fundingApplication.submitApplication(
            "test application6", 
            "this is a test 6666 applicationrequiring ", 
            5,
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
    it("application cycles and voting cycles do not need to be in line - but should still be tallied correctly", async () => {
       
    });
    it("any account should be able to spend OPC tokens voting for a proposal - when voting is open", async () => {
       
    });
    it("when voting closes - users should no longer be able to submit votes", async () => {
       
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
    it("should only allow a c level account to open voting if votins is already ", async () => {

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
    it("should only allow a c level account to open applications if applications are already closed", async () => {
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
       
    });
    it("when voting closes - the winner should be reimbursed with the ether funds from the paymentPipe", async () => {
       
    });
});