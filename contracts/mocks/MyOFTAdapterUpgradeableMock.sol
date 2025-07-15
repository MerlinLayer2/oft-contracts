// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { MBTC_OFTAdaptor } from "../MBTC_OFTAdaptor.sol";

// @dev WARNING: This is for testing purposes only
contract MyOFTAdapterUpgradeableMock is MBTC_OFTAdaptor {
    constructor(address _token, address _lzEndpoint) MBTC_OFTAdaptor(_token, _lzEndpoint) {}
}
