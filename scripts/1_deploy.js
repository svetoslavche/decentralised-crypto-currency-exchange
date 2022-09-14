async function main() {
  console.log(`Preparing deployment...\n`) // Console logging about what we're going to do

  // Fetch the contracts
  const Token = await ethers.getContractFactory('Token')
  const Exchange = await ethers.getContractFactory('Exchange')

  // Fetch the accounts and log the addresses
  const accounts = await ethers.getSigners()
  console.log(`Accounts fetched:\n${accounts[0].address}\n${accounts[1].address}\n`)

  // Deploy contracts and log the addresses
  const dapp = await Token.deploy('Dapp University', 'DAPP', '1000000')
  await dapp.deployed()
  console.log(`DAPP Deployed to: ${dapp.address}`)

  const mETH = await Token.deploy('mETH', 'mETH', '1000000')
  await mETH.deployed()
  console.log(`mETH Deployed to: ${mETH.address}`) 

  const mDAI = await Token.deploy('mDAI', 'mDAI', '1000000')
  await mDAI.deployed()
  console.log(`mDAI Deployed to: ${mDAI.address}`) 

  const exchange = await Exchange.deploy(accounts[1].address, 10) // The exchange is going to use the feeAccount with 10% fee
  await exchange.deployed()
  console.log(`Exchange Deployed to: ${exchange.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
