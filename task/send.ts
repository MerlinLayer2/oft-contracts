import {task} from 'hardhat/config';
import {getNetworkNameForEid, types} from '@layerzerolabs/devtools-evm-hardhat';
import {EndpointId} from '@layerzerolabs/lz-definitions';
import {addressToBytes32, Options} from '@layerzerolabs/lz-v2-utilities';
import {BigNumberish, BytesLike} from 'ethers';

//run it.
//npx hardhat sendAdapter --amount "0.1" --to "0xD83eB140a0F464c6Af07E8d9Da301500275073BA" --toeid 30184

interface Args {
    amount: string;
    to: string;
    toeid: EndpointId;
}

interface SendParam {
    dstEid: EndpointId; // Destination endpoint ID, represented as a number.
    to: BytesLike; // Recipient address, represented as bytes.
    amountLD: BigNumberish; // Amount to send in local decimals.
    minAmountLD: BigNumberish; // Minimum amount to send in local decimals.
    extraOptions: BytesLike; // Additional options supplied by the caller to be used in the LayerZero message.
    composeMsg: BytesLike; // The composed message for the send() operation.
    oftCmd: BytesLike; // The OFT command to be executed, unused in default OFT implementations.
}


// send tokens from a contract on one network to another
task('sendAdapter', 'Sends tokens from OFTAdapter')
    .addParam('to', 'contract address on network B', undefined, types.string)
    .addParam('toeid', 'destination endpoint ID', undefined, types.eid)
    .addParam('amount', 'amount to transfer in token decimals', undefined, types.string)
    .setAction(async (taskArgs: Args, {ethers, deployments}) => {
        const toAddress = taskArgs.to;
        const eidB = taskArgs.toeid;

        // Get the contract factories
        const oftDeployment = await deployments.get('MyOFTAdapterUpgradeable');

        const [signer] = await ethers.getSigners();

        console.log('----- oftDeployment.address, signer = ', oftDeployment.address, signer.address)

        // Create contract instances
        const oftContract = new ethers.Contract(oftDeployment.address, oftDeployment.abi, signer);

        const innerTokenAddress = await oftContract.token();
        const innerToken = await ethers.getContractAt('ERC20', innerTokenAddress);

        console.log('----- innerTokenAddress = ', innerTokenAddress)
        const decimals = await innerToken.decimals();
        const amount = ethers.utils.parseUnits(taskArgs.amount, decimals);
        let options = Options.newOptions().addExecutorLzReceiveOption('1300000', '0').toBytes();

        // Now you can interact with the correct contract
        const oft = oftContract;

        console.log('----- 1', decimals, amount)
        const sendParam: SendParam = {
            dstEid: eidB,
            to: addressToBytes32(toAddress),
            amountLD: amount,
            minAmountLD: amount,
            extraOptions: options,
            composeMsg: ethers.utils.arrayify('0x'), // Assuming no composed message
            oftCmd: ethers.utils.arrayify('0x'), // Assuming no OFT command is needed
        };
        console.log('----- 2', eidB, signer.address, addressToBytes32(toAddress), innerToken.address)

        console.log('----- 2 sendParam = ', sendParam)
        console.log('----- 2 sendParam.to = ', addressToBytes32(toAddress).toString(16), toAddress)
        console.log('----- 2 sendParam.options = ', options.toString(16))

        // Get the quote for the send operation
        const feeQuote = await oft.quoteSend(sendParam, false)
        console.log('----- 3')
        const nativeFee = feeQuote.nativeFee;

        console.log('----- 4', feeQuote)
        console.log(
            `sending ${taskArgs.amount} token(s) to network ${getNetworkNameForEid(eidB)} (${eidB})`,
        );
        // return
        // Approve the amount to be spent by the oft contract
        const tx = await innerToken.approve(oftDeployment.address, amount);
        await tx.wait();

        console.log('----- 5', feeQuote)
        const r = await oft.send(sendParam, {nativeFee: nativeFee, lzTokenFee: 0}, signer.address, {
            value: nativeFee, gasLimit: '1000000',
        });

        console.log('----- 6', feeQuote)
        console.log(`Send tx initiated. See: https://layerzeroscan.com/tx/${r.hash}`);
    });

// send tokens from a contract on one network to another
task('send', 'Sends tokens from either OFT')
    .addParam('to', 'contract address on network B', undefined, types.string)
    .addParam('toeid', 'destination endpoint ID', undefined, types.eid)
    .addParam('amount', 'amount to transfer in token decimals', undefined, types.string)
    .setAction(async (taskArgs: Args, {ethers, deployments}) => {
        const toAddress = taskArgs.to;
        const eidB = taskArgs.toeid;

        // Get the contract factories
        const oftDeployment = await deployments.get('MyOFTUpgradeable');

        const [signer] = await ethers.getSigners();

        // Create contract instances
        const oftContract = new ethers.Contract(oftDeployment.address, oftDeployment.abi, signer);

        const decimals = await oftContract.decimals();
        const amount = ethers.utils.parseUnits(taskArgs.amount, decimals);
        let options = Options.newOptions().addExecutorLzReceiveOption('130000', 0).toBytes();

        // Now you can interact with the correct contract
        const oft = oftContract;

        const sendParam: SendParam = {
            dstEid: eidB,
            to: addressToBytes32(toAddress),
            amountLD: amount,
            minAmountLD: amount,
            extraOptions: options,
            composeMsg: ethers.utils.arrayify('0x'), // Assuming no composed message
            oftCmd: ethers.utils.arrayify('0x'), // Assuming no OFT command is needed
        };
        // Get the quote for the send operation
        const feeQuote = await oft.quoteSend(sendParam, false);
        const nativeFee = feeQuote.nativeFee;

        console.log(
            `sending ${taskArgs.amount} token(s) to network ${getNetworkNameForEid(eidB)} (${eidB})`,
        );

        const innerTokenAddress = await oft.token();

        // // If the token address !== address(this), then this is an OFT Adapter
        // if (innerTokenAddress !== oft.address) {
        //     // If the contract is OFT Adapter, get decimals from the inner token
        //     const innerToken = ERC20Factory.attach(innerTokenAddress);

        //     // Approve the amount to be spent by the oft contract
        //     await innerToken.approve(oftDeployment.address, amount);
        // }

        const innerToken = await ethers.getContractAt('ERC20', innerTokenAddress);

        const r = await oft.send(sendParam, {nativeFee: nativeFee, lzTokenFee: 0}, signer.address, {
            value: nativeFee, gasLimit: '1000000',
        });
        console.log(`Send tx initiated. See: https://layerzeroscan.com/tx/${r.hash}`);
    });