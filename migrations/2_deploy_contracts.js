var TutorialToken = artifacts.require("TutorialToken");
var PaymentPipe = artifacts.require("PaymentPipe");
var ExternalContractExample = artifacts.require('ExternalContractExample');
var ConvertLib = artifacts.require("ConvertLib");
var OPCToken = artifacts.require("OPCToken");

module.exports = function(deployer) {
  deployer.deploy(TutorialToken);
  deployer.deploy(ExternalContractExample);
  deployer.deploy(ConvertLib)
  deployer.link(ConvertLib, [PaymentPipe]);
  deployer.deploy(PaymentPipe);
  deployer.deploy(OPCToken);
};
