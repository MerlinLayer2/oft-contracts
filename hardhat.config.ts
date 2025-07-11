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
        mainnet: {
            eid: EndpointId.ETHEREUM_V2_MAINNET,
            url: 'https://ethereum-rpc.publicnode.com', //'https://eth.llamarpc.com', //'https://ethereum-rpc.publicnode.com'
            accounts,
            gasLimit: 8000000,
            oftAdapter: {
                tokenAddress: '0x2f913c820ed3beb3a67391a6eff64e70c4b20b19', // Set the token address for the OFT adapter
                depoly: true,
            },
        },
        tac: {
            eid: EndpointId.TAC_V2_MAINNET,
            url: 'https://rpc.ankr.com/tac', //https://rpc.ankr.com/tac、https://rpc.tac.build
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
            default: '0x00301663BcA124aFF4a3B42512f3110E078f2e33', // wallet address of index[0], of the mnemonic in .env
        },
        admin: {
            polygon: '0x00301663BcA124aFF4a3B42512f3110E078f2e33',
            base: '0x00301663BcA124aFF4a3B42512f3110E078f2e33',
        },
    },
    layerZero: {
        // You can tell hardhat toolbox not to include any deployments (hover over the property name to see full docs)
        deploymentSourcePackages: [
            '@layerzerolabs/oft-evm-upgradeable',
            '@layerzerolabs/oapp-evm'
        ],
        // You can tell hardhat not to include any artifacts either
        // artifactSourcePackages: [],
    },
    etherscan: {
        apiKey: {
            mainnet: 'PTIT8NHCU5XTE993KYYYWJ4E3M5S2NP16E',
            tac: '25f2b9bf-c4bd-43b6-9790-863a116edf56',
        },
        customChains: [
            {
                network: "tac",
                chainId: 239,
                urls: {
                    apiURL: "https://explorer.tac.build/api",
                    browserURL: "https://explorer.tac.build",
                },
            },
            {
                network: "mainnet",
                chainId: 1,
                urls: {
                    apiURL: "https://api.etherscan.io/api",
                    browserURL: "https://etherscan.io",
                },
            },
        ],
    },
}

export default config
