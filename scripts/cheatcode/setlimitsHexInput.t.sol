// FILEPATH: /Users/fish/work/code/oft-contracts/scripts/cheatcode/setlimitsHexInput.t.sol
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
        configs[0] = RateLimiter.RateLimitConfig({dstEid: 30101, limit: 100000000000000000, window: 86400});

        // 编码setRateLimits调用并打印hex数据
        // 使用abi.encodeWithSelector来正确编码函数调用
        bytes memory encodedData = abi.encodeWithSelector(
            proxy.setRateLimits.selector,
            configs
        );
        
        emit log_string("Encoded setRateLimits call data (hex):");
        emit log_bytes(encodedData);

        // 测试1: 使用生成的encodedData执行调用
        emit log_string("\n=== Test 1: Using encodedData ===");
        emit log_string("Target contract address:");
        emit log_address(address(proxy));
        emit log_string("Caller address:");
        emit log_address(user);
        
        vm.prank(user);
        (bool success, bytes memory returnData) = address(proxy).call(encodedData);
        
        // 验证调用结果
        emit log_string("\nCall result:");
        if (success) {
            emit log_string("Contract call successful!");
            if (returnData.length > 0) {
                emit log_string("Return data length:");
                emit log_uint(returnData.length);
                emit log_bytes(returnData);
            }
        } else {
            emit log_string("Contract call failed!");
            emit log_string("Return data length:");
            emit log_uint(returnData.length);
        }
        
        // 测试2: 使用原始直接调用方式
        emit log_string("\n=== Test 2: Using direct function call ===");
        emit log_string("Executing direct function call...");
        vm.prank(user);
        // 这里我们直接调用，虽然不能捕获异常，但可以看到是否执行成功
        proxy.setRateLimits(configs);
        emit log_string("Direct function call completed");
    }

    function run() public {
        setUp();
        setRateLimits();
    }
}


/* 使用命令:
    forge script scripts/cheatcode/setlimitsHexInput.t.sol:MOftTest \
    --broadcast \
    --legacy
*/