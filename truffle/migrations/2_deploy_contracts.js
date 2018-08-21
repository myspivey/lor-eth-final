const ProofOfLicenseOracle = artifacts.require('./ProofOfLicenseOracle.sol');
const ReservationContractFactory = artifacts.require('./ReservationContractFactory.sol');

module.exports = (deployer, network, accounts) => {
  deployer.deploy(ProofOfLicenseOracle, accounts[0]);
  deployer.deploy(ReservationContractFactory);
};
