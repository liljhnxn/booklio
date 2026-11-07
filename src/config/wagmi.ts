import { defineChain } from "viem";
import { http, createConfig, injected } from "wagmi";

// BOT Chain Mainnet Definition (Chain ID 677)
export const botchainMainnet = defineChain({
  id: 677,
  name: "BOT Chain Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "BOT",
    symbol: "BOT",
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.botchain.ai"],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.botchain.ai"],
    },
  },
  blockExplorers: {
    default: {
      name: "BOT Chain Explorer",
      url: process.env.NEXT_PUBLIC_BLOCK_EXPLORER || "https://scan.botchain.ai",
    },
  },
});

// Local dev network
export const hardhatLocal = defineChain({
  id: 31337,
  name: "Hardhat Localhost",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
  },
});

export const wagmiConfig = createConfig({
  chains: [botchainMainnet, hardhatLocal],
  connectors: [
    injected({ target: "metaMask" }),
    injected(),
  ],
  transports: {
    [botchainMainnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.botchain.ai"),
    [hardhatLocal.id]: http("http://127.0.0.1:8545"),
  },
  ssr: true,
});
