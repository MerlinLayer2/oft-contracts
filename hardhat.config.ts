// Get the environment configuration from .env file
//
// To make use of automatic environment setup:
// - Duplicate .env.example file and name it .env
// - Fill in the environment variables
import 'dotenv/config'

import '@openzeppelin/hardhat-upgrades'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-waffle'
import 'hardhat-deploy-ethers'
import 'hardhat-contract-sizer'
import '@nomiclabs/hardhat-ethers'
import '@layerzerolabs/toolbox-hardhat'

import { HardhatUserConfig, HttpNetworkAccountsUserConfig } from 'hardhat/types'

import { EndpointId } from '@layerzerolabs/lz-definitions'

// Set your preferred authentication method
//
// If you prefer using a mnemonic, set a MNEMONIC environment variable
// to a valid mnemonic
const MNEMONIC = process.env.MNEMONIC

// If you prefer to be authenticated using a private key, set a PRIVATE_KEY environment variable
const PRIVATE_KEY = process.env.PRIVATE_KEY

const accounts: HttpNetworkAccountsUserConfig | undefined = MNEMONIC
    ? { mnemonic: MNEMONIC }
    : PRIVATE_KEY
        ? [PRIVATE_KEY]
        : undefined

if (accounts == null) {
    console.warn(
        'Could not find MNEMONIC or PRIVATE_KEY environment variables. It will not be possible to execute transactions in your example.'
    )
}

const config: HardhatUserConfig = {
    paths: {
        cache: 'cache/hardhat',
    },
    solidity: {
        compilers: [
            {
                version: '0.8.22',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    networks: {
        polygon: {
            eid: EndpointId.POLYGON_V2_MAINNET,
            url: 'https://polygon-pokt.nodies.app', //https://polygon.llamarpc.com、https://polygon-pokt.nodies.app
            accounts,
            oftAdapter: {
                tokenAddress: '0x32491B669cdaaC8DdE29C28EaE0cBf5A844f1d56', // Set the token address for the OFT adapter
            },
        },
        base: {
            eid: EndpointId.BASE_V2_MAINNET,
            url: 'https://base-pokt.nodies.app', //https://base.llamarpc.com、https://base-pokt.nodies.app
            accounts,
        },
        hardhat: {
            // Need this for testing because TestHelperOz5.sol is exceeding the compiled contract size limit
            allowUnlimitedContractSize: true,
        },
    },
    namedAccounts: {
        deployer: {
            default: '0x58eE238A5aB9e90D063A7B43D498782664dc5716', // wallet address of index[0], of the mnemonic in .env
        },
        admin: {
            polygon: '0x58eE238A5aB9e90D063A7B43D498782664dc5716',
            base: '0x58eE238A5aB9e90D063A7B43D498782664dc5716',
        },
    },
    layerZero: {
        // You can tell hardhat toolbox not to include any deployments (hover over the property name to see full docs)
        deploymentSourcePackages: [],
        // You can tell hardhat not to include any artifacts either
        // artifactSourcePackages: [],
    },
    etherscan: {
        apiKey: {
            polygon: 'FEK5DXKEUCFVEA2GUP48UQ3YUT7DPIXI14',
            base: 'N5EF74NP5UH4T1KDM3NM6BJ1TZAMIZE6F2',
        },
    },
}

export default config
