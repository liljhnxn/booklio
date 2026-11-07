# Booklio

> **Your bookings, organized.**

Booklio is a lightweight, decentralized Web3 appointment-booking platform for small businesses and freelancers. Built on Next.js, Tailwind CSS, Solidity, and Hardhat, deployed and verified on **Botchain Mainnet**.

---

## 🌟 Key Features

- **Decentralized Service Catalog:** Business owners can create services with custom names and descriptions stored directly on-chain.
- **Smart Appointment Slots:** Service providers can schedule and publish future appointment slots with local date/time handling.
- **Strict Double-Booking Protection:** Guaranteed at the smart contract level—slots are marked unavailable immediately upon booking.
- **No Booking of Past Slots:** Smart contract strictly rejects booking any slot whose timestamp is in the past.
- **Booking Management:**
  - Providers can confirm pending appointments.
  - Clients and providers can cancel appointments where permitted; future slots are automatically reopened upon cancellation.
- **Privacy-Preserving:** No email addresses, phone numbers, or private user data are ever stored or requested.
- **Real-Time On-Chain Dashboard:** Live stats displaying total services, open slots, total bookings, and confirmed bookings directly from contract state.

---

## ⛓️ Blockchain Configuration (Botchain Mainnet)

| Parameter | Value |
|---|---|
| **Network Name** | Botchain Mainnet |
| **Chain ID** | `677` |
| **RPC URL** | `https://rpc.botchain.ai` |
| **Block Explorer** | [https://scan.botchain.ai](https://scan.botchain.ai) |
| **Currency Symbol** | `BOT` |
| **Deployed Contract** | [`0x8f51aE358b30c5499961b09b11bAB243C8F05B7b`](https://scan.botchain.ai/address/0x8f51aE358b30c5499961b09b11bAB243C8F05B7b#code) |

---

## 🏗️ Architecture & Technology Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Icons & Styling:** Lucide React, Tailwind CSS (Dark charcoal background, muted purple & green accents)
- **Web3 Integration:** `wagmi` v2, `viem` v2, MetaMask / Injected Web3 Provider
- **Smart Contracts:** Solidity `^0.8.24`, Hardhat, TypeChain, Ethers v6

---

## 📦 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18+ or v20+)
- [MetaMask](https://metamask.io/) browser extension

### 2. Installation

Clone or open the repository, then install dependencies:

```bash
npm install
```

### 3. Environment Setup

Configure your environment variables in `.env` / `.env.local`:

```env
NEXT_PUBLIC_RPC_URL=https://rpc.botchain.ai
NEXT_PUBLIC_CHAIN_ID=677
NEXT_PUBLIC_BLOCK_EXPLORER=https://scan.botchain.ai
NEXT_PUBLIC_BOOKLIO_CONTRACT_ADDRESS=0x8f51aE358b30c5499961b09b11bAB243C8F05B7b

# Private key for deployment script
PRIVATE_KEY=0x<YOUR_PRIVATE_KEY>
```

---

## 🧪 Smart Contract Testing & Compilation

### Compile Contracts
```bash
npm run compile
```

### Run Unit Tests
```bash
npm run test
```

---

## 🚀 Deployment to Botchain Mainnet

Deploy the `Booklio` smart contract to Botchain Mainnet:

```bash
npm run deploy:mainnet
```

The script will automatically:
1. Deploy `Booklio.sol` to Botchain Mainnet using optimized gas.
2. Output the deployed contract address, transaction hash, and exact fee paid.
3. Automatically update `src/contracts/contractAddress.ts`, ABI, and environment variables.
4. Verify the source code on BOT Chain Explorer.

---

## 💻 Running the Web Application

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### MetaMask Setup for Botchain Mainnet

1. Open MetaMask -> **Add network** -> **Add a network manually**.
2. **Network Name:** Botchain Mainnet
3. **New RPC URL:** `https://rpc.botchain.ai`
4. **Chain ID:** `677`
5. **Currency Symbol:** `BOT`
6. **Block Explorer URL:** `https://scan.botchain.ai`

Connect your wallet using the **Connect MetaMask** button in the header.

---

## 📄 Smart Contract Summary (`Booklio.sol`)

- `createService(string name, string description)`: Publishes a new service.
- `createSlot(uint256 serviceId, uint256 appointmentTime)`: Publishes an appointment slot (service owner only).
- `bookSlot(uint256 slotId)`: Books an available slot (reverts if past or double-booked).
- `confirmBooking(uint256 bookingId)`: Confirms a pending appointment (service owner only).
- `cancelBooking(uint256 bookingId)`: Cancels an appointment (customer or service owner only) and reopens future slots.
- `getAllServices()`: Returns all active services.
- `getAvailableSlots(uint256 serviceId)`: Returns available upcoming slots for a service.
- `getMyBookingsDetailed()`: Returns full booking details for the connected wallet.
- `getDashboardStats()`: Aggregates total services, open slots, total bookings, and confirmed bookings.

---

## ⚖️ License

MIT License. Designed and crafted for **Booklio**.
