import { ExecutorOptionType } from "@layerzerolabs/lz-v2-utilities";
import { OAppEnforcedOption, OmniPointHardhat } from "@layerzerolabs/toolbox-hardhat";
import { EndpointId } from "@layerzerolabs/lz-definitions";
import { generateConnectionsConfig } from "@layerzerolabs/metadata-tools";

const ethContract: OmniPointHardhat = {
    eid: EndpointId.ETHEREUM_V2_MAINNET,
    contractName: 'MBTC_OFTAdaptor',
}

const tacContract: OmniPointHardhat = {
    eid: EndpointId.TAC_V2_MAINNET,
    contractName: 'MBTC_OFT',
}

const EVM_ENFORCED_OPTIONS_ETH_TO_TAC: OAppEnforcedOption[] = [
    {
        msgType: 1,
        optionType: ExecutorOptionType.LZ_RECEIVE,
        gas: 80000,
        value: 0,
    },
    {
        msgType: 2,
        optionType: ExecutorOptionType.LZ_RECEIVE,
        gas: 80000,
        value: 0,
    },
    {
        msgType: 2,
        optionType: ExecutorOptionType.COMPOSE,
        index: 0,
        gas: 80000,
        value: 0,
    },
];



export default async function () {
    // [srcContract, dstContract, [requiredDVNs, [optionalDVNs, threshold]], [srcToDstConfirmations, dstToSrcConfirmations]], [enforcedOptionsSrcToDst, enforcedOptionsDstToSrc]
    const connections = await generateConnectionsConfig([
        [ethContract, tacContract, [['LayerZero Labs'], []], [15, 10], [EVM_ENFORCED_OPTIONS_ETH_TO_TAC, EVM_ENFORCED_OPTIONS_ETH_TO_TAC]],
    ]);

    return {
        contracts: [
            { contract: ethContract },
            { contract: tacContract },
        ],
        connections,
    }
}
