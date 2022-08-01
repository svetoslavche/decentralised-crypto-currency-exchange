const { expect } = require('chai'); // Pulling the expect function from Chai library from Mocha in Hardhat
const { ethers } = require('hardhat'); // Pulling Ethers.js from Hardhat and saving it to a variable

const tokens = (n) => { // We want this to be a dynamic function that can convert any number we want to
  return ethers.utils.parseUnits(n.toString(), 'ether') // Convert 1000000 to Wei
}

describe('Token', () => {
  let token, accounts, deployer 

  beforeEach(async () => { // Code that gets executed before each one of the examples below
    // Fetch token from Blockchain
    const Token = await ethers.getContractFactory('Token') // Getting the factory
    token = await Token.deploy('Dapp University', 'DAPP', '1000000') // Deploying it
    
    accounts = await ethers.getSigners()
    deployer = accounts[0]
  })

  describe('Deployment', () => { // Tests go inside this separate block 
    const name = 'Dapp University'
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
      expect(await token.balanceOf(deployer.address)).to.equal(totalSupply) // Check that total supply is correct
    })
  })
})

