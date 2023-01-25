const config = require('../src/config.json')

const tokens = (n) => { // We want this to be a dynamic function that can convert any number we want to
  return ethers.utils.parseUnits(n.toString(), 'ether') // Convert 1000000 to Wei
}

const wait = (seconds) => { // Waiting command for an arbitrary amount of time to make sure the script doesn't time out 
  const milliseconds = seconds * 1000
  return new Promise(resolve => setTimeout(resolve,milliseconds))
}

async function main() {
  // Fetch accounts from wallet - these are unlocked
  const accounts = await ethers.getSigners()

  // Fetch network
  const { chainId } = await ethers.provider.getNetwork()  
  console.log("Using chainId:", chainId)

  // Fetch deployed tokens
  const DApp = await ethers.getContractAt('Token', config[chainId].DApp.address)
  console.log(`Dapp Token fetched: ${DApp.address}\n`)

  const mETH = await ethers.getContractAt('Token', config[chainId].mETH.address)
  console.log(`mETH Token fetched: ${mETH.address}\n`)

  const mDAI = await ethers.getContractAt('Token', config[chainId].mDAI.address)
  console.log(`mDAI Token fetched: ${mDAI.address}\n`)

  // Fetch the deployed exchange
  const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address)
  console.log(`Exchange fetched: ${exchange.address}\n`)

  // Set up users and some tokens
  const sender = accounts[0]
  const receiver = accounts[1]
  let amount = tokens(10000)

  // user1 transfers 10,000 mETH to user2
  let transaction, result
  transaction = await mETH.connect(sender).transfer(receiver.address, amount)
  console.log(`Transferred ${amount} tokens from ${sender.address} to ${receiver.address}\n`)

  // Set up exchange users
  const user1 = accounts[0]
  const user2 = accounts[1]
  amount = tokens(10000)

  // user1 approves deposit of 10,000 Dapp
  transaction = await DApp.connect(user1).approve(exchange.address, amount)
  await transaction.wait()
  console.log(`Approved ${amount} tokens from ${user1.address}`)

  // Deposit tokens to the exchange on user1's behalf
  transaction = await exchange.connect(user1).depositToken(DApp.address, amount)
  await transaction.wait()
  console.log(`Deposited ${amount} Ether from ${user1.address}\n`)

  // user2 approves deposit of mETH
  transaction = await mETH.connect(user2).approve(exchange.address, amount)
  await transaction.wait()
  console.log(`Approved ${amount} tokens from ${user2.address}`)

  // Deposit tokens to the exchange on user2's behalf
  transaction = await exchange.connect(user2).depositToken(mETH.address, amount)
  await transaction.wait()
  console.log(`Deposited ${amount} tokens from ${user2.address}\n`)

  ////////////////////////////////////////////////////////////
  // Seed a Cancelled Order
  //

  // user1 makes order to get tokens
  let orderId
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), DApp.address, tokens(5))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}`)
  
  // user1 cancels order
  orderId = result.events[0].args.id // the args.id comes from Exchange.js 'emits an Order event' 
  transaction = await exchange.connect(user1).cancelOrder(orderId)
  result = await transaction.wait()
  console.log(`Cancelled order from ${user1.address}\n`)

  // Wait 1 second to make sure ethers doesn't time out 
  await wait(1)

  ////////////////////////////////////////////////////////////
  // Seed a Filled Order
  //

  // user1 makes order
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), DApp.address, tokens(10))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}`)

  // user2 fills order
  orderId = result.events[0].args.id // the args.id comes from Exchange.js 'emits an Order event' 
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  // Wait 1 second to make sure ethers doesn't time out 
  await wait(1)

  // user1 makes another order
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(50), DApp.address, tokens(15))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}`)

  // user2 fills another order
  orderId = result.events[0].args.id // the args.id comes from Exchange.js 'emits an Order event' 
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  // Wait 1 second to make sure ethers doesn't time out 
  await wait(1)

  // user1 makes final order
  transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(200), DApp.address, tokens(20))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}`)

  // user2 fills final order
  orderId = result.events[0].args.id // the args.id comes from Exchange.js 'emits an Order event' 
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`Filled order from ${user1.address}\n`)

  // Wait 1 second to make sure ethers doesn't time out 
  await wait(1)

  ////////////////////////////////////////////////////////////
  // Seed a Open orders
  //

  // user1 makes 10 orders
  for(let i = 1; i <= 10; i++) {
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(10 * i), DApp.address, tokens(10))
    result = await transaction.wait()

    console.log(`Made order from ${user1.address}`)
    
    // Wait 1 second
    await (1)
  }

  // user2 makes 10 orders
  for(let i = 1; i <= 10; i++) {
    transaction = await exchange.connect(user2).makeOrder(DApp.address, tokens(10), mETH.address, tokens(10 * i))
    result = await transaction.wait()

    console.log(`Made order from ${user2.address}`)
    
    // Wait 1 second
    await (1)
  }
 
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
