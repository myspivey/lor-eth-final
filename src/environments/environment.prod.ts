export const environment = {
  production: true,
  firebase: {
    apiKey: 'AIzaSyBciVcz2A6zWEqXiFLKJcgWGKfLHnzUMDE',
    authDomain: 'lor-eth.firebaseapp.com',
    databaseURL: 'https://lor-eth.firebaseio.com',
    projectId: 'lor-eth',
    storageBucket: 'lor-eth.appspot.com',
    messagingSenderId: '698694263062'
  },
  w3HttpProvider: '',
  uport: {
    name: 'LOR ETH',
    network: 'rinkeby',
    clientId: '2oo93fx4Fj6UQwcdeaniMdbvmFCqtkkhHGa',
    signer: 'cba3676a2de182e23dcfce8e151b61ca520ac9e3c7a134ad1400ff251bbee78b'
  },
  infura: {
    url: 'https://rinkeby.infura.io/v3/e2287dc4257346938e01b2f9974661e3',
    mnemonic: '<REPLACED FOR SECURITY>'
  },
  contracts: {
    reservationFactory: '0xac6af4444e1b3a85820662b89038e738226b28e6',
    gasPrice: '40000000000',
    gas: '2000000'
  }
};
