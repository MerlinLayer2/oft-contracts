import { ExecutorOptionType } from "@layerzerolabs/lz-v2-utilities";
import { OAppEnforcedOption, OmniPointHardhat } from "@layerzerolabs/toolbox-hardhat";
import { EndpointId } from "@layerzerolabs/lz-definitions";
import { generateConnectionsConfig } from "@layerzerolabs/metadata-tools";

const polygonContract: OmniPointHardhat = {
    eid: EndpointId.POLYGON_V2_MAINNET,
    contractName: 'MBTC_OFTAdapter',
}

const baseContract: OmniPointHardhat = {
    eid: EndpointId.BASE_V2_MAINNET,
    contractName: 'MBTC_OFT',
}

export default async function () {
    return {
        contracts: [{ contract: polygonContract }, { contract: baseContract }],
        connections: [
            {
                // Sets the peer `from -> to`. Optional, you do not have to connect all pathways.
                from: polygonContract,
                to: baseContract,
                // Optional Configuration
                config: {
                    sendConfig: {
                        ulnConfig: {
                            confirmations: 15n,
                            requiredDVNs: [
                                '0x23de2fe932d9043291f870324b74f820e11dc81a',
                                '0xd56e4eab23cb81f43168f9f45211eb027b9ac7cc',
                                // '0xf0809f6e760a5452ee567975eda7a28da4a83d38',
                            ],
                            optionalDVNs: [],
                            optionalDVNThreshold: 0
                        }
                    },


                    receiveConfig: {
                        ulnConfig: {
                            confirmations: 10n,
                            requiredDVNs: [
                                '0x23de2fe932d9043291f870324b74f820e11dc81a',
                                '0xd56e4eab23cb81f43168f9f45211eb027b9ac7cc',
                                // '0xf0809f6e760a5452ee567975eda7a28da4a83d38',
                            ],
                            optionalDVNs: [],
                            optionalDVNThreshold: 0
                        }
                    },

                    // Optional Enforced Options Configuration
                    // @dev Controls how much gas to use on the `to` chain, which the user pays for on the source `from` chain.
                    enforcedOptions: [
                        {
                            msgType: 1,
                            optionType: ExecutorOptionType.LZ_RECEIVE,
                            gas: 100000,
                            value: 0,
                        },
                        {
                            msgType: 2,
                            optionType: ExecutorOptionType.LZ_RECEIVE,
                            gas: 100000,
                            value: 0,
                        },
                        {
                            msgType: 2,
                            optionType: ExecutorOptionType.COMPOSE,
                            index: 0,
                            gas: 100000,
                            value: 0,
                        },
                    ],
                },
            },
            {
                // Sets the peer `from -> to`. Optional, you do not have to connect all pathways.
                from: baseContract,
                to: polygonContract,
                // Optional Configuration
                config: {
                    sendConfig: {
                        ulnConfig: {
                            confirmations: 10n,
                            requiredDVNs: [
                                '0x9e059a54699a285714207b43b055483e78faac25',
                                '0xd56e4eab23cb81f43168f9f45211eb027b9ac7cc'
                            ],
                            optionalDVNs: [],
                            optionalDVNThreshold: 0
                        }
                    },

                    receiveConfig: {
                        ulnConfig: {
                            confirmations: 15n,
                            requiredDVNs: [
                                '0x9e059a54699a285714207b43b055483e78faac25',
                                '0xd56e4eab23cb81f43168f9f45211eb027b9ac7cc'
                            ],
                            optionalDVNs: [],
                            optionalDVNThreshold: 0,
                        },
                    },

                    // Optional Enforced Options Configuration
                    // @dev Controls how much gas to use on the `to` chain, which the user pays for on the source `from` chain.
                    enforcedOptions: [
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
                    ],
                },
            },
        ],
    }
}
