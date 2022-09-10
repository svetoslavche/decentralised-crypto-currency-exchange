const { expect } = require('chai'); // Pull the expect function from Chai library from Mocha in Hardhat
const { ethers } = require('hardhat'); // Pull Ethers part from Hardhat and saving it to a variable

const tokens = (n) => { // We want this to be a dynamic function that can convert any number we want to
  return ethers.utils.parseUnits(n.toString(), 'ether') // Convert 1000000 to Wei
}

describe('Exchange', () => {  
  let deployer, feeAccount, exchange // Declaring variables here so their scope is accessible inside every single function below

  const feePercent = 10 // State variable which is never going to change

  beforeEach(async () => { // Code that gets executed before each one of the examples below. Speeds up the testing time and keeps the code clean
    const Exchange = await ethers.getContractFactory('Exchange') // Fetch Exchange from blockchain
    const Token = await ethers.getContractFactory('Token') // Fetch Token from blockchain

    token1 = await Token.deploy('Dapp University', 'DAPP', '1000000') // Deploy token one
    
    accounts = await ethers.getSigners() // Pull the getSigners() function from ethers to fetch the accounts from Hardhat node
    deployer = accounts[0] // Assign the number 0 address to a deployer from Hardhat node
    feeAccount = accounts[1] // Assign the number 1 address to the Exchange
    user1 = accounts[2] // Assign account 2 to user one 
    
    let transaction = await token1.connect(deployer).transfer(user1.address, tokens(100)) // Give the user 100 tokens for the test
    await transaction.wait()
    
    exchange = await Exchange.deploy(feeAccount.address, feePercent) // Assign address and percent to the deploy function
  })

  describe('Deployment', () => { // Tests go inside this separate block 

    it('tracks the fee account', async () => {
      expect(await exchange.feeAccount()).to.equal(feeAccount.address) // Check that the destination address for the fees is correct
    })

    it('tracks the fee percent', async () => {
      expect(await exchange.feePercent()).to.equal(feePercent) // Check that the feePercent is correct
    })
  })

  describe('Depositing Tokens', () => {
    let transaction, result
    let amount = tokens(10)

    describe('Success', () => {
      
      beforeEach(async () => { 

        transaction = await token1.connect(user1).approve(exchange.address, amount) // Approve token
        result = await transaction.wait()

        transaction = await exchange.connect(user1).depositToken(token1.address, amount) // Deposit token
        result = await transaction.wait()
      })

      it('tracks the token deposit', async () => {
        expect(await token1.balanceOf(exchange.address)).to.equal(amount)
        expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount)
        expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
      }) 

      it('emits a Deposit event', async () => {
        const event = result.events[1] // 2 events are emitted
        expect(event.event).to.equal('Deposit')

        const args = event.args
        expect(args.token).to.equal(token1.address)
        expect(args.user).to.equal(user1.address)
        expect(args.amount).to.equal(amount)
        expect(args.balance).to.equal(amount)
      })

    })

    describe('Failure', () => {
      it('fails when no tokens are approved', async () => { // Don't approve any tokens before depositing
        await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted 
      })
    })

  })

  describe('Withdrawing Tokens', () => {
    let transaction, result
    let amount = tokens(10)

    describe('Success', () => {
      
      beforeEach(async () => { 

        transaction = await token1.connect(user1).approve(exchange.address, amount) // Approve tokens
        result = await transaction.wait()

        transaction = await exchange.connect(user1).depositToken(token1.address, amount) // Deposit tokens
        result = await transaction.wait()

        transaction = await exchange.connect(user1).withdrawToken(token1.address, amount) // Withdraw tokens
        result = await transaction.wait()

      })

      it('withdraw token funds', async () => {
        expect(await token1.balanceOf(exchange.address)).to.equal(0)
        expect(await exchange.tokens(token1.address, user1.address)).to.equal(0)
        expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(0)
      }) 

      it('emits a Withdraw event', async () => {
        const event = result.events[1] // 2 events are emitted
        expect(event.event).to.equal('Withdraw')

        const args = event.args
        expect(args.token).to.equal(token1.address)
        expect(args.user).to.equal(user1.address)
        expect(args.amount).to.equal(amount)
        expect(args.balance).to.equal(0)
      })

})

    describe('Failure', () => {
      it('fails for insufficient balances', async () => { // Attempt to withdraw tokens without depositing
        await expect(exchange.connect(user1).withdrawToken(token1.address, amount)).to.be.reverted 
      })
    })

  })

  describe('Checking Balances', () => {
    let transaction, result
    let amount = tokens(1)

    beforeEach(async () => { 

      transaction = await token1.connect(user1).approve(exchange.address, amount) // Approve token
        result = await transaction.wait()

      transaction = await exchange.connect(user1).depositToken(token1.address, amount) // Deposit token
        result = await transaction.wait()
      })

      it('returns user balance', async () => {
        expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
      })    

  })

})
