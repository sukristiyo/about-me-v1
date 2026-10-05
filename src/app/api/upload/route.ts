import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const rawFolder = (formData.get('folder') as string | null) ?? 'uploads'
    // Prevent path traversal: allow only alphanumeric, hyphen, and underscore
    const safeFolder = rawFolder.replace(/[^a-zA-Z0-9_-]/g, '') || 'uploads'

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Cast file as File/Blob to access type and size safely
    const uploadedFile = file as any;

    if (!ALLOWED_TYPES.includes(uploadedFile.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only jpg, png, webp, gif, and pdf are allowed.' },
        { status: 400 }
      )
    }

    if (uploadedFile.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Sanitize file name to prevent directory traversal or control characters
    const safeName = (uploadedFile.name || 'file')
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 80)
    const uniquePath = `${safeFolder}/${Date.now()}-${safeName}`

    const blob = await put(uniquePath, uploadedFile, {
      access: 'public',
    })

    return NextResponse.json({ url: blob.url }, { status: 200 })
  } catch (error) {
    console.error('[POST /api/upload]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
