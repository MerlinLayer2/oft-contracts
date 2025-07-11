import { ExecutorOptionType } from "@layerzerolabs/lz-v2-utilities";
import { OAppEnforcedOption, OmniPointHardhat } from "@layerzerolabs/toolbox-hardhat";
import { EndpointId } from "@layerzerolabs/lz-definitions";
import { generateConnectionsConfig } from "@layerzerolabs/metadata-tools";

const ethContract: OmniPointHardhat = {
    eid: EndpointId.ETHEREUM_V2_MAINNET,
    contractName: 'MyOFTAdapterUpgradeable',
}

const tacContract: OmniPointHardhat = {
    eid: EndpointId.TAC_V2_MAINNET,
    contractName: 'MyOFTUpgradeable',
}

export default async function () {
    return {
        contracts: [{ contract: ethContract }, { contract: tacContract }],
        connections: [
            {
                // Sets the peer `from -> to`. Optional, you do not have to connect all pathways.
                from: ethContract,
                to: tacContract,
            },
            {
                // Sets the peer `from -> to`. Optional, you do not have to connect all pathways.
                from: tacContract,
                to: ethContract,
            },
        ],
    }
}
