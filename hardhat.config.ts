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
import './task/send'
import './type-extensions'

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
            url: 'https://polygon.llamarpc.com', //https://polygon.llamarpc.com、https://polygon-pokt.nodies.app
            accounts,
            oftAdapter: {
                tokenAddress: '0x73d090017212066322e48Ffca90BEE6d51F44a2F', // Set the token address for the OFT adapter
            },
        },
        base: {
            eid: EndpointId.BASE_V2_MAINNET,
            url: 'https://mainnet.base.org', //https://base.llamarpc.com、https://base-pokt.nodies.app
            accounts,
        },
        hardhat: {
            // Need this for testing because TestHelperOz5.sol is exceeding the compiled contract size limit
            allowUnlimitedContractSize: true,
            loggingEnabled: true, // start log ...
        },
    },
    namedAccounts: {
        deployer: {
            default: '0xD83eB140a0F464c6Af07E8d9Da301500275073BA', // wallet address of index[0], of the mnemonic in .env
        },
        admin: {
            polygon: '0xD83eB140a0F464c6Af07E8d9Da301500275073BA',
            base: '0xD83eB140a0F464c6Af07E8d9Da301500275073BA',
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
