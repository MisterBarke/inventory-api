import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
   const hashedPassword = await bcrypt.hash('sudo@123SUDO', 10); 

  const sudoUser = await prisma.users.upsert({
    where: { email: 'bachirmahbarke@gmail.com' },
    update: {}, // Ne fait rien si l'utilisateur existe déjà
    create: {
      email: 'bachirmahbarke@gmail.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUDO',
    },
  });

  console.log('Utilisateur sudo créé :', sudoUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
