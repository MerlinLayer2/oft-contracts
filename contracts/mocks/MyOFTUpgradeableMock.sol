// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { MBTC_OFT } from "../MBTC_OFT.sol";

// @dev WARNING: This is for testing purposes only
contract MyOFTUpgradeableMock is MBTC_OFT {
    constructor(address _lzEndpoint) MBTC_OFT(_lzEndpoint) {}

//    function mint(address _to, uint256 _amount) public {
//        _mint(_to, _amount);
//    }

}
