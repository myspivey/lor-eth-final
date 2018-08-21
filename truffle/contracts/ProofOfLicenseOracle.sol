pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/ownership/NoOwner.sol";

/**
  * @author  James Spivey <spivey@zentostudios.com>
  * @title Proof of license store.
  * @dev
  * This Proof of License contract is used to store validation that
  * a user has a valid license. NoOwner prevents this contract
  * from accepting ether or having an owner.
  */
contract ProofOfLicenseOracle is NoOwner {

  //Location of the Oracle
  address public oracleAddress;

  //Holds a map of license proofs
  mapping (bytes32 => bool) private proofs;

  /** @dev Store the oracle address
    * @param _oracleAddress Address of the oracle
    */
  constructor (address _oracleAddress) public {
    oracleAddress = _oracleAddress;
  }


  /** @dev Creates the stored encoding from the license string
    * @param _license A string representation of their license.
    * @return The SHA256 encoding of the license string.
    */
  function proofFor(string _license)
    public
    pure
    returns (bytes32)
  {
    return sha256(abi.encodePacked(_license));
  }

  /** @dev Creates the stored encoding from the license string
    * @param _proof An encoded proof from proofFor
    */
  function storeProof(bytes32 _proof)
    internal
  {
    proofs[_proof] = true;
  }

  /** @dev Validated a proof exists
    * @param _proof An encoded proof from proofFor
    * @return true if it has a proof.
    */
  function hasProof(bytes32 _proof)
    internal
    view
    returns(bool)
  {
    return proofs[_proof];
  }

  /** @dev Takes a string license and stores it in proofs.
    *      Only the oracle can call this
    * @param _license A string representation of their license.
    */
  function notarize(string _license)
    public
  {
    require(msg.sender == oracleAddress, "Must be called by the Oracle");
    bytes32 proof = proofFor(_license);
    storeProof(proof);
  }

  /** @dev Validates if a license has been stored in proofs
    * @param _license A string representation of their license.
    */
  function checkLicense(string _license)
    public
    view
    returns (bool)
  {
    bytes32 proof = proofFor(_license);
    return hasProof(proof);
  }
}

