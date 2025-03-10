// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OFT } from "@layerzerolabs/oft-evm/contracts/OFT.sol";
import { RateLimiter } from "@layerzerolabs/oapp-evm/contracts/oapp/utils/RateLimiter.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MyOFT is OFT, AccessControl, RateLimiter {
    string public constant version = "1.0.0";
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
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
        string memory _name,
        string memory _symbol,
        address _lzEndpoint,
        address _delegate
    ) OFT(_name, _symbol, _lzEndpoint, _delegate) Ownable(_delegate) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // check: blacklist and pause
    function _update(address from, address to, uint256 value) override(ERC20) internal virtual whenNotPaused {
        require(!isBlackListed[from], "from is in blackList");
        ERC20._update(from, to, value);
    }

    function setBlackList(address account, bool state) external onlyOwner {
        isBlackListed[account] = state;
        emit SetBlackList(account, state);
    }

    /**
     * @dev Checks and updates the rate limit before initiating a token transfer.
     * @param _amountLD The amount of tokens to be transferred.
     * @param _minAmountLD The minimum amount of tokens expected to be received.
     * @param _dstEid The destination endpoint identifier.
     * @return amountSentLD The actual amount of tokens sent.
     * @return amountReceivedLD The actual amount of tokens received.
     */
    function _debit(
        uint256 _amountLD,
        uint256 _minAmountLD,
        uint32 _dstEid
    ) internal returns (uint256 amountSentLD, uint256 amountReceivedLD) {
        _outflow(_dstEid, _amountLD);
        return super._debit(msg.sender, _amountLD, _minAmountLD, _dstEid);
    }

    /**
     * @dev Sets the rate limits based on RateLimitConfig array. Only callable by the owner or the rate limiter.
     * @param _rateLimitConfigs An array of RateLimitConfig structures defining the rate limits.
     */
    function setRateLimits(RateLimitConfig[] calldata _rateLimitConfigs) external onlyOwner {
        _setRateLimits(_rateLimitConfigs);
    }

    // mint-burn
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyRole(MINTER_ROLE) {
        _burn(from, amount);
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
