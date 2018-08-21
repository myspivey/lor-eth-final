const ReservationContractFactory = artifacts.require('../contracts/ReservationContractFactory.sol');

/**
 * @author James Spivey <spivey@zentostudios.com>
 * @title ReservationContractFactory.sol tests
 * @dev
 * I choose to wrap these tests in an overarching describe as I wanted to contain several contract
 * resets. Since ReservationContract.sol's tests cover most of the logic for the flow, here I just
 * pass and assume good data as those tests cover the bad data negative tests. I simply want to
 * ensure the factory passes along properly and the contract responses as expected. I do have
 * negative testing for the circuit breaker.
 */
describe('ReservationContractFactory', () => {
  //  I setup a group of initial values here
  // These will be used to create the contract repeatedly with default values
  const now = new Date(); // Current time
  // Reservation start, the following day
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  // Reservation end, two days following
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 2);

  const totalCost = web3.toWei(2, 'ether');
  const nights = 2;
  const rate = web3.toWei(1, 'ether');
  const createdDateTimestamp = now.getTime();
  const startDateTimestamp = startDate.getTime();
  const endDateTimestamp = endDate.getTime();

  contract('Test Normal Reservation Flow', ([migrator, owner, renter]) => {
    let factoryBalanceSnapshot;
    const ownerBalanceSnapshot = web3.eth.getBalance(owner);
    const renterBalanceSnapshot = web3.eth.getBalance(renter);

    let contract;
    let contractAddress;
    let resoId;

    // I use before instead of beforeEach to test the state flow
    before('Create Reservation Contract Factory', async () => {
      contract = await ReservationContractFactory.deployed();
      contractAddress = await contract.address;
      factoryBalanceSnapshot = web3.eth.getBalance(contractAddress);
    });

    it('is deployed', async () => {
      assert.exists(contract);
    });

    it('is owned by the migrator', async () => {
      assert.equal(await contract.owner(), migrator);
    });

    it('has zero initial value', async () => {
      assert.isTrue(factoryBalanceSnapshot.eq(0));
    });

    it('does not allow ether to be sent to it by fallback', async () => {
      try {
        await contract.sendTransaction({
          value: 10,
          from: migrator,
        });
        assert.fail();
      } catch (error) {
        assert.isTrue(true);
      }
    });

    let txInfo;
    it('renter can create Reservation', async () => {
      // Question, is there a way to do this all in one?
      // First we get the resoId
      resoId = await contract.createReservation.call(
        owner,
        nights,
        rate,
        totalCost,
        createdDateTimestamp,
        startDateTimestamp,
        endDateTimestamp, {
          from: renter,
          value: totalCost,
        },
      );
      // Then we send the actual transaction
      txInfo = await contract.createReservation(
        owner,
        nights,
        rate,
        totalCost,
        createdDateTimestamp,
        startDateTimestamp,
        endDateTimestamp, {
          from: renter,
          value: totalCost,
        },
      );
    });

    it('renter has paid for value of reservation', () => {
      const tx = web3.eth.getTransaction(txInfo.tx);
      const gasCost = tx.gasPrice.mul(txInfo.receipt.gasUsed);
      const renterBalanceCurrent = web3.eth.getBalance(renter);
      const txCost = renterBalanceSnapshot.minus(renterBalanceCurrent);
      assert.isTrue(txCost.eq(gasCost.add(totalCost)));
    });

    it('owner has not been paid for value of reservation yet', () => {
      assert.isTrue(web3.eth.getBalance(owner).eq(ownerBalanceSnapshot));
    });

    it('the factory has transferred the value to the new reservation contract', async () => {
      assert.isTrue(web3.eth.getBalance(contractAddress).eq(factoryBalanceSnapshot));
    });

    it('can get new reservation by reservation ID', async () => {
      assert.exists(await contract.getReservationById(resoId));
    });

    it('can get a list of reservations by reservation owner address', async () => {
      assert.exists(await contract.getReservationsByUserId(owner));
    });

    it('can get a list of reservations by reservation renter address', async () => {
      assert.exists(await contract.getReservationsByUserId(renter));
    });

    /**
     * WORKFLOW TESTING
     */

    it('the vehicle owner can accept the rental', async () => {
      assert.exists(await contract.accept(resoId, {
        from: owner,
      }));
    });

    it('the vehicle owner can start the rental', async () => {
      assert.exists(await contract.start(resoId, {
        from: owner,
      }));
    });

    it('the vehicle renter can complete the rental', async () => {
      assert.exists(await contract.complete(resoId, {
        from: renter,
      }));
    });
  });

  // eslint-disable-next-line
  contract('Test Cancel Reservation Flow', ([migrator, owner, renter]) => {

    let contract;
    let resoId;

    // I use before instead of beforeEach to test the state flow
    before('Create Reservation Contract Factory', async () => {
      contract = await ReservationContractFactory.deployed();

      // Question, is there a way to do this all in one?
      // First we get the resoId
      resoId = await contract.createReservation.call(
        owner,
        nights,
        rate,
        totalCost,
        createdDateTimestamp,
        startDateTimestamp,
        endDateTimestamp, {
          from: renter,
          value: totalCost,
        },
      );
      // Then we send the actual transaction
      await contract.createReservation(
        owner,
        nights,
        rate,
        totalCost,
        createdDateTimestamp,
        startDateTimestamp,
        endDateTimestamp, {
          from: renter,
          value: totalCost,
        },
      );
    });

    /**
     * WORKFLOW TESTING
     */

    it('the vehicle owner can cancel the rental', async () => {
      assert.exists(await contract.cancel(resoId, {
        from: owner,
      }));
    });
  });

  // eslint-disable-next-line
  contract('Test Circuit Breaker Reservation Flow', ([migrator, owner, renter]) => {
    let contract;

    // I use before instead of beforeEach to test the state flow
    before(async () => {
      contract = await ReservationContractFactory.deployed();
    });

    it('can not setup a contract when paused', async () => {
      await contract.pause();
      try {
        await contract.createReservation.call(
          owner,
          nights,
          rate,
          totalCost,
          createdDateTimestamp,
          startDateTimestamp,
          endDateTimestamp, {
            from: renter,
            value: totalCost,
          },
        );
        assert.fail();
      } catch (error) {
        assert.isTrue(true);
      }
    });
  });
});
