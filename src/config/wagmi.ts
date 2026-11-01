import { defineChain } from "viem";
import { http, createConfig, injected } from "wagmi";

// Botchain Testnet Definition (Chain ID 968)
export const botchain = defineChain({
  id: 968,
  name: "Botchain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "BOHR",
    symbol: "BOHR",
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.bohr.life"],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.bohr.life"],
    },
  },
  blockExplorers: {
    default: {
      name: "Bohr Scan",
      url: process.env.NEXT_PUBLIC_BLOCK_EXPLORER || "https://scan.bohr.life",
    },
  },
  testnet: true,
});

// Hardhat Local definition for development convenience
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
  testnet: true,
});

export const wagmiConfig = createConfig({
  chains: [botchain, hardhatLocal],
  connectors: [
    injected({ target: "metaMask" }),
    injected(),
  ],
  transports: {
    [botchain.id]: http(process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.bohr.life"),
    [hardhatLocal.id]: http("http://127.0.0.1:8545"),
  },
  ssr: true,
});
