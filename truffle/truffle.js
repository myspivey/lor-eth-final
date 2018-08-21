/* eslint-disable */
require('babel-register')
require('babel-polyfill')

const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  //I prefer the CLI for unit testing. GUI is create for e2e testing
  //Run 'npm run ganache' and it will use my preset ganache config for this
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
    },
    development_gui: {
      host: "localhost",
      port: 7545,
      network_id: "*", // Match any network id
    },
    rinkeby: {
      provider: new HDWalletProvider(
        '<REPLACED FOR SECURITY>',
        'https://rinkeby.infura.io/v3/e2287dc4257346938e01b2f9974661e3'
      ),
      network_id: 4,
      //gas: 3500000,
      //gasPrice: 50000000000
    }
  },
  mocha: {
    useColors: true,
    fullTrace: false,
    bail: true,
    reporter: 'eth-gas-reporter',
    reporterOptions: {
      currency: 'USD'
    }
  }
};
