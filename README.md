# Luxury Offroad Rentals Ethereum Final

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.8.
It can be found online here [Luxury Offroad Rentals ETH](https://lor-eth.firebaseapp.com/)

# Purpose

This website is a blockchain version of a personal project I have been starting around renting RV's. The name of the business is Luxury Offroad Rentals.
The idea of the site is to enable rentals of users who are registered to rent an RV on a nightly basis. The transfer should have a multi step process where
the renter requests a rental, the renter approves the rental. From there the renter will start the rental at which point they will earn half of the total
rental cost. To finish the rental the renter marks it complete at which point the rest of the total cost is deposited into their account. The final option
is for the car owner to cancel instead of confirming the rental. I also implemented an Oracle for License Verification.

## Setup

Run `npm i` from the root folder and `/truffle` folder.

## Running Ganache

You can run `npm run truffle:ganache` and this will spin up Ganache-CLI based off the following Mnemonic.

Mnemonic `oak repeat enjoy surprise shed upon skin plug carry okay warrior board`

`0xc5e686CA406ABc9F5B9eE2eCeCDf65564546f60A` I used as the product owner / oracle as migrate defaults to that
`0xA453ecF8c206209713CDF7806C040f6Fa54175ac` I used as the Vehicle Owner
`0xA453ecF8c206209713CDF7806C040f6Fa54175ac` I used as the Vehicle Renter

## Development server

Run `npm run truffle:cng` to compile and generate the Typescript stubs.

Run `npm run truffle:migrate` to migrate the contracts to ganache.

Run `npm start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
Update `/src/environments/environment.ts` with the proper 
contract addresses for the two migrated contracts.

To run against the Rinkby deployed contracts you can run in production mode with `client:start:prod`

The local development server talks to [Firebase](https://firebase.google.com/) so any accounts created will carry over to the Rinkby network as well.

The ganache command generates 10 accounts so when you signup on the site, it will ask you to set your address. While
renting you can send from any address in MetaMask, the site enforces you to use this fixed address so it knows how to
load your rentals on refresh. If you do not use the account you have set, it means your reservation will not load on refresh.
The client is smart enough to warn you of this before sending a transaction.

## Build

Run `npm run truffle:cng` to generate the base typescript files needed for the client. These are not stored in git. This should run automatically after install.
Run `npm run client:build` to build the client project. The build artifacts will be stored in the `dist/` directory. Use the `client:build:prod` flag for a production build.

Run `npm run build` to build everything.

If you have an issue with building, please run `npm run postinstall` before reporting the issue. This resolves a number of issues that occur because of the BigNumber dependency.
This most commonly shows itself with the following error "ERROR in Debug Failure. False expression: Host should not return a redirect source file from 'getSourceFile'"

## Running linting

Run `npm run truffle:lint` to execute the truffle linter.
Run `npm run client:lint` to execute the client linter.
Run `npm run lint` to execute both.

Run `npm run truffle:lint:fix` to execute the truffle linter and auto fix test & migration lint issues.
Run `npm run client:lint:fix` to execute the client linter and auto fix issues.

## Running unit tests

Run `npm run truffle:test` to execute the truffle unit tests.
Run `npm run client:test` to execute the client unit tests.
Run `npm run test` to execute both.

## Running Coverage

Run `npm run coverage` from truffle folder to generate coverage for contracts

The following is the latest coverage report for truffle contracts
---------------------------------|-----------|-----------|-----------|-----------|----------------|
File                             |  % Stmts  | % Branch  |  % Funcs  |  % Lines  |Uncovered Lines |
---------------------------------|-----------|-----------|-----------|-----------|----------------|
 contracts/                      |      100% |    76.67% |    92.86% |      100% |                |
  ProofOfLicenseOracle.sol       |      100% |      100% |      100% |      100% |                |
  ReservationContract.sol        |      100% |    81.82% |    90.91% |      100% |                |
  ReservationContractFactory.sol |      100% |       50% |    90.91% |      100% |                |
---------------------------------|-----------|-----------|-----------|-----------|----------------|
All files                        |      100% |    76.67% |    92.86% |      100% |                |
---------------------------------|-----------|-----------|-----------|-----------|----------------|

## Credits

[Jeff Delaney](https://jeffdelaney.me) for a lot of the base code found here: [Angular Firestarter](https://github.com/codediodeio/angular-firestarter)
Signup for his site here!!!! [Angular Firebase](https://angularfirebase.com/)
