import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

const defaultSettings = {
  profilePhotoUrl: null,
  nameEn: 'Sukristiyo',
  nameId: null,
  subtitleEn: 'DevOps | SRE | Cloud Engineer | Data Center',
  subtitleId: null,
  aboutTextEn: '',
  aboutTextId: null,
  email: 'sukrisstiyo29@gmail.com',
  phone: '+62 821-7016-7025',
  birthDate: 'September 26, 1999',
  location: 'Jakarta, Indonesia',
  githubUrl: null,
  linkedinUrl: null,
  twitterUrl: null,
  instagramUrl: null,
  facebookUrl: null,
  cvUrl: null,
}

const settingsPatchSchema = z.object({
  profilePhotoUrl: z.string().url().optional().or(z.literal('')),
  nameEn: z.string().optional(),
  nameId: z.string().optional(),
  subtitleEn: z.string().optional(),
  subtitleId: z.string().optional(),
  aboutTextEn: z.string().optional(),
  aboutTextId: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  birthDateId: z.string().optional(),
  location: z.string().optional(),
  locationId: z.string().optional(),
  githubUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  facebookUrl: z.string().url().optional().or(z.literal('')),
  cvUrl: z.string().url().optional().or(z.literal('')),
})

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findFirst()
    if (!settings) {
      settings = await prisma.siteSettings.create({ data: defaultSettings })
    }
    return NextResponse.json(settings)
  } catch (error) {
    console.error('[GET /api/settings]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

import { translateToIndonesian } from '@/lib/translator'

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = settingsPatchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 })
    }

    const dataToSave = { ...parsed.data };
    
    if (dataToSave.nameEn) {
      const translated = await translateToIndonesian(dataToSave.nameEn);
      if (translated) dataToSave.nameId = translated;
    }
    if (dataToSave.subtitleEn) {
      const translated = await translateToIndonesian(dataToSave.subtitleEn);
      if (translated) dataToSave.subtitleId = translated;
    }
    if (dataToSave.aboutTextEn) {
      const translated = await translateToIndonesian(dataToSave.aboutTextEn);
      if (translated) dataToSave.aboutTextId = translated;
    }
    if (dataToSave.birthDate) {
      const translated = await translateToIndonesian(dataToSave.birthDate);
      if (translated) dataToSave.birthDateId = translated;
    }
    if (dataToSave.location) {
      const translated = await translateToIndonesian(dataToSave.location);
      if (translated) dataToSave.locationId = translated;
    }

    // Ensure a record exists before updating
    const existing = await prisma.siteSettings.findFirst()
    let settings
    if (existing) {
      settings = await prisma.siteSettings.update({
        where: { id: existing.id },
        data: dataToSave,
      })
    } else {
      settings = await prisma.siteSettings.create({
        data: { ...defaultSettings, ...dataToSave },
      })
    }
    revalidatePath('/', 'layout');

    return NextResponse.json(settings)
  } catch (error) {
    console.error('[PATCH /api/settings]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
