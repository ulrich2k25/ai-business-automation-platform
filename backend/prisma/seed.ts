import * as bcrypt from 'bcrypt';
import { PrismaService } from '../src/prisma/prisma.service';

const prisma = new PrismaService();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  let company = await prisma.company.findFirst({
    where: {
      name: 'Demo Company',
    },
  });

  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'Demo Company',
      },
    });
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: 'test@test.com',
    },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        email: 'test@test.com',
        password,
        role: 'ADMIN',
        companyId: company.id,
      },
    });
  }

  console.log('Seed terminé : utilisateur test créé');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
