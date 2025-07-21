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
        'optimism-testnet': {
            eid: EndpointId.OPTSEP_V2_TESTNET,
            url: 'https://optimism-sepolia.gateway.tenderly.co',
            accounts,
            gasLimit: 8000000,
            // gasPrice: 1000000000, // 1 gwei
            // gasMultiplier: 1.5, // 增加gas乘数
            oftAdapter: {
                tokenAddress: '0x5841072dEdF95e16beC3782Bb6E0A54955B6A9AE', // Set the token address for the OFT adapter
                depoly: true,
            },
        },
        'arbitrum-testnet': {
            eid: EndpointId.ARBSEP_V2_TESTNET,
            url: 'https://arbitrum-sepolia.gateway.tenderly.co',
            accounts,
            gas: 10000000, // 增加到1000万gas
            gasPrice: 2000000000, // 2 Gwei
            gasMultiplier: 2, // 双倍gas乘数
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
            'optimism-testnet': '0xD83eB140a0F464c6Af07E8d9Da301500275073BA',
            'arbitrum-testnet': '0xD83eB140a0F464c6Af07E8d9Da301500275073BA',
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
            'optimism-testnet': '55e95e70-c95e-420d-91fc-c4777e3d463c',
            'arbitrum-testnet': 'xxx',
        },
        customChains: [
            {
                network: "optimism-testnet",
                chainId: 11155420,
                urls: {
                    apiURL: "https://testnet-explorer.optimism.io/api",
                    browserURL: "https://testnet-explorer.optimism.io"
                }
            },
            {
                network: "arbitrum-testnet",
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
