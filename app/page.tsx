'use client';

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Wallet, LogOut, ChevronDown, Github, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';

import PostForm from '@/components/PostForm';
import PostList from '@/components/PostList';

export default function HomePage() {
  const [account, setAccount] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function connectWallet() {
    if (!window.ethereum) return alert('Please install MetaMask!');
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setAccount(address);
  }

  function disconnectWallet() {
    setAccount(null);
    setShowMenu(false);
  }

  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
      if (accounts.length > 0) setAccount(accounts[0]);
    });

    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      setAccount(accounts.length > 0 ? accounts[0] : null);
    });

    return () => {
      window.ethereum?.removeAllListeners('accountsChanged');
    };
  }, []);

  return (
    <main className="min-h-screen w-full bg-zinc-950 text-white px-4 py-6">
      {/* Navbar */}
      <div className="flex justify-between items-center max-w-5xl mx-auto mb-10">
        <h1 className="text-3xl font-bold text-orange-400 tracking-tight">FluxBoard</h1>

        {account ? (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-md border border-orange-500 font-mono text-sm"
            >
              <Wallet className="w-4 h-4 text-orange-400" />
              {account.slice(0, 6)}...{account.slice(-4)}
              <ChevronDown className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-zinc-900 rounded-md shadow-md border border-zinc-700 z-50">
                <div className="px-4 py-3 text-xs text-gray-400 border-b border-zinc-700">
                  Connected as:
                  <div className="text-white font-mono text-sm break-all mt-1">{account}</div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-zinc-800"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </button>
              </div>
            )}
          </div>
        ) : (
          <motion.button
            onClick={connectWallet}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md border border-orange-500 text-sm font-semibold"
            whileTap={{ scale: 0.95 }}
          >
            Connect Wallet
          </motion.button>
        )}
      </div>

      {/* If connected: show dApp */}
      {account ? (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowForm(prev => !prev)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-md border border-orange-400"
            >
              ➕ New Post
            </button>
          </div>

          {showForm && (
            <PostForm
              onPosted={() => {
                setShowForm(false);
                window.location.reload();
              }}
            />
          )}

          <PostList />
        </div>
      ) : (
        // Landing Page
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center mt-24 space-y-10"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-orange-400">Welcome to FluxBoard</h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            A decentralized social platform where users can post, tip in ETH, and interact freely without centralized control.
          </p>
          <div className="text-sm text-gray-500">
            Built on Ethereum. Powered by smart contracts.
          </div>

          <motion.button
            onClick={connectWallet}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-md border border-orange-500 font-semibold shadow"
            whileTap={{ scale: 0.95 }}
          >
            Connect Wallet to Continue
          </motion.button>

          <div className="mt-10 flex justify-center gap-6 text-gray-400 text-sm">
            <a
              href="https://github.com/Boobeshkumar56"
              target="_blank"
              className="hover:text-white flex items-center gap-1"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/your-linkedin"
              target="_blank"
              className="hover:text-white flex items-center gap-1"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
            <span>© 2025 Boobesh Kumar</span>
          </div>
        </motion.div>
      )}
    </main>
  );
}
