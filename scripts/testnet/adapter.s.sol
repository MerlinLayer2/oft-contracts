// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.22;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { MyOFTAdapterUpgradeable } from "../../contracts/MyOFTAdapterUpgradeable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SendParam } from "@layerzerolabs/oft-evm/contracts/interfaces/IOFT.sol";

contract CallSend is Script {
    MyOFTAdapterUpgradeable oftAdapter;
    address proxyAddress;
    uint256 deployerPrivateKey;
    
    function setUp() public {
        deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        proxyAddress = vm.envAddress("ADAPTER_PROXY_ADDRESS");
        console.log("OFT Adapter Proxy Address:", proxyAddress);
        
        oftAdapter = MyOFTAdapterUpgradeable(proxyAddress);
    }

    function sendTokens() public {
        vm.startBroadcast(deployerPrivateKey);
        
        // 准备发送参数
        uint32 dstEid = 30184;
        address to = address(0x731aE88cC6E1e9e4954e8D4849dE288a45D9Fa3E);
        uint256 amount = 1e16;
        
        address token = oftAdapter.token();
        IERC20(token).approve(address(oftAdapter), amount);

        bytes memory extraOptions = "";
        bytes memory composeMsg = "";
        bytes memory oftCmd = "";

        SendParam memory sendParam = SendParam(
            dstEid,
            bytes32(uint256(uint160(to))),
            amount,
            amount,
            extraOptions,
            composeMsg,
            oftCmd
        );

        // 假设 MessagingFee 结构体有一个名为 fee 的 uint256 字段
        MessagingFee memory messagingFee = oftAdapter.quoteSend(sendParam, false);
        uint256 nativeFee = messagingFee.fee;
        
        oftAdapter.send{value: nativeFee}(
            sendParam,
            // 移除 MyOFTAdapterUpgradeable.FeeParams(nativeFee, 0)
            vm.addr(deployerPrivateKey),
            ""
        );
        
        console.log("Sent %s tokens to chain %s", amount, dstEid);
        vm.stopBroadcast();
    }

    function run() public {
        sendTokens();
    }
}