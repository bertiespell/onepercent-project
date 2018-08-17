var FundingApplications = artifacts.require("FundingApplications");

contract('FundingApplications', function(accounts) {

    const owner = accounts[0];
    const alice = accounts[1];
    const bob = accounts[2];

    beforeEach(async () => {
        fundingApplication = await FundingApplications.new();
    });
    it("an account should be able to submit a funding proposal when the contract is open for applications", async () => {
       
    });
    it("an account should not be able to submit a funding proposal when the contract is not open for applications", async () => {
       
    });
    it("an account should not be able to submit more than one funding proposal", async () => {
       
    });
    it("multiple accounts should be able to submit multiple proposals", async () => {
       
    });
    it("once applications close, the last set of proposals should be open to be voted on - i.e. voting should be open", async () => {
       
    });
    it("any account should be able to spend OPC tokens voting for a proposal", async () => {
       
    });
    it("when voting closes - users should no longer be able to submit votes", async () => {
       
    });
    it("only c level accounts can open and close application and voting windows", async () => {
       
    });
    it("should not allow a c level account to open voting if applications are still open (applications should close first)", async () => {
       
    });
    it("should not allow a c level account to open applications/proposals if voting is still open (voting should close first)", async () => {
       
    });
    it("when voting closes - the correct last winner should be emitted", async () => {
       
    });
    it("when voting closes - the winner should be reimbursed with the ether funds from the paymentPipe", async () => {
       
    });
});