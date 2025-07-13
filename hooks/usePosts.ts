import { useEffect, useState } from 'react';
import { getContract } from '@/lib/contract';
import { ethers } from 'ethers';

export interface Post {
  id: number;
  content: string;
  author: string;
  likes: number;
  tipAmount: bigint;
  timestamp: number;
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setError(null);
        setLoading(true);

        if (!window.ethereum) {
          throw new Error("MetaMask not found");
        }

        console.log("🧠 Starting fetch...");
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Check network
        const network = await provider.getNetwork();
        console.log("🌐 Network:", network.name, "Chain ID:", network.chainId);
        
        const contract = getContract(provider);
        if (!contract) {
          throw new Error("Contract not loaded");
        }

        console.log("🔗 Contract address:", contract.target);

        // Check if contract exists at address
        const contractCode = await provider.getCode(contract.target as string);
        console.log("📜 Contract code length:", contractCode.length);
        
        if (contractCode === '0x') {
          throw new Error(`No contract found at address ${contract.target}. Please check:
          1. Contract is deployed on the correct network
          2. Contract address is correct
          3. You're connected to the right network`);
        }

        // Test if the contract has the getPostCount method
        try {
          console.log("🧪 Testing getPostCount...");
          const count = await contract.getPostCount();
          console.log("✅ Post count:", count.toString());

          const fetchedPosts: Post[] = [];

          for (let i = Number(count); i >= 1; i--) {
            try {
              const post = await contract.getPost(i);
              console.log(`📄 Post ${i}:`, post);

              fetchedPosts.push({
                id: Number(post[0]),
                author: post[1],
                content: post[2],
                likes: Number(post[3]),
                tipAmount: BigInt(post[4]),
                timestamp: Number(post[5]),
              });
            } catch (postError) {
              console.warn(`⚠️ Failed to fetch post ${i}:`, postError);
              // Continue with other posts
            }
          }

          setPosts(fetchedPosts);
        } catch (methodError) {
          console.error("❌ Method call failed:", methodError);
          throw new Error(`Contract method failed: ${methodError.message}`);
        }

      } catch (err) {
        console.error('❌ Error fetching posts:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  return { posts, loading, error };
}

// Alternative approach: Add contract verification utility
export async function verifyContract(provider: ethers.BrowserProvider, contractAddress: string) {
  try {
    const code = await provider.getCode(contractAddress);
    const network = await provider.getNetwork();
    
    console.log("🔍 Contract Verification:");
    console.log("  Address:", contractAddress);
    console.log("  Network:", network.name, "Chain ID:", network.chainId);
    console.log("  Code exists:", code !== '0x');
    console.log("  Code length:", code.length);
    
    return {
      exists: code !== '0x',
      network: network.name,
      chainId: network.chainId,
      codeLength: code.length
    };
  } catch (error) {
    console.error("❌ Contract verification failed:", error);
    return null;
  }
}