import { type DeployFunction } from 'hardhat-deploy/types'

import { EndpointId, endpointIdToNetwork } from '@layerzerolabs/lz-definitions'
import { getDeploymentAddressAndAbi } from '@layerzerolabs/lz-evm-sdk-v2'

const contractName = 'MyOFTUpgradeable'

const deploy: DeployFunction = async (hre) => {
    const { deploy } = hre.deployments
    const signer = (await hre.ethers.getSigners())[0]
    console.log(`deploying ${contractName} on network: ${hre.network.name} with ${signer.address}`)

    const eid = hre.network.config.eid as EndpointId
    const lzNetworkName = endpointIdToNetwork(eid)

    const { address } = getDeploymentAddressAndAbi(lzNetworkName, 'EndpointV2')

    if (hre.network.config.oftAdapter != null) {
        console.warn(`oftAdapter configuration found on OFT deployment, skipping OFT deployment`)
        return
    }

    const { addressOut } = await deploy(contractName, {
        from: signer.address,
        args: [address],
        log: true,
        waitConfirmations: 1,
        skipIfAlreadyDeployed: false,
        proxy: {
            proxyContract: 'OpenZeppelinTransparentProxy',
            owner: signer.address,
            execute: {
                init: {
                    methodName: 'initialize',
                    args: ['MyOFT', 'MOFT', signer.address], // TODO: add name/symbol
                },
            },
        },
    })

    console.log(`Deployed contract: ${contractName}, network: ${hre.network.name}, addressOut: ${addressOut}`)
}

deploy.tags = [contractName]

export default deploy
