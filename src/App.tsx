import React from 'react';
import './App.css';
import logo from './logo.svg';
import {
    createClient,
    useAccount,
    useEnsAvatar,
    useEnsName,
    useProvider,
    useSigner,
    WagmiConfig
} from "wagmi";
import { mainnet, goerli, polygon, optimism, arbitrum, polygonMumbai, sepolia, arbitrumGoerli, optimismGoerli } from 'wagmi/chains';
import { ConnectKitProvider, ConnectKitButton, getDefaultClient } from "connectkit";
import {GatewayProvider, IdentityButton} from "@civic/ethereum-gateway-react";

const GATEKEEPER_NETWORK = "ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6";

const client = createClient(
    getDefaultClient({
        appName: 'Civic Pass Eth demo',
        chains: [mainnet, polygon, optimism, arbitrum, goerli, polygonMumbai, sepolia, optimismGoerli, arbitrumGoerli],
    })
)

const Content = () => {
    const { address, isConnected } = useAccount()
    const { data: ensAvatar } = useEnsAvatar({ address })
    const { data: ensName } = useEnsName({ address })
    return <header className="App-header">

        { ensAvatar ?
            <img src={ensAvatar} className="App-logo" alt="logo" /> :
            <img src={logo} className="App-logo" alt="logo" /> }
        { ensName ? <p>{ensName}</p> : <p>{address}</p> }
        {isConnected && <IdentityButton/>}
    </header>
}

const Gateway = () => {
    const provider = useProvider()
    const { data: signer } = useSigner();

    if (!signer) return <></>

    return <GatewayProvider
        gatekeeperNetwork={GATEKEEPER_NETWORK}
        provider={provider}
        signer={signer}
    >
        <Content/>
    </GatewayProvider>
}

function App() {
    return (
        <div className="App">
            <WagmiConfig client={client}>
                <ConnectKitProvider theme="auto">
                    <ConnectKitButton />
                    <Gateway />
                </ConnectKitProvider>
            </WagmiConfig>
        </div>
    );
}

export default App;
