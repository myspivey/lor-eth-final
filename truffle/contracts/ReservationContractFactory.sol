pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

import "./ReservationContract.sol";

/**
  * @author James Spivey <spivey@zentostudios.com>
  * @title Reservation Factory
  * @dev
  * This contract creates new contracts to track reservations.
  * It's purpose is to simply be the manager of an X number of reservations.
  * It makes tracking reservations easier and by being a factory easier to read/reason.
  */
contract ReservationContractFactory is Pausable {
  using SafeMath for uint256;

  /*
    These are the events for all of the different states
    that this contract can be in. This will help the UI
    to update the list as these items occur. I dispatch
    here and in the reservation itself for tracability.
  */
  event ReservationFactoryCreate(
    bytes32 id, address owner, address renter
  );
  event ReservationFactoryConfirm(
    bytes32 id, address caller
  );
  event ReservationFactoryActivate(
    bytes32 id, address caller
  );
  event ReservationFactoryComplete(
    bytes32 id, address caller
  );
  event ReservationFactoryCancel(
    bytes32 id, address caller
  );

 //Holds a reservation by unique ID
  mapping(bytes32 => address) internal reservationsById;

  //Holds list of reservations by address
  mapping(address => address[]) internal reservationsByUserId;

  constructor() public {}

  /** @dev Ensures a reservation exists in map
    * @param _resId Unique generated reservation ID
    */
  modifier validReservation(
    bytes32 _resId
  ) {
    require(
      reservationsById[_resId] != 0,
      "Must supply a valid rental Id"
    );
    _;
  }

  /** @dev Creates a new unique reservation ID to be referenced
    * @param _renter Address of the vehicle renter
    * @param _owner Address of the vehicle owner
    * @param _createdDate Date reservation created. GUI created timestamp
    * @param _blockNumber Block number of transaction. Ensures uniqueness
    * @return Generated unique ID
    */
  function createReservationId(
    address _renter,
    address _owner,
    uint256 _createdDate,
    uint256 _blockNumber
    )
    private
    pure
    returns (bytes32)
  {
    //Return packed ID
    /* solium-disable-next-line */
    return sha256(abi.encodePacked(
      _owner,
      _renter,
      _createdDate,
      _blockNumber
    ));
  }

  /** @dev Creates the reservation. Passed the value to the new contract.
    *      Can not be called if contracts are paused.
    * @param _owner Address of the vehicle owner
    * @param _nights Number of nights being rented
    * @param _rate Agreed rate at time of booking in wei
    * @param _createdDate Date reservation created. GUI created timestamp
    * @param _startDate Date reservation begins
    * @param _endDate Date reservation ends
    * @return Generated unique ID
    */
  function createReservation(
    address _owner,
    uint8 _nights,
    uint256 _rate,
    uint256 _totalCost,
    uint256 _createdDate,
    uint256 _startDate,
    uint256 _endDate
  )
      public
      payable
      whenNotPaused
      returns (bytes32)
  {
    //Ensure the amount sent is enough to fill the reservation
    require(
      msg.value == _totalCost,
      "Value sent does not equal reservation total cost"
    );

    //Get a unique ID for the reservation for tracking purposes.
    bytes32 resId = createReservationId(
      msg.sender,
      _owner,
      _createdDate,
      block.number
    );

    //This protects against re-entrancy
    require(
      reservationsById[resId] == 0,
      "This reservation already exists"
    );

    //Create new reservation and send value along
    ReservationContract newReso = (new ReservationContract).value(msg.value)(
      msg.value,
      msg.sender,
      resId,
      _owner,
      _nights,
      _rate,
      _createdDate,
      _startDate,
      _endDate
    );

    reservationsById[resId] = newReso; //Store by ID for fastest lookup
    reservationsByUserId[msg.sender].push(newReso); //Map for reservations by Renter
    reservationsByUserId[_owner].push(newReso); //Map for reservations by Owner

    emit ReservationFactoryCreate(resId, _owner, msg.sender);

    return resId; //Send back new unique ID
  }

  /** @dev Gets a reservation by unique generated ID
    * @param _resId Unique generated reservation ID
    * @return Reservation address
    */
  function getReservationById(bytes32 _resId)
    public
    view
    returns (address)
  {
    return reservationsById[_resId];
  }

  /** @dev Gets a reservation by a users address
    * @param _userId Users address
    * @return Array of reservation addresses
    */
  function getReservationsByUserId(address _userId)
    public
    view
    returns (address[])
  {
    return reservationsByUserId[_userId];
  }

  /** @dev Accepts a reservation, validates is a valid reservation.
    *      Reservation contract validates everything else.
    * @param _resId Unique generated reservation ID
    */
  function accept(bytes32 _resId)
    public
    validReservation(_resId)
  {
    ReservationContract(reservationsById[_resId]).accept(msg.sender);
    emit ReservationFactoryConfirm(_resId, msg.sender);
  }

  /** @dev Starts a reservation, validates is a valid reservation/
    *      Reservation contract validates everything else.
    * @param _resId Unique generated reservation ID
    */
  function start(bytes32 _resId)
    public
    validReservation(_resId)
  {
    ReservationContract(reservationsById[_resId]).start(msg.sender);
    emit ReservationFactoryActivate(_resId, msg.sender);
  }

  /** @dev Completes a reservation, validates is a valid reservation.
    *      Reservation contract validates everything else.
    * @param _resId Unique generated reservation ID
    */
  function complete(bytes32 _resId)
    public
    validReservation(_resId)
  {
    ReservationContract(reservationsById[_resId]).complete(msg.sender);
    emit ReservationFactoryComplete(_resId, msg.sender);
  }

  /** @dev Cancels a reservation, validates is a valid reservation.
    *      Reservation contract validates everything else.
    * @param _resId Unique generated reservation ID
    */
  function cancel(bytes32 _resId)
    public
    validReservation(_resId)
  {
    ReservationContract(reservationsById[_resId]).cancel(msg.sender);
    emit ReservationFactoryCancel(_resId, msg.sender);
  }

  /** @dev Dont receive ether via fallback.  */
  function () public { }
}

