import React, { useMemo } from 'react';
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
import { Signer } from 'ethers';
import { TypedDataSigner } from '@ethersproject/abstract-signer';

const GATEKEEPER_NETWORK = process.env.REACT_APP_GATEKEEPER_NETWORK || "ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6";

const client = createClient(
    getDefaultClient({
        appName: 'Civic Pass Eth demo',
        chains: [goerli, mainnet, polygon, optimism, arbitrum, polygonMumbai, sepolia, optimismGoerli, arbitrumGoerli],
    })
)

const Content = () => {
    const { address, isConnected } = useAccount()
    const { data: ensAvatar } = useEnsAvatar({ address })
    const { data: ensName } = useEnsName({ address })
    return <>
        { ensAvatar ?
            <img src={ensAvatar} className="App-logo" alt="logo" /> :
            <img src={logo} className="App-logo" alt="logo" /> }
        { ensName ? <p>{ensName}</p> : <p>{address}</p> }
        {isConnected && <IdentityButton/>}
    </>
}

const Gateway = () => {
    const provider = useProvider();
    const { address, isConnected } = useAccount();
    const { data: signer } = useSigner();

    const frankenWallet: Signer & TypedDataSigner = useMemo(() => {
        if (!signer) return null
        const w = Object.create(signer);
        w.getAddress = async () => {
            if (!isConnected) {
                return undefined;
            }
            return address
        }
        return w;
    }, [address, isConnected, signer]);

    if (!frankenWallet) return <></>

    return <GatewayProvider
        gatekeeperNetwork={GATEKEEPER_NETWORK}
        provider={provider}
        signer={frankenWallet}
        stage={'dev'}
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
