var PaymentPipe = artifacts.require("PaymentPipe");
var ExternalContractExample = artifacts.require('ExternalContractExample');
var ConvertLib = artifacts.require("ConvertLib");
var OPCToken = artifacts.require("OPCToken");
var FundingApplications = artifacts.require("FundingApplications");

module.exports = function(deployer) {
  deployer.deploy(OPCToken).then((opcToken) => {
    deployer.deploy(PaymentPipe, OPCToken.address).then((paymentPipe) => {
      opcToken.balanceOf(this.web3.eth.accounts[0]).then((balance) => {
        opcToken.approve(this.web3.eth.accounts[0], balance).then(() => {
            opcToken.transferFrom(this.web3.eth.accounts[0], PaymentPipe.address, balance);
        });
      });
      
      deployer.deploy(FundingApplications, PaymentPipe.address, OPCToken.address).then((fundingApplication) => {
        paymentPipe.setFundingApplicationAddress(FundingApplications.address, {from: this.web3.eth.accounts[0], gasPrice: 0});        
      });
    });
  });

  deployer.deploy(ExternalContractExample);
  deployer.deploy(ConvertLib)
  deployer.link(ConvertLib, [PaymentPipe]);
};