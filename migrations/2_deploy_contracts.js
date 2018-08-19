var PaymentPipe = artifacts.require("PaymentPipe");
var ExternalContractExample = artifacts.require('ExternalContractExample');
var ConvertLib = artifacts.require("ConvertLib");
var OPCToken = artifacts.require("OPCToken");
var FundingApplications = artifacts.require("FundingApplications");

module.exports = function(deployer) {
  deployer.deploy(OPCToken).then((opcToken) => {
    deployer.deploy(PaymentPipe, OPCToken.address).then((paymentPipe) => {
      opcToken.approve(this.web3.eth.accounts[0], 1000).then(() => {
        opcToken.totalSupply.call().then((totalSupply) => {
          // TODO: I'd like to pass the total Supply here , but the number is too large and throws
          opcToken.transferFrom(this.web3.eth.accounts[0], paymentPipe.address, 1000);
        });

        deployer.deploy(FundingApplications, PaymentPipe.address, OPCToken.address);

        // TODO: set the funding application adress on paymentpipe
      });
    });
  });

  deployer.deploy(ExternalContractExample);
  deployer.deploy(ConvertLib)
  deployer.link(ConvertLib, [PaymentPipe]);
};