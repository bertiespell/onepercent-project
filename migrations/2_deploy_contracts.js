var SimpleStorage = artifacts.require("SimpleStorage");
var TutorialToken = artifacts.require("TutorialToken");
var ComplexStorage = artifacts.require("ComplexStorage");
var PayableExample = artifacts.require("PayableExample");
var PaymentPipe = artifacts.require("PaymentPipe");

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(TutorialToken);
  deployer.deploy(ComplexStorage);
  deployer.deploy(PayableExample);
  deployer.deploy(PaymentPipe);
};
