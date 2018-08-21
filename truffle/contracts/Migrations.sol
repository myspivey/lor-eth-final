pragma solidity 0.4.24;

/**
  * @author  James Spivey <spivey@zentostudios.com>
  * @title Migration
  * @dev
  * This is the standard migration contract from Truffle.
  */
contract Migrations {
  address public owner;
  uint public last_completed_migration;

  /** @dev Owner of this contract is who first calls it */
  constructor() public {
    owner = msg.sender;
  }

  /** @dev Ensures a reservation exists in map */
  modifier restricted() {
    if (msg.sender == owner) _;
  }

  /** @dev Set complete on migration
    * @param completed Migration completed date
    */
  function setCompleted(uint completed) public restricted {
    last_completed_migration = completed;
  }

  /** @dev Upgrade a previous deployed contract
    * @param new_address New address of the upgraded contract
    */
  function upgrade(address new_address) public restricted {
    Migrations upgraded = Migrations(new_address);
    upgraded.setCompleted(last_completed_migration);
  }
}
