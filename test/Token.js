const { expect } = require('chai'); // pulling the expect function from Chai library from Mocha in Hardhat
const { ethers } = require('hardhat'); // pulling Ethers.js from Hardhat and saving it to a variable

const tokens = (n) => { // we want this to be a dynamic function that can convert any number we want to
  return ethers.utils.parseUnits(n.toString(), 'ether') // convert 1000000 to Wei
}

describe('Token', () => {
  let token     

  beforeEach(async () => { // code that gets executed before each one of the examples below
    // Fetch token from Blockchain
    const Token = await ethers.getContractFactory('Token') // getting the factory
    token = await Token.deploy('Dapp University', 'DAPP', '1000000') // Deploying it    
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
      expect(await token.totalSupply()).to.equal(totalSupply) // Check that decimals are correct
    })

    })


})
