const ProofOfLicenseOracle = artifacts.require('../contracts/ProofOfLicenseOracle.sol');

contract('ProofOfLicenseOracle', ([owner, anotherUser]) => {
  let contract;

  before(async () => {
    contract = await ProofOfLicenseOracle.deployed();
  });

  it('is deployed', async () => {
    assert.exists(contract);
  });

  it('has an owner', async () => {
    const contractOwner = await contract.owner();
    assert.equal(contractOwner, owner);
  });

  it('has an oracle', async () => {
    const oracle = await contract.oracleAddress();
    assert.equal(oracle, owner);
  });

  it('does not allow ether to be sent to it by fallback', async () => {
    try {
      await contract.sendTransaction({
        value: 10,
        from: anotherUser,
      });
      assert.fail();
    } catch (error) {
      assert.isTrue(true);
    }
  });

  it('create proof for a string sha256 encoded', async () => {
    const expectedResult = '0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08';
    const result = await contract.proofFor.call('test');
    assert.equal(result, expectedResult);
  });

  it('can only be called by the oracle', async () => {
    try {
      await contract.notarize('test', {
        from: anotherUser,
      });
      assert.fail();
    } catch (error) {
      assert.isTrue(true);
    }
  });

  it('returns true for a stored string', async () => {
    await contract.notarize('test', {
      from: owner,
    });
    assert.isTrue(await contract.checkLicense.call('test'));
  });

  it('returns false for not stored strings', async () => {
    await contract.notarize('test', {
      from: owner,
    });
    assert.isFalse(await contract.checkLicense.call('not-valid-test'));
  });
});
