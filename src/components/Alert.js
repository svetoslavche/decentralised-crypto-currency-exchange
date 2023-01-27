import { useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'

import { myEventsSelector } from '../store/selectors'
import fail from '../assets/fail.svg';
import success from '../assets/success.svg';
import config from '../config.json'

const Alert = () => {
  const alertRef = useRef(null)

  const network = useSelector(state => state.provider.network)
  const account = useSelector(state => state.provider.account)
  const isPending = useSelector(state => state.exchange.transaction.isPending)
  const isError = useSelector(state => state.exchange.transaction.isError)
  const events = useSelector(myEventsSelector)

  const removeHandler = async (e) => {
    alertRef.current.className = 'alert--remove'
  }

  useEffect (() => {
    if((events[0] || isPending || isError) && account) {
      alertRef.current.className = 'alert'
    }
  }, [events, isPending, isError, account]) // to listen for a change

  return (
    <div>
        {isPending ? (

          <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
            <h1>Transaction Pending...</h1>
          </div>

        ) : isError ? ( 

          <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
            <h1>Transaction Failed</h1>
            <img src={fail} alt="Fail" />
          </div>

        ) : !isPending && events[0] ? (

          <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
          <h1>Transaction Successful</h1>
          <img src={success} alt="Success" />
            <a
              href={config[network] ? `$config[network].explorerURL/tx/$events[0].transactionHash` : '#' }
              target='_blank'
              rel='noreferrer'
            >
              {events[0].transactionHash.slice(0,6) + '...' + events[0].transactionHash.slice(60,66)}
            </a>
        </div>
        ) : (
          <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}></div> // failure or default case if there's no status coming from Redux
        )}
    </div>
  );
} 

export default Alert;
