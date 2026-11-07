import { defineChain } from "viem";
import { http, createConfig, injected } from "wagmi";

// Botchain Mainnet Definition (Chain ID 677)
export const botchainMainnet = defineChain({
  id: 677,
  name: "Botchain Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "Bot",
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
      name: "Botchain Scan",
      url: process.env.NEXT_PUBLIC_BLOCK_EXPLORER || "https://scan.botchain.ai",
    },
  },
});

// Botchain Testnet Definition (Chain ID 968)
export const botchainTestnet = defineChain({
  id: 968,
  name: "Botchain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "BOHR",
    symbol: "BOHR",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.bohr.life"],
    },
    public: {
      http: ["https://rpc.bohr.life"],
    },
  },
  blockExplorers: {
    default: {
      name: "Bohr Scan",
      url: "https://scan.bohr.life",
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
  chains: [botchainMainnet, botchainTestnet, hardhatLocal],
  connectors: [
    injected({ target: "metaMask" }),
    injected(),
  ],
  transports: {
    [botchainMainnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.botchain.ai"),
    [botchainTestnet.id]: http("https://rpc.bohr.life"),
    [hardhatLocal.id]: http("http://127.0.0.1:8545"),
  },
  ssr: true,
});
