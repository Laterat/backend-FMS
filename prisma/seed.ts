import 'dotenv/config'
import { PrismaClient , Prisma} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({ adapter, });

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: 'mekonnenlatera@gmail.com' },
  });

  if (!existing) {
    await prisma.user.create({
      data: {
        id: '407005d4-b8cc-4d62-ac04-e581838931e2',
        fullName: 'Latera Tilahun',
        email: 'mekonnenlatera@gmail.com',
        role: 'HQ_ADMIN',
        branchId: null,
        isActive: true,
      },
    });
    console.log('HQ Admin seeded!');
  } else {
    console.log('HQ Admin already exists in DB.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
