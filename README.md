# Decentralized Escrow System

## Project Overview
The Decentralized Escrow System is a blockchain-based platform developed to provide secure and transparent transactions between clients and freelancers. The system uses Ethereum Smart Contracts to securely hold funds in escrow and release payments only after the client approves the completed work. The project combines blockchain technology, backend services, database management, and frontend integration to create a reliable decentralized payment workflow.

---

## Technology Stack and Tools Used

### Frontend
- React.js
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Blockchain
- Solidity
- Hardhat
- Ethers.js
- MetaMask
- Sepolia Testnet

### Tools and Platforms
- VS Code
- Git & GitHub
- Postman / Thunder Client
- Infura RPC
- dotenv

---

## Features and Functionalities Implemented
- Smart contract based escrow payment system
- Secure fund holding mechanism
- Payment release after client approval
- Refund functionality for clients
- Ethereum blockchain integration
- Smart contract deployment on Sepolia Testnet
- REST API integration with blockchain
- MongoDB database connectivity
- MetaMask wallet integration
- Secure environment variable management
- Real blockchain transaction execution
- Frontend, backend, and blockchain integration
- Transaction monitoring and validation

---

## Installation and Execution Steps

### 1. Clone the Repository
```bash
git clone <repository-link>
cd DES
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 4. Install Blockchain Dependencies
```bash
cd ../blockchain
npm install
```

### 5. Configure Environment Variables

#### Backend `.env`
```env
PORT=5000
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret_key

PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC_URL=your_rpc_url
CONTRACT_ADDRESS=your_deployed_contract_address
```

#### Blockchain `.env`
```env
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC_URL=your_rpc_url
```

### 6. Start MongoDB
```bash
mongod
```

### 7. Run Backend Server
```bash
cd backend
npm run dev
```

### 8. Run Frontend
```bash
cd frontend
npm start
```

### 9. Deploy Smart Contract
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network sepolia
```

### 10. Connect MetaMask
- Add Sepolia Testnet
- Import test wallet
- Connect wallet with the application

---

## Project Output
- Smart contract deployed successfully on Sepolia Testnet
- Escrow payment creation working successfully
- Payment release functionality working properly
- Refund transaction execution completed successfully
- MongoDB connected with backend services
- Frontend integrated with backend and blockchain
- Real Ethereum test transactions executed successfully

(Add project screenshots here)

---

## Team Members
- Tousif — Blockchain Development, Integration of Frontend, Backend and Blockchain, System Monitoring and Project Coordination
- Team Member 2 — Backend Development
- Team Member 3 — Frontend Development

---

## Project Status

```text
Smart Contract Development     Completed
Blockchain Integration         Completed
Backend Development            Completed
Frontend Development           Completed
Database Connectivity          Completed
Wallet Integration             Completed
Testing and Deployment         Completed
```
