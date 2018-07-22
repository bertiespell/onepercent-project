var TutorialToken = artifacts.require("TutorialToken");
var PaymentPipe = artifacts.require("PaymentPipe");
var ExternalContractExample = artifacts.require('ExternalContractExample');

module.exports = function(deployer) {
  deployer.deploy(TutorialToken);
  deployer.deploy(PaymentPipe);
  deployer.deploy(ExternalContractExample);
};
