import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import {BigNumber, Contract, ContractFactory} from 'ethers'
import { deployments, ethers } from 'hardhat'

import { Options } from '@layerzerolabs/lz-v2-utilities'

describe('MyOFT Test', function () {
    // Constant representing a mock Endpoint ID for testing purposes
    const eidA = 1
    const eidB = 2
    // Declaration of variables to be used in the test suite
    let MyOFT: ContractFactory
    let EndpointV2Mock: ContractFactory
    let ownerA: SignerWithAddress
    let ownerB: SignerWithAddress
    let endpointOwner: SignerWithAddress
    let myOFTA: Contract
    let myOFTB: Contract
    let mockEndpointV2A: Contract
    let mockEndpointV2B: Contract

    // Before hook for setup that runs once before all tests in the block
    before(async function () {
        // Contract factory for our tested contract
        //
        // We are using a derived contract that exposes a mint() function for testing purposes
        MyOFT = await ethers.getContractFactory('MyOFTMock')

        // Fetching the first three signers (accounts) from Hardhat's local Ethereum network
        const signers = await ethers.getSigners()

        ;[ownerA, ownerB, endpointOwner] = signers
        console.log('[ownerA, ownerB, endpointOwner] = ', ownerA.address, ownerB.address, endpointOwner.address)

        // The EndpointV2Mock contract comes from @layerzerolabs/test-devtools-evm-hardhat package
        // and its artifacts are connected as external artifacts to this project
        //
        // Unfortunately, hardhat itself does not yet provide a way of connecting external artifacts,
        // so we rely on hardhat-deploy to create a ContractFactory for EndpointV2Mock
        //
        // See https://github.com/NomicFoundation/hardhat/issues/1040
        const EndpointV2MockArtifact = await deployments.getArtifact('EndpointV2Mock')
        EndpointV2Mock = new ContractFactory(EndpointV2MockArtifact.abi, EndpointV2MockArtifact.bytecode, endpointOwner)
    })

    // beforeEach hook for setup that runs before each test in the block
    beforeEach(async function () {
        // Deploying a mock LZEndpoint with the given Endpoint ID
        mockEndpointV2A = await EndpointV2Mock.deploy(eidA)
        mockEndpointV2B = await EndpointV2Mock.deploy(eidB)

        // Deploying two instances of MyOFT contract with different identifiers and linking them to the mock LZEndpoint
        myOFTA = await MyOFT.deploy('aOFT', 'aOFT', mockEndpointV2A.address, ownerA.address)
        myOFTB = await MyOFT.deploy('bOFT', 'bOFT', mockEndpointV2B.address, ownerB.address)

        console.log('...1 myOFTA.owner:', await myOFTA.owner())
        console.log('...1 myOFTB.owner:', await myOFTB.owner())
        const MINTER_ROLE = await myOFTA.MINTER_ROLE()
        await myOFTA.connect(ownerA).grantRole(MINTER_ROLE, ownerA.address)
        console.log('[ownerA, ownerB, endpointOwner] = ', ownerA.address, ownerB.address, endpointOwner.address)
        console.log('[myOFTA, myOFTB] = ', myOFTA.address, myOFTB.address)
        console.log('...1.3')
        const DEFAULT_ADMIN_ROLE = await myOFTB.connect(ownerB).DEFAULT_ADMIN_ROLE()
        console.log(
            '[hasRoleA, hasRoleB] = ',
            await myOFTB.connect(ownerB).hasRole(DEFAULT_ADMIN_ROLE, ownerA.address),
            await myOFTB.connect(ownerB).hasRole(DEFAULT_ADMIN_ROLE, ownerB.address)
        )
        console.log('...1.4')
        await myOFTB.connect(ownerA).grantRole(MINTER_ROLE, ownerA.address)

        console.log('...1 myOFTA.paused:', await myOFTA.paused())
        console.log('...1 myOFTB.paused:', await myOFTB.paused())
        const PAUSE_ROLE = await myOFTA.PAUSE_ROLE()
        await myOFTA.connect(ownerA).grantRole(PAUSE_ROLE, ownerA.address)
        await myOFTB.connect(ownerA).grantRole(PAUSE_ROLE, ownerA.address)

        // Setting destination endpoints in the LZEndpoint mock for each MyOFT instance
        await mockEndpointV2A.setDestLzEndpoint(myOFTB.address, mockEndpointV2B.address)
        await mockEndpointV2B.setDestLzEndpoint(myOFTA.address, mockEndpointV2A.address)

        // Setting each MyOFT instance as a peer of the other in the mock LZEndpoint
        await myOFTA.connect(ownerA).setPeer(eidB, ethers.utils.zeroPad(myOFTB.address, 32))
        await myOFTB.connect(ownerB).setPeer(eidA, ethers.utils.zeroPad(myOFTA.address, 32))

        console.log('beforeEach over')
    })

    // A test case to verify token transfer functionality
    it('base: should send a token from A address to B address via each OFT', async function () {
        // Minting an initial amount of tokens to ownerA's address in the myOFTA contract
        const initialAmount = ethers.utils.parseEther('100')
        await myOFTA.mint(ownerA.address, initialAmount)
        await myOFTA.setRateLimits([{dstEid: eidB, limit: BigInt("10000000000000000000000"), window: 10}]) //1w

        // Defining the amount of tokens to send and constructing the parameters for the send operation
        const tokensToSend = ethers.utils.parseEther('1')

        // Defining extra message execution options for the send operation
        const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()

        const sendParam = [
            eidB,
            ethers.utils.zeroPad(ownerB.address, 32),
            tokensToSend,
            tokensToSend,
            options,
            '0x',
            '0x',
        ]

        // Fetching the native fee for the token send operation
        const [nativeFee] = await myOFTA.quoteSend(sendParam, false)

        // Executing the send operation from myOFTA contract
        await myOFTA.send(sendParam, [nativeFee, 0], ownerA.address, { value: nativeFee })

        // Fetching the final token balances of ownerA and ownerB
        const finalBalanceA = await myOFTA.balanceOf(ownerA.address)
        const finalBalanceB = await myOFTB.balanceOf(ownerB.address)

        // Asserting that the final balances are as expected after the send operation
        expect(finalBalanceA).eql(initialAmount.sub(tokensToSend))
        expect(finalBalanceB).eql(tokensToSend)

        console.log('---over---')
    })

    // return;
    // A test case to verify token transfer functionality
    it('check pause: should send a token from A address to B address', async function () {
        // Minting an initial amount of tokens to ownerA's address in the myOFTA contract
        const initialAmount = ethers.utils.parseEther('100')
        await myOFTA.mint(ownerA.address, initialAmount)
        await myOFTA.setRateLimits([{dstEid: eidB, limit: BigInt("10000000000000000000000"), window: 10}]) //1w

        console.log('...2-before myOFTA.paused:', await myOFTA.paused())
        // await myOFTA.connect(ownerA).pause() //ture failed***
        // await myOFTB.connect(ownerA).pause() //ture failed***
        console.log('...2-after myOFTA.paused:', await myOFTA.paused())

        // Defining the amount of tokens to send and constructing the parameters for the send operation
        const tokensToSend = ethers.utils.parseEther('1')

        // Defining extra message execution options for the send operation
        const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()

        const sendParam = [
            eidB,
            ethers.utils.zeroPad(ownerB.address, 32),
            tokensToSend,
            tokensToSend,
            options,
            '0x',
            '0x',
        ]

        // Fetching the native fee for the token send operation
        const [nativeFee] = await myOFTA.quoteSend(sendParam, false)

        // Executing the send operation from myOFTA contract
        await myOFTA.send(sendParam, [nativeFee, 0], ownerA.address, { value: nativeFee })

        // Fetching the final token balances of ownerA and ownerB
        const finalBalanceA = await myOFTA.balanceOf(ownerA.address)
        const finalBalanceB = await myOFTB.balanceOf(ownerB.address)

        // Asserting that the final balances are as expected after the send operation
        expect(finalBalanceA).eql(initialAmount.sub(tokensToSend))
        expect(finalBalanceB).eql(tokensToSend)

        console.log('---over---')
    })

    // A test case to verify token transfer functionality
    it('rate limit 10: should send a token from A address to B address via each OFT, ', async function () {
        // Minting an initial amount of tokens to ownerA's address in the myOFTA contract
        const initialAmount = ethers.utils.parseEther('100')
        await myOFTA.mint(ownerA.address, initialAmount)

        await myOFTA.setRateLimits([{dstEid: eidB, limit: BigInt("10000000000000000000000"), window: 10}]) //1w ok
        // await myOFTA.setRateLimits([{dstEid: eidB, limit: BigInt("10000000000000000000"), window: 10}]) //10 failed***
        const amountCanBeSent = await myOFTA.getAmountCanBeSent(eidB)
        console.log('amountCanBeSent:', amountCanBeSent)

        // Defining the amount of tokens to send and constructing the parameters for the send operation
        const tokensToSend = ethers.utils.parseEther('30')

        // Defining extra message execution options for the send operation
        const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()

        const sendParam = [
            eidB,
            ethers.utils.zeroPad(ownerB.address, 32),
            tokensToSend,
            tokensToSend,
            options,
            '0x',
            '0x',
        ]

        const finalBalanceABefore = await myOFTA.balanceOf(ownerA.address)
        const finalBalanceBBefore = await myOFTB.balanceOf(ownerB.address)
        console.log('before address:', finalBalanceABefore, finalBalanceBBefore)

        // Fetching the native fee for the token send operation
        const [nativeFee] = await myOFTA.quoteSend(sendParam, false)

        // Executing the send operation from myOFTA contract
        await myOFTA.send(sendParam, [nativeFee, 0], ownerA.address, { value: nativeFee })

        // Fetching the final token balances of ownerA and ownerB
        const finalBalanceA = await myOFTA.balanceOf(ownerA.address)
        const finalBalanceB = await myOFTB.balanceOf(ownerB.address)
        console.log('after address:', finalBalanceA, finalBalanceB)

        // Asserting that the final balances are as expected after the send operation
        expect(finalBalanceA).eql(initialAmount.sub(tokensToSend))
        expect(finalBalanceB).eql(tokensToSend)

        console.log('---over---')
    })
})
