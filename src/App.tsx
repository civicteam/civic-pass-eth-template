import React, {useEffect, useState} from 'react';
import './App.css';
import logo from './logo.svg';
import {
    createClient,
    useAccount,
    useEnsAvatar,
    useEnsName, useNetwork,
    WagmiConfig
} from "wagmi";
import { mainnet, goerli, polygon, optimism, arbitrum, polygonMumbai, sepolia, arbitrumGoerli, optimismGoerli } from 'wagmi/chains';
import { ConnectKitProvider, ConnectKitButton, getDefaultClient } from "connectkit";
import {GatewayProvider, IdentityButton} from "@civic/ethereum-gateway-react";
import {Wallet} from 'ethers';

const GATEKEEPER_NETWORK = process.env.REACT_APP_GATEKEEPER_NETWORK || "ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6";

// obtain the chain from the URL hash, or provide a list of all supported chains
const chains = { goerli, polygon, mainnet, optimism, arbitrum, polygonMumbai, sepolia, arbitrumGoerli, optimismGoerli }
const hash = window.location.hash.replace("#", "");
const selectedChain = chains[hash as keyof typeof chains];
const clientChains = selectedChain ? [selectedChain] : Object.values(chains)

const client = createClient(
    getDefaultClient({
        appName: 'Civic Pass Eth demo',
        chains: clientChains,
    })
)

const Content = () => {
    const { address, isConnected } = useAccount()
    const network = useNetwork()
    const { data: ensAvatar } = useEnsAvatar({ address })
    const { data: ensName } = useEnsName({ address })
    return <>
        { ensAvatar ?
            <img src={ensAvatar} className="App-logo" alt="logo" /> :
            <img src={logo} className="App-logo" alt="logo" /> }
        { ensName ? <p>{ensName}</p> : <p>{address}</p> }
        { network.chain?.name && <p>{network.chain.name}</p> }
        {isConnected && <IdentityButton/>}
    </>
}

const useWallet = ():Wallet | undefined => {
    const { connector, address } = useAccount();
    const [wallet, setWallet] = useState<Wallet>();
    // update the wallet if the connector or address changes
    useEffect(() => {
        if (!connector) return;
        connector.getSigner().then(setWallet);
    }, [connector, address]);

    return wallet;
}

const Gateway = () => {
    const wallet = useWallet();
    if (!wallet) return <><Content/></>

    return <GatewayProvider
        gatekeeperNetwork={GATEKEEPER_NETWORK}
        wallet={wallet}
    >
        <Content/>
    </GatewayProvider>
}

function App() {
    return (
        <div className="App">
            <WagmiConfig client={client}>
                <ConnectKitProvider theme="auto">
                    <header className="App-header">
                        <ConnectKitButton />
                        <Gateway />
                    </header>
                </ConnectKitProvider>
            </WagmiConfig>
        </div>
    );
}

export default App;
