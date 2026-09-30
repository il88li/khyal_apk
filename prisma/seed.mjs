import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

/* ============================================================
   بيانات تجريبية للإطلاق: تُنشئ مبدعين ومنشورات حقيقية الشكل
   لتظهر المنصة حيّة من اليوم الأول.
   التشغيل: bun run seed (أو npm run seed)
   ============================================================ */

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'khayal-demo-2026';

const CREATORS = [
  { username: 'layla', name: 'ليلى الحربي', bio: 'مصمّمة بصرية — أهتم بالبورتريه والإضاءة السينمائية.', accentColor: '#9333ea' },
  { username: 'omar', name: 'عمر بن سالم', bio: 'مهندس معماري أستكشف الخيال العلمي والمفاهيم المستقبلية.', accentColor: '#0ea5e9' },
  { username: 'noor', name: 'نور الدين', bio: 'خطّاط رقمي — أحوّل الحرف العربي إلى لوحات معاصرة.', accentColor: '#f59e0b' },
  { username: 'huda', name: 'هدى العتيبي', bio: 'فنانة مفهوم — طبيعة وخيال وأنمي.', accentColor: '#10b981' }
];

const POSTS = [
  {
    author: 'layla',
    title: 'بورتريه بإضاءة سينمائية دافئة',
    prompt: 'cinematic portrait of a woman, warm rim light, 85mm lens, shallow depth of field, film grain, ultra detailed skin',
    model: 'Midjourney',
    tags: ['بورتريه', 'إضاءة سينمائية', 'واقعية'],
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80'
  },
  {
    author: 'omar',
    title: 'مدينة عائمة فوق السحاب عند الغروب',
    prompt: 'floating city above the clouds at golden hour, volumetric god rays, retro futuristic architecture, wide angle, ultra detailed',
    model: 'Flux',
    tags: ['خيال علمي', 'معمار', 'إضاءة سينمائية'],
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80'
  },
  {
    author: 'noor',
    title: 'خط عربي مزخرف بلمسة ذهبية',
    prompt: 'ornate arabic calligraphy composition, gold leaf on dark parchment, symmetrical, museum lighting, high detail',
    model: 'Ideogram',
    tags: ['خط عربي', 'رسم رقمي'],
    imageUrl: 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?auto=format&fit=crop&w=1200&q=80'
  },
  {
    author: 'huda',
    title: 'غابة ضبابية بإضاءة نيون',
    prompt: 'misty forest at night with bioluminescent plants, neon fog, moody atmosphere, long exposure, cinematic',
    model: 'Stable Diffusion',
    tags: ['طبيعة', 'نيون', 'خيال علمي'],
    imageUrl: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80'
  },
  {
    author: 'layla',
    title: 'أزياء مستقبلية في الصحراء',
    prompt: 'fashion editorial in a desert, futuristic fabric, harsh sunlight, dust in the air, medium format, editorial lighting',
    model: 'DALL·E 3',
    tags: ['بورتريه', 'مفهوم فني'],
    imageUrl: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=1200&q=80'
  },
  {
    author: 'omar',
    title: 'معمار إسلامي حديث بالضوء الطبيعي',
    prompt: 'modern islamic architecture, geometric mashrabiya screens, sunlight patterns on stone, minimal, architectural photography',
    model: 'Recraft',
    tags: ['معمار', 'خط عربي'],
    imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80'
  },
  {
    author: 'huda',
    title: 'شخصية أنمي بمدينة مطرية',
    prompt: 'anime character standing in a rainy neon city, reflective puddles, soft bloom, cel shading, studio style',
    model: 'Midjourney',
    tags: ['أنمي', 'نيون'],
    imageUrl: 'https://images.unsplash.com/photo-1493514789931-586cb221d7a7?auto=format&fit=crop&w=1200&q=80'
  },
  {
    author: 'noor',
    title: 'مخلوق مرجاني ثلاثي الأبعاد',
    prompt: '3d render of a bioluminescent coral creature, subsurface scattering, studio hdri, octane render, pastel palette',
    model: 'Leonardo',
    tags: ['3D', 'مفهوم فني'],
    imageUrl: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=1200&q=80'
  }
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const users = new Map();

  for (const creator of CREATORS) {
    const user = await prisma.user.upsert({
      where: { username: creator.username },
      update: { name: creator.name, bio: creator.bio, accentColor: creator.accentColor },
      create: {
        username: creator.username,
        name: creator.name,
        bio: creator.bio,
        accentColor: creator.accentColor,
        email: `${creator.username}@khayal.demo`,
        passwordHash
      }
    });
    users.set(creator.username, user);
  }

  for (const post of POSTS) {
    const author = users.get(post.author);
    if (!author) continue;

    const existing = await prisma.post.findFirst({
      where: { authorId: author.id, title: post.title }
    });
    if (existing) continue;

    await prisma.post.create({
      data: {
        authorId: author.id,
        title: post.title,
        prompt: post.prompt,
        imageUrl: post.imageUrl,
        model: post.model,
        tags: post.tags
      }
    });
  }

  const [userCount, postCount] = await Promise.all([
    prisma.user.count(),
    prisma.post.count()
  ]);

  console.log(`✅ تمت التهيئة — ${userCount} مستخدم و${postCount} منشور`);
  console.log(`   كلمة مرور الحسابات التجريبية: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error('❌ فشلت التهيئة:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
