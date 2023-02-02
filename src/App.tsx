import React, { useMemo } from 'react';
import './App.css';
import logo from './logo.svg';
import {ConnectionProvider, useConnection, useWallet, WalletProvider} from '@solana/wallet-adapter-react';
import {clusterApiUrl, PublicKey} from "@solana/web3.js";
import {
    GlowWalletAdapter,
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    SolletWalletAdapter, TorusWalletAdapter
} from "@solana/wallet-adapter-wallets";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
    WalletModalProvider,
    WalletMultiButton
} from "@solana/wallet-adapter-react-ui";
import {GatewayProvider, IdentityButton} from "@civic/solana-gateway-react";

require('@solana/wallet-adapter-react-ui/styles.css');

const GATEKEEPER_NETWORK = "ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6";

const Content = () => {
    const wallet = useWallet()
    return <header className="App-header">
        <WalletMultiButton/>
        <img src={logo} className="App-logo" alt="logo" />
        {wallet.connected && <IdentityButton/>}
    </header>
}

const Gateway = () => {
    const { connection } = useConnection();
    const wallet = useWallet();
    return <GatewayProvider connection={connection} wallet={wallet} gatekeeperNetwork={new PublicKey(GATEKEEPER_NETWORK)}>
        <Content/>
    </GatewayProvider>
}

function App() {
    const network = WalletAdapterNetwork.Mainnet;
    const endpoint = useMemo(() => process.env.REACT_APP_RPC_ENDPOINT || clusterApiUrl(network), [network]);
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new GlowWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
            new SolletWalletAdapter({ network }),
        ],
        [network]
    );

    return (
        <div className="App">
            <ConnectionProvider endpoint={endpoint}>
                <WalletProvider wallets={wallets} autoConnect>
                    <WalletModalProvider>
                        <Gateway />
                    </WalletModalProvider>
                </WalletProvider>
            </ConnectionProvider>
        </div>
    );
}

export default App;
