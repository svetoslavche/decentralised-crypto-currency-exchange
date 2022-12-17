import { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import config from '../config.json';

import { 
  loadProvider, 
  loadNetwork, 
  loadAccount,
  loadToken,

} from '../store/interactions';

function App() {
  const dispatch = useDispatch()

  const loadBlockchainData = async () => {
    await loadAccount(dispatch)

    const provider = loadProvider(dispatch) // uses logic from interactions.js to connect Ethers to blockchain
    const chainId = await loadNetwork(provider, dispatch)

    // Token smart contract
    await loadToken(provider, config[chainId].DApp.address, dispatch)
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
