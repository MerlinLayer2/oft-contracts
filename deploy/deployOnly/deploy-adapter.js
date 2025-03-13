const { ethers, upgrades } = require('hardhat');

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pathOutputJson = path.join(__dirname, '../../deploy_output.json');
let deployOutput = {};
if (fs.existsSync(pathOutputJson)) {
    deployOutput = require(pathOutputJson);
}
console.log(`Bridge Contract Proxy Addr: ${deployOutput.bitmapRentContract}`)

async function main() {
    let [owner] = await ethers.getSigners();
    console.log(`Using owner account: ${await owner.getAddress()}`)

    // 1. Get the contract to deploy
    const BridgeFactory = await ethers.getContractFactory('MyOFTAdapterUpgradeable', owner);
    console.log('Deploying ...');

    // 2. Instantiating a new Box smart contract
    const bridge = await BridgeFactory.deploy(
        '0x73d090017212066322e48Ffca90BEE6d51F44a2F',
        '0xD83eB140a0F464c6Af07E8d9Da301500275073BA'
    );

    // 3. Waiting for the deployment to resolve
    // await bridge.waitForDeployment();

    // 4. Use the contract instance to get the contract address
    console.log('BitmapRent deployed to:', bridge.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

// deploy+verify.
// cmd1: npx hardhat run scripts/deployOnly/deploy-logic.js --network btclayer2
// cmd2: npx hardhat verify --network btclayer2 0xB354DE4A8072BBD6e32bB152D72287475CAAeEDe

