import { useEffect } from 'react';
import { ethers } from 'ethers';
import config from '../config.json';
import TOKEN_ABI from '../abis/Token.json';
import '../App.css';

function App() {

  const loadBlockchainData = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) 
    // This is going to make an RPC call to our node to get the account we're connected with
    console.log(accounts[0])

    const provider = new ethers.providers.Web3Provider(window.ethereum) // Connect Ethers to blockchain
    const { chainId } = await provider.getNetwork()
    console.log(chainId) // Log the current network ID to the console so we can prove the connection


    // Token smart contract
    const token = new ethers.Contract(config[chainId].DApp.address, TOKEN_ABI, provider)
    console.log(token.address)
    const symbol = await token.symbol()
    console.log(symbol)
  }

  useEffect(() => { // the effect hook lets us perform side effects in function components
    loadBlockchainData() // call the function above to fetch data from the blockchain

    // do more stuff here 
  
  })

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;
