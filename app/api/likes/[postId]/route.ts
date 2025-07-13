import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_PATH = path.join(process.cwd(), 'data/likes.json')

async function readLikes() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8')
    return JSON.parse(raw) as Record<string, string[]>
  } catch {
    return {}
  }
}

async function writeLikes(data: Record<string, string[]>) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2))
}

// GET /api/likes/[postId]
export async function GET(req: NextRequest, context: { params: { postId: string } }) {
  const { postId } = context.params
  const data = await readLikes()
  const arr = data[postId] ?? []
  return NextResponse.json({ count: arr.length, likedBy: arr })
}

// POST /api/likes/[postId]
export async function POST(req: NextRequest, context: { params: { postId: string } }) {
  const { postId } = context.params
  const { address } = await req.json()

  const data = await readLikes()
  const current = new Set<string>(data[postId] ?? [])

  if (current.has(address)) {
    return NextResponse.json({ count: current.size, liked: true })
  }

  current.add(address)
  data[postId] = [...current]

  await writeLikes(data)

  return NextResponse.json({ count: current.size, liked: true })
}
