const ReservationContract = artifacts.require('../contracts/ReservationContract.sol');

/**
 * @author James Spivey <spivey@zentostudios.com>
 * @title ReservationContract.sol tests
 * @dev
 * I choose to wrap these tests in an overarching describe as I wanted to contain several contract
 * resets. I am testing 3 flows in total. Normal (Creation to Complete),
 * Cancel (Creation to Canceled), Destroy (Creation to Destroy). I have a series of trying to
 * execute flows out of order. Finally I am also testing a series of bad creation attempts for
 * negative testing. We assume the first address is our factory as we test this in isolation.
 * Factory would actually be a new deployed instance of ReservationContractFactory.sol. The
 * purpose is to ensure that a contract can only be created and executed in a normal flow and
 * that bad values or execution steps will break.
 */
describe('ReservationContract', () => {
  // I setup a group of initial values here
  // These will be used to create the contract repeatedly with default values
  const now = new Date(); // Current time

  // Reservation start, the following day
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  // Reservation end, two days following
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 2);

  const id = '12345';
  const totalValue = web3.toWei(2, 'ether');
  const nights = 2;
  const rate = web3.toWei(1, 'ether');
  const createdDateTimestamp = now.getTime();
  const startDateTimestamp = startDate.getTime();
  const endDateTimestamp = endDate.getTime();

  contract('Test Normal Reservation Flow', ([factory, owner, renter]) => {
    let ownerBalanceSnapshot = web3.eth.getBalance(owner).toNumber();

    let contract;
    let contractAddress;
    let contractData;

    // I use before instead of beforeEach to test the state flow
    before('Create Reservation', async () => {
      contract = await ReservationContract.new(
        totalValue,
        renter,
        id,
        owner,
        nights,
        rate,
        createdDateTimestamp,
        startDateTimestamp,
        endDateTimestamp, {
          from: factory,
          value: totalValue,
        },
      );
      contractAddress = await contract.address;
    });

    it('is deployed', async () => {
      assert.exists(contract);
    });

    it('is owned by the factory', async () => {
      assert.equal(await contract.owner(), factory);
    });

    it('is not owned by the vehicle owner', async () => {
      assert.notEqual(await contract.owner(), owner);
    });

    it('is not owned by the vehicle renter', async () => {
      assert.notEqual(await contract.owner(), renter);
    });

    it('has a value equal to the reservation', async () => {
      assert.equal(web3.eth.getBalance(contractAddress).toNumber(), totalValue);
    });

    it('does not allow ether to be sent to it by fallback', async () => {
      try {
        await contract.sendTransaction({
          value: 10,
          from: factory,
        });
        assert.fail();
      } catch (error) {
        assert.isTrue(true);
      }
    });

    /**
     * TEST ACCEPTING RESERVATION
     */

    it('the factory cannot accept the rental', async () => {
      try {
        await contract.accept(factory);
        assert.fail();
      } catch (error) {
        assert.isTrue(true);
      }
    });
    it('the vehicle renter cannot accept the rental', async () => {
      try {
        await contract.accept(renter);
        assert.fail();
      } catch (error) {
        assert.isTrue(true);
      }
    });

    it('the vehicle owner can accept the rental', async () => {
      assert.exists(await contract.accept(owner));
    });

    /**
     * TEST STARTING RESERVATION
     */

    it('the factory cannot start the rental', async () => {
      try {
        await contract.start(factory);
        assert.fail();
      } catch (error) {
        assert.isTrue(true);
      }
    });

    it('the vehicle renter cannot start the rental', async () => {
      try {
        await contract.start(renter);
        assert.fail();
      } catch (error) {
        assert.isTrue(true);
      }
    });

    it('the vehicle owner can start the rental', async () => {
      ownerBalanceSnapshot = web3.eth.getBalance(owner).toNumber();
      assert.exists(await contract.start(owner));
    });

    it('once started owner should receive half the rental fee', async () => {
      assert.equal(web3.eth.getBalance(owner).toNumber(), ownerBalanceSnapshot + (totalValue / 2));
    });

    it('should mark half the reservation paid', async () => {
      contractData = await contract.data();
      // Paid is the last item in Data
      assert.equal(totalValue / 2, (contractData[contractData.length - 1]).toNumber());
    });

    /**
     * TEST COMPLETING RESERVATION
     */

    it('the factory cannot complete the rental', async () => {
      try {
        await contract.complete(factory);
        assert.fail();
      } catch (error) {
        assert.isTrue(true);
      }
    });

    it('the vehicle owner cannot complete the rental', async () => {
      try {
        await contract.complete(owner);
        assert.fail();
      } catch (error) {
        assert.isTrue(true);
      }
    });

    it('the vehicle renter can complete the rental', async () => {
      ownerBalanceSnapshot = web3.eth.getBalance(owner).toNumber();
      assert.exists(await contract.complete(renter));
    });

    it('once complete owner should receive the last half the rental fee', async () => {
      assert.equal(web3.eth.getBalance(owner).toNumber(), ownerBalanceSnapshot + (totalValue / 2));
    });

    it('should mark the reservation paid', async () => {
      contractData = await contract.data();
      // Paid is the last item in Data
      assert.equal(totalValue, (contractData[contractData.length - 1]).toNumber());
    });

    it('once complete the owner should own the reservation', async () => {
      assert.equal(await contract.owner(), owner);
    });
  });

  contract('Test Cancel Reservation Flow', ([factory, owner, renter]) => {
    let contract;

    beforeEach('Create Reservation', async () => {
      contract = await ReservationContract.new(
        totalValue,
        renter,
        id,
        owner,
        nights,
        rate,
        createdDateTimestamp,
        startDateTimestamp,
        endDateTimestamp, {
          from: factory,
          value: totalValue,
        },
      );
    });

    /**
     * TEST DESTROYING RESERVATION
     */

    it('the factory cannot cancel the rental', async () => {
      try {
        await contract.cancel(factory);
        assert.fail();
      } catch (error) {
        assert.isTrue(true);
      }
    });

    it('the vehicle owner can cancel the rental', async () => {
      const result = await contract.cancel(owner);
      assert.exists(result);
    });
  });

  contract('Test Destroy Reservation Flow', ([factory, owner, renter]) => {
    let contract;

    beforeEach('Create Reservation', async () => {
      contract = await ReservationContract.new(
        totalValue,
        renter,
        id,
        owner,
        nights,
        rate,
        createdDateTimestamp,
        startDateTimestamp,
        endDateTimestamp, {
          from: factory,
          value: totalValue,
        },
      );
    });

    /**
     * TEST DESTROYING RESERVATION
     */

    it('the factory cannot destroy the rental', async () => {
      try {
        await contract.destroy(factory);
        assert.fail();
      } catch (error) {
        assert.isTrue(true);
      }
    });

    it('the vehicle owner can destroy the rental', async () => {
      const result = await contract.destroy(owner);
      assert.exists(result);
    });


    it('the vehicle renter can destroy the rental', async () => {
      const result = await contract.destroy(renter);
      assert.exists(result);
    });
  });

  // These test the proper caller trying to call process out of order
  // This verifies the state machine is working
  contract('Test Bad Step Flows', ([factory, owner, renter]) => {
    let contract;

    before('Create Reservation', async () => {
      contract = await ReservationContract.new(
        totalValue,
        renter,
        id,
        owner,
        nights,
        rate,
        createdDateTimestamp,
        startDateTimestamp,
        endDateTimestamp, {
          from: factory,
          value: totalValue,
        },
      );
    });

    /**
     * TEST MOVING FROM CREATED
     */
    it('the owner cannot start the rental from created', async () => {
      try {
        await contract.start(owner);
        assert.fail();
      } catch (error) {
        assert.isTrue(true);
      }
    });

    it('the owner cannot complete the rental from created', async () => {
      try {
        await contract.complete(owner);
        assert.fail();
      } catch (error) {
        assert.isTrue(true);
      }
    });

    /**
     * TEST MOVING FROM ACCEPTED
     */
    it('the owner cannot complete the rental from accepted', async () => {
      await contract.accept(owner); // Bump the contract to the next state

      try {
        await contract.complete(owner);
        assert.fail();
      } catch (error) {
        assert.isTrue(true);
      }
    });

    it('the owner cannot cancel the rental from accepted', async () => {
      try {
        await contract.cancel(owner);
        assert.fail();
      } catch (error) {
        assert.isTrue(true);
      }
    });

    it('the owner cannot destroy the rental from accepted', async () => {
      try {
        await contract.destroy(owner);
        assert.fail();
      } catch (error) {
        assert.isTrue(true);
      }
    });

    /**
     * TEST MOVING FROM STARTED
     */
    it('the owner cannot cancel the rental from started', async () => {
      await contract.start(owner); // Bump the contract to the next state
      try {
        await contract.cancel(owner);
        assert.fail();
      } catch (error) {
        assert.isTrue(true);
      }
    });

    it('the owner cannot destroy the rental from started', async () => {
      try {
        await contract.destroy(owner);
        assert.fail();
      } catch (error) {
        assert.isTrue(true);
      }
    });

    /**
     * TEST MOVING FROM COMPLETED
     */
    it('the owner cannot cancel the rental from completed', async () => {
      await contract.complete(renter); // Bump the contract to the next state
      try {
        await contract.cancel(owner);
        assert.fail();
      } catch (error) {
        assert.isTrue(true);
      }
    });

    it('the owner cannot destroy the rental from completed', async () => {
      try {
        await contract.destroy(owner);
        assert.fail();
      } catch (error) {
        assert.isTrue(true);
      }
    });
  });

  contract('Test Bad Creations', ([factory, owner, renter]) => {
    it('cannot be created by the vehicle owner', async () => {
      try {
        await ReservationContract.new(
          totalValue,
          renter,
          id,
          owner,
          nights,
          rate,
          createdDateTimestamp,
          startDateTimestamp,
          endDateTimestamp, {
            from: owner,
            value: totalValue,
          },
        );
        assert.fail();
      } catch (error) {
        assert.isTrue(true);
      }
    });

    it('cannot be created by the vehicle renter', async () => {
      try {
        await ReservationContract.new(
          totalValue,
          renter,
          id,
          owner,
          nights,
          rate,
          createdDateTimestamp,
          startDateTimestamp,
          endDateTimestamp, {
            from: renter,
            value: totalValue,
          },
        );
        assert.fail();
      } catch (error) {
        assert.isTrue(true);
      }
    });

    it('cannot be created with a value less than the reservation', async () => {
      const lessThanValue = web3.toWei(1, 'ether');
      try {
        await ReservationContract.new(
          lessThanValue,
          renter,
          id,
          owner,
          nights,
          rate,
          createdDateTimestamp,
          startDateTimestamp,
          endDateTimestamp, {
            from: factory,
            value: totalValue,
          },
        );
        assert.fail();
      } catch (error) {
        assert.isTrue(true);
      }
    });

    it('cannot be created with a value greater than the reservation', async () => {
      const greaterThanValue = web3.toWei(4, 'ether');
      try {
        await ReservationContract.new(
          greaterThanValue,
          renter,
          id,
          owner,
          nights,
          rate,
          createdDateTimestamp,
          startDateTimestamp,
          endDateTimestamp, {
            from: factory,
            value: totalValue,
          },
        );
        assert.fail();
      } catch (error) {
        assert.isTrue(true);
      }
    });
  });
});
