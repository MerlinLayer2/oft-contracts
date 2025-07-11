import { type DeployFunction } from 'hardhat-deploy/types'

import { EndpointId, endpointIdToNetwork } from '@layerzerolabs/lz-definitions'
import { getDeploymentAddressAndAbi } from '@layerzerolabs/lz-evm-sdk-v2'

const contractName = 'MyOFTAdapterUpgradeable'

const deploy: DeployFunction = async (hre) => {
    const { deploy } = hre.deployments
    const signer = (await hre.ethers.getSigners())[0]
    console.log(`deploying ${contractName} on network: ${hre.network.name} with ${signer.address}`)

    const eid = hre.network.config.eid as EndpointId
    const lzNetworkName = endpointIdToNetwork(eid)

    const { address } = getDeploymentAddressAndAbi(lzNetworkName, 'EndpointV2')

    if (hre.network.config.oftAdapter == null) {
        console.warn(`oftAdapter not configured on network config, skipping OFTWrapper deployment`)
        return
    }

    const addressOut = await deploy(contractName, {
        from: signer.address,
        args: ['0x2f913c820ed3beb3a67391a6eff64e70c4b20b19', address], // TODO: replace '0x' with the address of the ERC-20 token
        log: true,
        waitConfirmations: 1,
        skipIfAlreadyDeployed: false,
        gasLimit: 5000000, // 增加gas限制
        proxy: {
            proxyContract: 'OpenZeppelinTransparentProxy',
            owner: signer.address,
            execute: {
                init: {
                    methodName: 'initialize',
                    args: [signer.address],
                },
            },
        },
    })

    console.log(`Deployed contract: ${contractName}, network: ${hre.network.name}, addressOut: ${addressOut.address}`)
}

deploy.tags = [contractName]

export default deploy
