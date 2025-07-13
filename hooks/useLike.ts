import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

export function useLike(postId: number) {
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLikes() {
      const res = await fetch(`/api/likes/${postId}`)
      const json = await res.json()
      setLikes(json.count)
      // if wallet connected, mark liked
      if ((window as any).ethereum && json.likedBy) {
        const provider = new ethers.BrowserProvider((window as any).ethereum)
        const addr = await (await provider.getSigner()).getAddress()
        setLiked(json.likedBy.includes(addr))
      }
      setLoading(false)
    }
    fetchLikes()
  }, [postId])

  const like = async () => {
    if (liked) return
    const provider = new ethers.BrowserProvider((window as any).ethereum)
    const addr = await (await provider.getSigner()).getAddress()
    const res = await fetch(`/api/likes/${postId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: addr }),
    })
    const json = await res.json()
    setLikes(json.count)
    setLiked(true)
  }

  return { likes, liked, loading, like }
}
