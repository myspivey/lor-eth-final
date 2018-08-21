import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as HDWalletProvider from 'truffle-hdwallet-provider';
import { Connect, SimpleSigner } from 'uport-connect';
import * as Web3 from 'web3';

import { ProofOfLicenseOracle } from './ProofOfLicenseOracle';
import * as TC from './typechain-runtime';

interface UPortUser {
  address: string;
  networkAddress: string;
  name: string;
  phone: string;
  email: string;
  avatar: { uri: string };
  publicEncKey: string;
  publicKey: string;
  pushToken: string;
}

const env = {
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
    proofOfLicenseOracle: '0xcf4f0593f93fd4d4eba4de84815ea132c9a05746',
    gasPrice: '40000000000',
    gas: '2000000'
  }
}

admin.initializeApp();

exports.verifyUportJwt = functions.https.onCall(async (data: UPortUser) => {
  console.log('person', data);
  const _uport = new Connect(env.uport.name,
    {
      network: env.uport.network,
      clientId: env.uport.clientId,
      signer: SimpleSigner(env.uport.signer),
    });

  //TODO: Use JWT to verify this user.
  // This currently would be an attack vector as address and publicEncKey are easily obtainable
  // https://github.com/uport-project/uport-connect/issues/150
  const person: UPortUser = await _uport.credentials.lookup(data.address);
  if (person && person.publicEncKey === data.publicEncKey) {
    try {
      const newUser = await admin.auth().createUser({
        uid: data.address,
        displayName: data.name,
        email: data.email,
        phoneNumber: data.phone,
        photoURL: data.avatar.uri,
      });
    } catch (error) {
      if (error.code === 'auth/uid-already-exists') {
        return await admin.auth().createCustomToken(data.address);
      }
      // TODO: How to handle error?
      console.error(error);
      return error;
    }

    return await admin.auth().createCustomToken(data.address);
  } else
    throw new functions.https.HttpsError('permission-denied', 'Not valid uPort user');
});

exports.validateId = functions.https.onCall(async (data: string) => {
  try {
    console.log('String to notarize: ', data);
    const web3 = new Web3(new HDWalletProvider(env.infura.mnemonic, env.infura.url));
    const accounts = await TC.promisify(web3.eth.getAccounts, []);
    const account = accounts[0];
    console.log('account', accounts[0]);
    const oracle: ProofOfLicenseOracle = await ProofOfLicenseOracle.createAndValidate(web3, env.contracts.proofOfLicenseOracle);
    const notarize = oracle.notarizeTx(data);
    await notarize.send({
      from: account,
    });
    return true
  } catch (error) {
    console.error(error);
    return false;
  }
});
