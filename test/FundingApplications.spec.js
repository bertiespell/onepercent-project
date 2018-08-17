var FundingApplications = artifacts.require("FundingApplications");

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
    it("should not create an application if the application fee is not met", async () => {

        await fundingApplication.openApplications({from: accounts[0]});

        let error;
        try {
            await fundingApplication.submitApplication(
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

        assert.notEqual(error, undefined);
       
    });
    it("c level accounts should be able to change the application fee", async () => {
        await fundingApplication.openApplications({from: accounts[0]});
        // set new application cost
        await fundingApplication.setApplicationCostInWei(8000000000000000, {from: accounts[0]});

        let error;
        try {
            // this should be succesful as it meets new cost
            await fundingApplication.submitApplication(
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

        assert.equal(error, undefined);

        try {
            // this should not be succesful as it does not meet new cost
            await fundingApplication.submitApplication(
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

        let error;
        try {
            await fundingApplication.setApplicationCost(20, {from: accounts[5]})
        } catch (e) {
            error = e;
        }

        assert.notEqual(error, undefined);
    });
    it("an account should not be able to submit a funding proposal when the contract is not open for applications", async () => {
       
    });
    it("an account should not be able to submit more than one funding proposal", async () => {
       
    });
    it("multiple accounts should be able to submit multiple proposals", async () => {
       
    });
    it("once applications close, the last set of proposals should be open to be voted on - i.e. voting should be open", async () => {
       
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
       
    });
    it("when voting closes - the winner should be reimbursed with the ether funds from the paymentPipe", async () => {
       
    });
});