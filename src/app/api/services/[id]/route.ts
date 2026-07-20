import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

const schema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  iconName: z.string().min(1).optional(),
  colorClass: z.string().min(1).optional(),
  iconColor: z.string().min(1).optional(),
  order: z.number().int().optional(),
})

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const parsed = schema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 })
    }

    const item = await prisma.service.update({
      where: { id },
      data: parsed.data,
    })

    revalidatePath('/', 'layout');
    return NextResponse.json(item)
  } catch (error) {
    console.error('[PATCH /api/services/[id]]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    await prisma.service.delete({
      where: { id },
    })
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/services/[id]]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
