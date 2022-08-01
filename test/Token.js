const { expect } = require('chai'); // Pull the expect function from Chai library from Mocha in Hardhat
const { ethers } = require('hardhat'); // Pull Ethers part from Hardhat and saving it to a variable

const tokens = (n) => { // We want this to be a dynamic function that can convert any number we want to
  return ethers.utils.parseUnits(n.toString(), 'ether') // Convert 1000000 to Wei
}

describe('Token', () => { // Tests go inside this separate block 
  let token, accounts, deployer // Declaring variables here so their scope is accessible inside every single function below

  beforeEach(async () => { // Code that gets executed before each one of the examples below. Speeds up the testing time and keeps the code clean
    const Token = await ethers.getContractFactory('Token') // Fetch token from blockchain
    token = await Token.deploy('Dapp University', 'DAPP', '1000000') // Assign value to the token
    accounts = await ethers.getSigners() // Pull the getSigners() function from ethers to fetch the accounts
    deployer = accounts[0] // Assign the number 0 address from the hardhat node
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
})

