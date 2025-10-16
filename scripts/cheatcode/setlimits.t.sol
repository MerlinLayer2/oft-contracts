// FILEPATH: /Users/fish/work/code/oft-contracts/scripts/cheatcode/setlimits.t.sol
  // SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import "forge-std/Test.sol";
import "../../contracts/MBTC_OFT.sol";

contract MOftTest is Test {
    MBTC_OFT proxy;

    function setUp() public {
        vm.createSelectFork("https://rpc.tac.build");  // fork MERLIN 主网
        proxy = MBTC_OFT(payable(0xe82dbD543FD729418613d68Cd1E8FC67b0f46E31)); //tac OFT合约地址
    }

    function setRateLimits() public {
        address user = address(0xB40d1854533dF1AF735a46Fa47B8A825B54145bC);
        RateLimiter.RateLimitConfig[] memory configs = new RateLimiter.RateLimitConfig[](1);
        configs[0] = RateLimiter.RateLimitConfig({dstEid: 30101, limit: 20000000000000000000, window: 86400});

        // 模拟用户调用unstake函数
        vm.prank(user);
        proxy.setRateLimits(configs);
    }

    function run() public {
        setUp();
        setRateLimits();
    }
}


/* 使用命令:
    forge script scripts/cheatcode/setlimits.t.sol:MOftTest \
    --broadcast \
    --legacy
*/