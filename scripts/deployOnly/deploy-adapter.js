// const { ethers, upgrades } = require('hardhat');
//
// const path = require('path');
// const fs = require('fs');
// require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
//
// const pathOutputJson = path.join(__dirname, '../../deploy_output.json');
// let deployOutput = {};
// if (fs.existsSync(pathOutputJson)) {
//     deployOutput = require(pathOutputJson);
// }
// console.log(`Bridge Contract Proxy Addr: ${deployOutput.bitmapRentContract}`)
//
// async function main() {
//     let [owner] = await ethers.getSigners();
//     console.log(`Using owner account: ${await owner.getAddress()}`)
//
//     // 1. Get the contract to deploy
//     const BridgeFactory = await ethers.getContractFactory('MyOFTAdapterUpgradeable', owner);
//     console.log('Deploying ...');
//
//     // 2. Instantiating a new Box smart contract
//     const bridge = await BridgeFactory.deploy(
//         '0x2f913c820ed3beb3a67391a6eff64e70c4b20b19',
//         '0x00301663BcA124aFF4a3B42512f3110E078f2e33'
//     );
//
//     // 3. Waiting for the deployment to resolve
//     // await bridge.waitForDeployment();
//
//     // 4. Use the contract instance to get the contract address
//     console.log('BitmapRent deployed to:', bridge.target);
// }
//
// main().catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
// });
//
// // deploy+verify.
// // cmd1: npx hardhat run scripts/deployOnly/deploy-logic.js --network btclayer2
// // cmd2: npx hardhat verify --network tac 0x08B8125aD72da5F6Cd6d6Af66360Ac08f5b78a48
// //       npx hardhat verify --network eth 0x08B8125aD72da5F6Cd6d6Af66360Ac08f5b78a48
//
