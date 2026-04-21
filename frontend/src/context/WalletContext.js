import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import axios from '../utils/axiosInstance';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [account, setAccount]     = useState(localStorage.getItem('walletAddress') || null);
  const [balance, setBalance]     = useState(null);
  const [connecting, setConnecting] = useState(false);

  // ── Fetch balance from chain ──
  const fetchBalance = useCallback(async (address) => {
    if (!window.ethereum || !address) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const raw = await provider.getBalance(address);
      setBalance(parseFloat(ethers.formatEther(raw)).toFixed(4));
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (account) fetchBalance(account);
  }, [account, fetchBalance]);

  // ── Listen for MetaMask account changes ──
  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountChange = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0].toLowerCase());
        localStorage.setItem('walletAddress', accounts[0].toLowerCase());
        fetchBalance(accounts[0].toLowerCase());
      }
    };
    window.ethereum.on('accountsChanged', handleAccountChange);
    return () => window.ethereum.removeListener('accountsChanged', handleAccountChange);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Connect Wallet ──
  // Returns: { isNewUser: true, address } if first time
  //          { isNewUser: false }          if logged in
  const connectWallet = async (role = null, displayName = null) => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install it from metamask.io');
    }
    setConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Force account selection popup
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      await provider.send('eth_requestAccounts', []);
      const signer  = await provider.getSigner();
      const address = (await signer.getAddress()).toLowerCase();

      // Step 1 — Get nonce
      const nonceRes = await axios.get(`/auth/nonce/${address}`);
      const { nonce, isNewUser } = nonceRes.data;

      // If new user and no role yet, bubble up so caller shows role picker
      if (isNewUser && !role) {
        return { isNewUser: true, address };
      }

      // Step 2 — Sign the nonce
      const signature = await signer.signMessage(nonce);

      // ── Unified Identity: If already logged in via email, LINK instead of creating new user ──
      const storedToken = localStorage.getItem('token');
      const isLoggedIn  = localStorage.getItem('isLoggedIn') === 'true';

      if (isLoggedIn && storedToken) {
        const linkRes = await axios.post('/auth/link-wallet', {
          address,
          signature,
          nonce: nonce.split(': ').pop()
        });
        
        localStorage.setItem('walletAddress', address);
        setAccount(address);
        fetchBalance(address);
        return { isNewUser: false, user: linkRes.data };
      }

      // Step 3 — Normal Wallet Login (for users not yet logged in)
      const loginRes = await axios.post('/auth/wallet-login', {
        address,
        signature,
        ...(isNewUser && role ? { role, name: displayName } : {}),
      });

      const { token, user } = loginRes.data;

      // Persist session exactly like email login
      localStorage.setItem('token',         token);
      localStorage.setItem('userId',        user._id);
      localStorage.setItem('userRole',      user.role);
      localStorage.setItem('userName',      user.name);
      localStorage.setItem('isLoggedIn',    'true');
      localStorage.setItem('walletAddress', address);

      setAccount(address);
      fetchBalance(address);

      return { isNewUser: false, user };
    } finally {
      setConnecting(false);
    }
  };

  // ── Ensure Sepolia Network ──
  const ensureSepoliaNetwork = async () => {
    if (!window.ethereum) return false;
    const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111
    
    try {
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (currentChainId !== SEPOLIA_CHAIN_ID) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
      }
      return true;
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: 'Sepolia Test Network',
                nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
          return true;
        } catch (addError) {
          return false;
        }
      }
      return false;
    }
  };

  // ── Disconnect Wallet ──
  const disconnectWallet = () => {
    ['token','userId','userRole','userName','isLoggedIn','walletAddress'].forEach(k =>
      localStorage.removeItem(k)
    );
    setAccount(null);
    setBalance(null);
  };

  return (
    <WalletContext.Provider value={{ account, balance, connecting, connectWallet, disconnectWallet, ensureSepoliaNetwork }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
