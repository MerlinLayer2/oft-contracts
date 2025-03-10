// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OFTAdapter } from "@layerzerolabs/oft-evm/contracts/OFTAdapter.sol";
import { RateLimiter } from "@layerzerolabs/oapp-evm/contracts/oapp/utils/RateLimiter.sol";
import { IOFT, SendParam, OFTLimit, OFTReceipt, OFTFeeDetail, MessagingReceipt, MessagingFee } from "@layerzerolabs/oft-evm/contracts/interfaces/IOFT.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MyOFTAdapter is OFTAdapter, AccessControl, RateLimiter {
    string public constant version = "1.0.0";
    bytes32 public constant PAUSE_ROLE = keccak256("PAUSE_ROLE");

    bool public paused;

    event SetBlackList(
        address account,
        bool state
    );

    event PauseEvent(
        address pauseAdmin,
        bool paused
    );

    constructor(
        address _token,
        address _lzEndpoint,
        address _delegate
    ) OFTAdapter(_token, _lzEndpoint, _delegate) Ownable(_delegate) {}

    // cross out: check rateLimit and pause
    function _debit(
        address _from,
        uint256 _amountLD,
        uint256 _minAmountLD,
        uint32 _dstEid
    ) internal override(OFTAdapter) returns (uint256 amountSentLD, uint256 amountReceivedLD) {
        //check rateLimit
        _outflow(_dstEid, _amountLD);
        (amountSentLD, amountReceivedLD) = super._debit(_from, _amountLD, _minAmountLD, _dstEid);
    }

    // cross in: check pause
    function _credit(
        address _to,
        uint256 _amountLD,
        uint32 _srcEid /*_srcEid*/
    ) internal virtual override(OFTAdapter) whenNotPaused returns (uint256 amountReceivedLD) {
        (amountReceivedLD) = super._credit(_to, _amountLD, _srcEid);
    }

    /**
     * @dev Sets the rate limits based on RateLimitConfig array. Only callable by the owner or the rate limiter.
     * @param _rateLimitConfigs An array of RateLimitConfig structures defining the rate limits.
     */
    function setRateLimits(RateLimitConfig[] calldata _rateLimitConfigs) external onlyOwner {
        _setRateLimits(_rateLimitConfigs);
    }

    // pause ...
    modifier whenNotPaused() {
        require(!paused, "pause is on");
        _;
    }

    function pause() public whenNotPaused onlyRole(PAUSE_ROLE) {
        paused = true;
        emit PauseEvent(msg.sender, paused);
    }

    function unpause() public onlyOwner {
        paused = false;
        emit PauseEvent(msg.sender, paused);
    }
}
