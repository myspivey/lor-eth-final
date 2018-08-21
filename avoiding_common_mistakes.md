#Protecting from Re-Entrancy
In several places noted in the comments of the contracts I have
added checks to prevent a user from re-entering the contract.
Firstly on creating a reservation a unique ID is generated off the
user and block, I validate the reservation does not already exist
and then complete the creation. For multiple of the Reservation
contract functions, the two that handle payments validate
amounts are expected per the contracts nature and then handles
transfer.

#Timestamp
We do use a timestamp to generate a unique ID. This is however created by the GUI
and not the miners. In addition to this we use the Block ID to reduce risk and ensure unique.

#Math Attacks
I use the SafeMath library which is noted to prevent the under and overflow.

#Mutex locks
Because of using the ownership and state mechanism, this ensures that
multiple functions that open vectors of attack, can only be
called by the internal factory thus limiting public surface
area of the APIs the contract can be invoked from.

#Loops
We do not do any looping in the contracts to avoid gas limit issues.

#Transfer of ether.
This is only done through the standard .transfer method in the contract
when done with outside contracts. the Only place .value is used is for
the factory on creation of the new contract to move the value along.
The fallback functions do not allow for ETH to be force transferred to the
contract. I ensure the amounts fit within range of what is needed
for a rental. I added a destroy function that as issues become determined
could be called to prevent the contract from furthering a broken state.

#Require Checks
Where possible I tried to do all checks through either modifiers, or
as quickly as possible in a function. This ensures the function
fails out quickly if the request is not valid.

#Automated Tooling Checks
I ran my contracts through [SmartCheck](https://tool.smartdec.net/) 
and addressed the issues presented that were listed as problems.
