import React, {useEffect, useState} from 'react';
import './App.css';
import logo from './logo.svg';
import {
    useAccount,
    useEnsAvatar,
    useEnsName, useNetwork,
    WagmiConfig,
    WalletClient,
    useWalletClient,
    configureChains,
    createConfig,
} from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { mainnet, goerli, polygon, optimism, arbitrum, polygonMumbai, sepolia, arbitrumGoerli, optimismGoerli } from 'wagmi/chains';
import { ConnectKitProvider, ConnectKitButton } from "connectkit";
import {GatewayProvider, IdentityButton, EthereumGatewayWallet} from "@civic/ethereum-gateway-react";
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { MetaMaskConnector } from "wagmi/connectors/metaMask";

const GATEKEEPER_NETWORK = process.env.REACT_APP_GATEKEEPER_NETWORK || "ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6";

// obtain the chain from the URL hash, or provide a list of all supported chains
const chains = { goerli, polygon, mainnet, optimism, arbitrum, polygonMumbai, sepolia, arbitrumGoerli, optimismGoerli }
const hash = window.location.hash.replace("#", "");
const selectedChain = chains[hash as keyof typeof chains];
const clientChains = selectedChain ? [selectedChain] : Object.values(chains)


type ContentProps = {
    address?: `0x${string}` | undefined;
}
const Content = ({ address }: ContentProps) => {
    const { isConnected } = useAccount()
    const network = useNetwork()
    const { data: ensAvatar } = useEnsAvatar({
        name: address,
      })
    const { data: ensName } = useEnsName({
        address,
      })
    return <>
        { ensAvatar ?
            <img src={ensAvatar} className="App-logo" alt="logo" /> :
            <img src={logo} className="App-logo" alt="logo" /> }
        { ensName ? <p>{ensName}</p> : <p>{address}</p> }
        { network.chain?.name && <p>{network.chain.name}</p> }
        {isConnected && <IdentityButton/>}
    </>
}
const walletClientToSigner = (walletClient: WalletClient) => {
    const { account, chain, transport } = walletClient;
    const network = {
      chainId: chain?.id,
      name: chain?.name,
      ensAddress: chain?.contracts?.ensRegistry?.address,
    };
  
    const provider = new BrowserProvider(transport, network);
    const signer = new JsonRpcSigner(provider, account?.address);
    return signer;
  }

const useWallet = (): EthereumGatewayWallet | undefined => {
    const { data: walletClient } = useWalletClient();
    const [wallet, setWallet] = useState<EthereumGatewayWallet>();

    useEffect(() => {
        // the wallet client chain is set asynchronously, so wait until
        // it's set before setting the wallet
        if (!walletClient?.chain) {
          return setWallet(undefined);
        }
        if (walletClient && walletClient?.account) {
          const signer = walletClientToSigner(walletClient);
          setWallet({ address: walletClient.account?.address, signer });
        }
      }, [walletClient]);

    return wallet;
}

const Gateway = () => {
    const wallet = useWallet();
    if (!wallet) return <><Content/></>

    return <GatewayProvider
        gatekeeperNetwork={GATEKEEPER_NETWORK}
        wallet={wallet}
    >
        <Content address={wallet.address as `0x${string}`} />
    </GatewayProvider>
}
const { publicClient, webSocketPublicClient } = configureChains(
    Object.values(chains), // Things start to break if you only have one chain here.
    [publicProvider()]
  );
const config = createConfig({
    publicClient,
    webSocketPublicClient,
    connectors: [
      new MetaMaskConnector({ chains: clientChains }),
    ],
  });

function App() {
    return (
        <div className="App">
            <WagmiConfig config={config}>
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
