'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { getContract } from '@/lib/contract';

interface Props {
  onPosted?: () => void;
}

export default function PostForm({ onPosted }: Props) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(signer);

      const tx = await contract.post(content);
      setTxHash(tx.hash);

      await tx.wait();
      setContent('');
      if (onPosted) onPosted();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 bg-zinc-900 p-4 rounded-xl border border-zinc-700 space-y-4">
      <textarea
        className="w-full p-3 text-sm rounded-md bg-zinc-800 text-white placeholder-zinc-400"
        rows={4}
        placeholder="Write your post..."
        maxLength={280}
        value={content}
        onChange={e => setContent(e.target.value)}
        disabled={loading}
      />
      <button
        type="submit"
        className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700 disabled:opacity-50"
        disabled={loading || !content.trim()}
      >
        {loading ? 'Posting...' : 'Post'}
      </button>

      {txHash && (
        <p className="text-xs text-green-400">
          ✅ Tx submitted: <a href={`https://sepolia.etherscan.io/tx/${txHash}`} className="underline" target="_blank" rel="noopener noreferrer">{txHash}</a>
        </p>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </form>
  );
}
