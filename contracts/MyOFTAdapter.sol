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

    mapping(address => bool) public isBlackListed;
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

//    // check: blacklist and pause
//    function _update(address from, address to, uint256 value) override(ERC20) internal whenNotPaused {
//        require(!isBlackListed[from], "from is in blackList");
//        ERC20._update(from, to, value);
//    }

    function setBlackList(address account, bool state) external onlyOwner {
        isBlackListed[account] = state;
        emit SetBlackList(account, state);
    }

//    /**
//     * @dev Checks and updates the rate limit before initiating a token transfer.
//     * @param _amountLD The amount of tokens to be transferred.
//     * @param _minAmountLD The minimum amount of tokens expected to be received.
//     * @param _dstEid The destination endpoint identifier.
//     * @return amountSentLD The actual amount of tokens sent.
//     * @return amountReceivedLD The actual amount of tokens received.
//     */
//    function _debit(
//        uint256 _amountLD,
//        uint256 _minAmountLD,
//        uint32 _dstEid
//    ) internal returns (uint256 amountSentLD, uint256 amountReceivedLD) {
//        _outflow(_dstEid, _amountLD);
//        return super._debit(msg.sender, _amountLD, _minAmountLD, _dstEid);
//    }

    function _send(
        SendParam calldata _sendParam,
        MessagingFee calldata _fee,
        address _refundAddress
    ) internal virtual override whenNotPaused returns (MessagingReceipt memory msgReceipt, OFTReceipt memory oftReceipt)  {
        super._send(_sendParam, _fee, _refundAddress);
    }

    // 重写 _creditTo 函数，添加暂停检查
    function _credit(
        address _to,
        uint256 _amountLD,
        uint32 _srcEid/*_srcEid*/
    ) internal override whenNotPaused returns (uint256) {
        return super._credit(_to, _amountLD, _srcEid);
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
