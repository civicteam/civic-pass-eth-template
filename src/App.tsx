import React from "react";
import "./App.css";
import { MultichainWalletProvider } from "@civic/multichain-connect-react-core";
import { SolanaWalletAdapterConfig } from "@civic/multichain-connect-react-solana-wallet-adapter";
import { Connection, clusterApiUrl } from "@solana/web3.js";

const defaultSolanaChains = [
  { name: "Solana", connection: new Connection(clusterApiUrl("devnet")) },
];

const Content = () => {
  return (
    <MultichainWalletProvider>
      <SolanaWalletAdapterConfig chains={defaultSolanaChains}>
        CONTENT
      </SolanaWalletAdapterConfig>
    </MultichainWalletProvider>
  );
};

function App() {
  return (
    <div className="App">
      <Content />
    </div>
  );
}

export default App;
