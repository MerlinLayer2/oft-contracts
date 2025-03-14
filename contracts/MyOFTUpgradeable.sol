// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { RateLimiter } from "@layerzerolabs/oapp-evm/contracts/oapp/utils/RateLimiter.sol";
import { OFTUpgradeable } from "@layerzerolabs/oft-evm-upgradeable/contracts/oft/OFTUpgradeable.sol";

contract MyOFTUpgradeable is OFTUpgradeable, RateLimiter {
    string public constant version = "1.0.0";

    address public mintAdmin;
    address public pauseAdmin;
    bool public paused;

    event MintAdminChanged(
        address adminSetter,
        address oldMintAdmin,
        address mintAdmin
    );

    event PauseAdminChanged(
        address adminSetter,
        address oldAddress,
        address newAddress
    );

    event PauseEvent(
        address pauseAdmin,
        bool paused
    );

    constructor(address _lzEndpoint) OFTUpgradeable(_lzEndpoint) {
        _disableInitializers();
    }

    function initialize(string memory _name, string memory _symbol, address _delegate) public initializer {
        __OFT_init(_name, _symbol, _delegate);
        __Ownable_init(_delegate);
        mintAdmin = _delegate;
    }

    // cross out: check rateLimit (burn)
    function _debit(
        address _from,
        uint256 _amountLD,
        uint256 _minAmountLD,
        uint32 _dstEid
    ) internal override(OFTUpgradeable) returns (uint256 amountSentLD, uint256 amountReceivedLD) {
        _outflow(_dstEid, _amountLD);
        (amountSentLD, amountReceivedLD) = super._debit(_from, _amountLD, _minAmountLD, _dstEid);
    }

    // cross in: check pause (mint)
    function _credit(
        address _to,
        uint256 _amountLD,
        uint32 _srcEid /*_srcEid*/
    ) internal virtual override(OFTUpgradeable) whenNotPaused returns (uint256 amountReceivedLD) {
        (amountReceivedLD) = super._credit(_to, _amountLD, _srcEid);
    }

    /**
     * @dev Sets the rate limits based on RateLimitConfig array. Only callable by the owner or the rate limiter.
     * @param _rateLimitConfigs An array of RateLimitConfig structures defining the rate limits.
     */
    function setRateLimits(RateLimitConfig[] calldata _rateLimitConfigs) external onlyOwner {
        _setRateLimits(_rateLimitConfigs);
    }

    function mint(address to, uint256 amount) external onlyMintAdmin {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyMintAdmin {
        _burn(from, amount);
    }

    function transfer(address to, uint256 amount) public virtual override whenNotPaused returns (bool) {
        return super.transfer(to, amount);
    }

    function transferFrom(address from, address to, uint256 value) public virtual override whenNotPaused returns (bool) {
        return super.transferFrom(from, to, value);
    }

    // mintAdmin
    function setMintAdmin(address _account) public onlyOwner {
        require(_account != address (0), "invalid _account");
        address oldMintAdmin = mintAdmin;
        mintAdmin = _account;
        emit MintAdminChanged(msg.sender, oldMintAdmin, mintAdmin);
    }

    modifier onlyMintAdmin() {
        require(msg.sender == mintAdmin, "not mint admin");
        _;
    }

    // pause ...
    function setPauseAdmin(address _account) public onlyOwner {
        require(_account != address (0), "invalid _account");
        address oldPauseAdmin = pauseAdmin;
        pauseAdmin = _account;
        emit PauseAdminChanged(msg.sender, oldPauseAdmin, pauseAdmin);
    }

    modifier whenNotPaused() {
        require(!paused, "pause is on");
        _;
    }

    function pause() public whenNotPaused {
        paused = true;
        emit PauseEvent(msg.sender, paused);
    }

    function unpause() public onlyOwner {
        paused = false;
        emit PauseEvent(msg.sender, paused);
    }
}
