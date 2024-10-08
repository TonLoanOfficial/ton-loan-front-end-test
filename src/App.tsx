import './App.css'
import {TonConnectButton} from "@tonconnect/ui-react";
import {useMainContract} from "./hooks/useMainContract.ts";
import {useTonConnect} from "./hooks/useTonConnect.ts";
import WebApp from "@twa-dev/sdk";

function App() {
    const {
        contract_address,
        counter_value,
        //recent_sender,
        //owner_address,
        contract_balance,
        sendIncrement
    } = useMainContract();
    const {connected} = useTonConnect();


    const showAlert = () => {
        WebApp.showAlert("Hey there!")
    }

    return (
        <div>
            <div>
                <TonConnectButton/>
            </div>
            <div>
                <div className='Card'>
                    <b>{WebApp.platform}</b>
                    <b onClick={showAlert}>ShowAlert</b>
                    <b>Our contract Address</b>
                    <div className='Hint'>{contract_address?.slice(0, 30) + "..."}</div>
                    <b>Our contract Balance</b>
                    <div className='Hint'>{contract_balance}</div>
                </div>

                <div className='Card'>
                    <b>Counter Value</b>
                    <div>{counter_value ?? "Loading..."}</div>
                </div>
                {connected && (
                    <a onClick={() => {
                        sendIncrement()
                    }}>Increment By 5</a>
                )}
            </div>
        </div>
    )
}

export default App
