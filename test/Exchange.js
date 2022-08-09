const { expect } = require('chai'); // Pull the expect function from Chai library from Mocha in Hardhat
const { ethers } = require('hardhat'); // Pull Ethers part from Hardhat and saving it to a variable

const tokens = (n) => { // We want this to be a dynamic function that can convert any number we want to
  return ethers.utils.parseUnits(n.toString(), 'ether') // Convert 1000000 to Wei
}

describe('Exchange', () => { // Tests go inside this separate block 
  let deployer, feeAccount, exchange // Declaring variables here so their scope is accessible inside every single function below

  const feePercent = 10 // State variable which is never going to change

  beforeEach(async () => { // Code that gets executed before each one of the examples below. Speeds up the testing time and keeps the code clean
    accounts = await ethers.getSigners() // Pull the getSigners() function from ethers to fetch the accounts from Hardhat node
    deployer = accounts[0] // Assign the number 0 address to a deployer from Hardhat node
    feeAccount = accounts[1] // Assign the number 1 address to the Exchange

    const Exchange = await ethers.getContractFactory('Exchange') // Fetch Exchange from blockchain
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
})
