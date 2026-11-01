import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as fs from "fs";
import * as path from "path";

// Simple env loader without extra package
const rootDir = process.cwd();
const envFiles = [".env", ".env.local"];
for (const envFile of envFiles) {
  const envPath = path.join(rootDir, envFile);
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...vals] = trimmed.split("=");
        const varKey = key.trim();
        const varVal = vals.join("=").trim();
        if (varVal && (!process.env[varKey] || process.env[varKey] === "")) {
          process.env[varKey] = varVal;
        }
      }
    }
  }
}

let rawPrivateKey = (process.env.PRIVATE_KEY || "").trim();
if (rawPrivateKey && !rawPrivateKey.startsWith("0x")) {
  rawPrivateKey = `0x${rawPrivateKey}`;
}
const PRIVATE_KEY = rawPrivateKey || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    botchain: {
      url: process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.bohr.life",
      chainId: 968,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      botchain: "none",
    },
    customChains: [
      {
        network: "botchain",
        chainId: 968,
        urls: {
          apiURL: "https://scan.bohr.life/api",
          browserURL: "https://scan.bohr.life",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
