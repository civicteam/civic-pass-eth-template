import React, {useMemo} from 'react';
import './App.css';
import logo from './logo.svg';
import {
    configureChains,
    createConfig,
    useAccount,
    useEnsAvatar,
    useEnsName,
    useNetwork,
    useWalletClient,
    WagmiConfig,
    WalletClient,
} from "wagmi";
import {publicProvider} from "wagmi/providers/public";
import {
    arbitrum,
    arbitrumSepolia,
    mainnet,
    optimism,
    optimismGoerli,
    polygon,
    polygonMumbai,
    sepolia
} from 'wagmi/chains';
import {ConnectKitButton, ConnectKitProvider} from "connectkit";
import {EthereumGatewayWallet, GatewayProvider, IdentityButton} from "@civic/ethereum-gateway-react";
import {BrowserProvider, JsonRpcSigner, Signer} from 'ethers';
import {MetaMaskConnector} from "wagmi/connectors/metaMask";

const GATEKEEPER_NETWORK = process.env.REACT_APP_GATEKEEPER_NETWORK || "ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6";

// obtain the chain from the URL hash, or provide a list of all supported chains
const chains = { sepolia, polygon, mainnet, optimism, arbitrum, polygonMumbai, arbitrumSepolia, optimismGoerli }
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
export function walletClientToSigner(walletClient: WalletClient): Signer {
    const { account, chain, transport } = walletClient;
    const network = {
        chainId: chain?.id,
        name: chain?.name,
        ensAddress: chain?.contracts?.ensRegistry?.address,
    };

    const provider = new BrowserProvider(transport, network);
    return new JsonRpcSigner(provider, account?.address);
}

const useWallet = (): EthereumGatewayWallet | undefined => {
    const { data: walletClient } = useWalletClient();

    const signer = useMemo(() => {
        // the wallet client chain is set asynchronously, so wait until
        // it's set before creating a signer
        if (!walletClient?.chain) return undefined;

        if (walletClient && walletClient?.account) {
          return walletClientToSigner(walletClient);
        }
      }, [walletClient]);

    return signer && {
        address: walletClient?.account?.address,
        signer: signer,
    };
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
