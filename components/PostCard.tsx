'use client';

import { useState, useEffect } from 'react';
import { Heart, Share2, Coins, User, Loader2, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import { getContract } from '@/lib/contract';
import { ethers } from 'ethers';

interface PostCardProps {
  id: number;
  content: string;
  author: string;
  likes: number;
  tipAmount: bigint;
  timestamp: number;
}

function getRandomColor(address: string): string {
  const colors = ['bg-orange-500', 'bg-pink-500', 'bg-indigo-500', 'bg-purple-500', 'bg-yellow-500'];
  const hash = address.charCodeAt(2) % colors.length;
  return colors[hash];
}

export default function PostCard({
  id,
  content,
  author,
  tipAmount,
  timestamp,
}: PostCardProps) {
  const [localLikes, setLocalLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tipping, setTipping] = useState(false);

  const shortAddress = `${author.slice(0, 6)}...${author.slice(-4)}`;
  const timeAgo = formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true });
  const tipEth = parseFloat((Number(tipAmount) / 1e18).toFixed(4));
  const avatarColor = getRandomColor(author);

  useEffect(() => {
    async function fetchLikes() {
      try {
        const res = await fetch(`/api/likes/${id}`);
        const json = await res.json();
        setLocalLikes(json.count || 0);

        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const addr = await signer.getAddress();
          setHasLiked(json.likedBy?.includes(addr));
        }
      } catch (err) {
        console.error('❌ Failed to fetch likes:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLikes();
  }, [id]);

  const handleLike = async () => {
    if (hasLiked || loading) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();

      const res = await fetch(`/api/likes/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addr }),
      });

      const json = await res.json();
      setLocalLikes(json.count);
      setHasLiked(true);
    } catch (err) {
      console.error("❌ Like failed:", err);
      toast.error("Like failed");
    }
  };

  const handleTip = async () => {
    const eth = prompt("Enter tip amount in ETH (e.g. 0.01):");
    if (!eth || !window.ethereum) return;

    setTipping(true);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = getContract(signer);

    try {
      const tx = await contract.tip(id, {
        value: ethers.parseEther(eth),
      });

      toast.promise(tx.wait(), {
        loading: "Sending tip...",
        success: "🎉 Tip successful!",
        error: "❌ Tip failed",
      });
    } catch (err) {
      console.error("❌ Tip failed:", err);
      toast.error("Tip failed.");
    } finally {
      setTipping(false);
    }
  };

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/post/${id}`;
      await navigator.clipboard.writeText(url);
      toast.success("🔗 Post link copied!");
    } catch {
      toast.error("❌ Failed to copy link");
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5 shadow-md space-y-4 hover:border-orange-400 transition-all">
      {/* Top - User */}
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${avatarColor} text-white font-semibold`}>
            <User className="w-4 h-4" />
          </div>
          <span className="text-gray-200 font-mono">{shortAddress}</span>
        </div>
        <span className="text-xs text-gray-400">{timeAgo}</span>
      </div>

      {/* Content */}
      <p className="text-white text-base leading-relaxed">{content}</p>

      {/* Stats */}
      <div className="flex justify-between items-center text-sm text-gray-300">
        <span>❤️ {localLikes} Likes</span>
        <span>💰 {tipEth} ETH Tipped</span>
      </div>

      {/* Buttons */}
      <div className="flex justify-between gap-2 mt-2 flex-wrap">
        {/* Like */}
        <button
          onClick={handleLike}
          disabled={hasLiked}
          className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md ${
            hasLiked ? "bg-orange-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"
          } text-white transition`}
        >
          {hasLiked ? <CheckCheck className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
          {hasLiked ? "Liked" : "Like"}
        </button>

        {/* Tip */}
        <button
          onClick={handleTip}
          disabled={tipping}
          className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md ${
            tipping ? "bg-yellow-400 cursor-not-allowed" : "bg-yellow-600 hover:bg-yellow-700"
          } text-white transition`}
        >
          {tipping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />}
          Tip
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1 px-3 py-1 text-sm rounded-md bg-zinc-700 hover:bg-zinc-600 text-white transition"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  );
}
