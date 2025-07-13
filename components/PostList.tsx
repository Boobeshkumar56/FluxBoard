'use client';

import { usePosts } from '@/hooks/usePosts';
import PostCard from './PostCard';
import { ethers } from 'ethers';
import { getContract } from '@/lib/contract';
import { useEffect, useState } from 'react';

export default function PostList() {
  const { posts, loading } = usePosts();
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  useEffect(() => {
    async function loadSigner() {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        setSigner(signer);
      }
    }

    loadSigner();
  }, []);

  const handleTip = async (id: number, amountEth: string) => {
    if (!signer) return alert("Please connect wallet");

    const contract = getContract(signer);
    try {
      const tx = await contract.tip(id, {
        value: ethers.parseEther(amountEth)
      });
      console.log("⏳ Sending tip tx:", tx.hash);
      await tx.wait();
      console.log("✅ Tip sent!");
      window.location.reload(); // optional refresh
    } catch (err) {
      console.error("❌ Tip failed:", err);
    }
  };

  if (loading) {
    return <p className="text-gray-400">Loading posts...</p>;
  }

  if (posts.length === 0) {
    return <p className="text-gray-400">No posts yet.</p>;
  }

  return (
    <div className="space-y-6">
      {posts.map(post => (
        <PostCard
          key={post.id}
          id={post.id}
          author={post.author}
          content={post.content}
          likes={post.likes}
          tipAmount={post.tipAmount}
          timestamp={post.timestamp}
          onLike={(id) => console.log('Like', id)} // Local only
          onTip={handleTip}
        />
      ))}
    </div>
  );
}
