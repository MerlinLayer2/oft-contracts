import { ExecutorOptionType } from "@layerzerolabs/lz-v2-utilities";
import { OAppEnforcedOption, OmniPointHardhat } from "@layerzerolabs/toolbox-hardhat";
import { EndpointId } from "@layerzerolabs/lz-definitions";
import { generateConnectionsConfig } from "@layerzerolabs/metadata-tools";

const polygonContract: OmniPointHardhat = {
    eid: EndpointId.POLYGON_V2_MAINNET,
    contractName: 'MyOFTAdapterUpgradeable',
}

const baseContract: OmniPointHardhat = {
    eid: EndpointId.BASE_V2_MAINNET,
    contractName: 'MyOFTUpgradeable',
}

export default async function () {
    return {
        contracts: [{ contract: polygonContract }, { contract: baseContract }],
        connections: [
            {
                // Sets the peer `from -> to`. Optional, you do not have to connect all pathways.
                from: polygonContract,
                to: baseContract,
            },
            {
                // Sets the peer `from -> to`. Optional, you do not have to connect all pathways.
                from: baseContract,
                to: polygonContract,
            },
        ],
    }
}
