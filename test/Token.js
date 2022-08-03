const { expect } = require('chai'); // Pull the expect function from Chai library from Mocha in Hardhat
const { ethers } = require('hardhat'); // Pull Ethers part from Hardhat and saving it to a variable

const tokens = (n) => { // We want this to be a dynamic function that can convert any number we want to
  return ethers.utils.parseUnits(n.toString(), 'ether') // Convert 1000000 to Wei
}

describe('Token', () => { // Tests go inside this separate block 
  let token, accounts, deployer, receiver // Declaring variables here so their scope is accessible inside every single function below

  beforeEach(async () => { // Code that gets executed before each one of the examples below. Speeds up the testing time and keeps the code clean
    const Token = await ethers.getContractFactory('Token') // Fetch token from blockchain
    token = await Token.deploy('Dapp University', 'DAPP', '1000000') // Assign value to the token
    accounts = await ethers.getSigners() // Pull the getSigners() function from ethers to fetch the accounts from Hardhat node
    deployer = accounts[0] // Assign the number 0 address from Hardhat node
    receiver = accounts[1] // Assign the number 1 address to a receiver
  })

  describe('Deployment', () => { // Tests go inside this separate block 
    const name = 'Dapp University' // Declaring the variables here so we can use them later
    const symbol = 'DAPP'
    const decimals = '18'
    const totalSupply = tokens('1000000')

    it('has correct name', async () => {
      expect(await token.name()).to.equal(name) // Check that name is correct
    })

    it('has correct symbol', async () => {
      expect(await token.symbol()).to.equal(symbol) // Check that symbol is correct
    })

    it('has correct decimals', async () => {
      expect(await token.decimals()).to.equal(decimals) // Check that decimals are correct
    })

    it('has correct total supply', async () => {
      expect(await token.totalSupply()).to.equal(totalSupply) // Check that total supply is correct
    })
 
    it('assigns total supply to deployer', async () => {
      expect(await token.balanceOf(deployer.address)).to.equal(totalSupply) // Check that total supply is assigned to the deployer's address 
    })
  })

  describe('Sending Tokens', () => {
    let amount, transaction, result

    describe('Success', () => {

      beforeEach(async () => { // This beforeEach() sends tokens
        amount = tokens(100) 
        transaction = await token.connect(deployer).transfer(receiver.address, amount) 
        result = await transaction.wait()      
      })

      it('transfers token balances', async () => { // Check that tokens were transfered (balance changed)
        expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))  
        expect(await token.balanceOf(receiver.address)).to.equal(amount)
      }) 

      it('emits a Transfer event', async () => {
        const event = result.events[0]
        expect(event.event).to.equal('Transfer')

        const args = event.args // Reading the event args from console.log which we've removed from this code
        expect(args.from).to.equal(deployer.address)
        expect(args.to).to.equal(receiver.address)
        expect(args.value).to.equal(amount)
      })
    })

    describe('Failure', () => {
      it('rejects insufficient balances', async () => { // Transfer more tokens than deployer has - 100M
        const invalidAmount = tokens(100000000) 
        await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted
      })

      it('rejects invalid recepient', async () => { // Make sure you can't send tokens to random address
        const amount = tokens(100) 
        await expect(token.connect(deployer).transfer('0x00000000000000', amount)).to.be.reverted
      })
    })
  })
})
