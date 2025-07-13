import { ethers } from 'ethers';

export async function connectWallet() {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  return new ethers.providers.Web3Provider(window.ethereum);
}
