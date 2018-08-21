#The Factory Pattern
My initial desire was to have a system where a user submitted 
to a core contract and that contract spawned new contracts.
The reason for this is I wanted to have a central way to keep 
track of the contracts created as they were equal to reservations in my system.
Having the central factory allowed me to not have a third party 
database keep track of the new created reservations as well 
as the benefits of staying on chain.


#Circuit Breaker Pattern
Since this used a circuit break pattern it means that the central
factory can maintain if further contract creation or manipulation
can continue. If this was done through separate disparate contracts
it would be incredibly hard to manage. A great of example of this is
how [Augur](https://www.augur.net/) [contracts](https://github.com/AugurProject/augur-core/tree/5ad45ce0f2d09266aca07d38746800c10e0da5e7/source/contracts)
also uses the Factory pattern for their markets with the circuit breaker pattern.
My implemntation uses the tested and evaluated Pausable library from
[openzeppelin-solidity](https://github.com/OpenZeppelin/openzeppelin-solidity/tree/master/contracts)


#Withdrawal Pattern
Currently the reservation factory when it creates a new reservation and 
passes the value along. From there, each reservation contract manages 
through both state pattern and restricted access pattern, transfers.
The transfers are also multi-part based off the state. So first the 
request is made, value transferred for the rental. Once the vehicle
owner approves, half of the value is transferred to him/her.
Once the renter marks the rental complete, the rest of the value
is moved to the rental vehicle owner.


#Restricting Access Pattern
As discussed in the factory section section and security document,
using the factory pattern also has the added value of the fact it 
means the factory then can maintain and enforce security of the 
owners from a central place. Like the Circuit Breaker pattern,
if this was done through separate disparate contracts it would be
incredibly hard to manage. The factory sets the creator as the owner,
this address is then the only one that can manage the contract at first.
It uses SuperUser from [openzeppelin-solidity](https://github.com/OpenZeppelin/openzeppelin-solidity/tree/master/contracts).
This allows ownership to be transferred as needed from that initial contract.
It also allows through its inheritance a future proof method for controlling
access through role based security.

#State Machine Pattern
The Reservation Contract uses several states to manage what point in the reservation
a user is. The current options control who can do what with a contract.
Paired with the restricted access pattern, it makes it so only one of
the two parties interacting with the contract can do a certain action
at a certain time. A big value in this is that it prevents a vehicle
owner from taking all of the value out of the contract before the 
contract and reservation is complete.
