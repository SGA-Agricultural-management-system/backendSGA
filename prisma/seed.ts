import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Limpiar datos previos
  await prisma.activity.deleteMany();
  await prisma.lot.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // Crear usuario productor
  const hashedPassword = await bcrypt.hash('password123', 10);

  const producer = await prisma.user.create({
    data: {
      name: 'Carlos Productor',
      email: 'productor@sga.com',
      password: hashedPassword,
      role: 'farmer',
    },
  });

  // Crear finca (userId en vez de owner)
  const farm = await prisma.farm.create({
    data: {
      name: 'Finca La Esperanza',
      location: 'Bucaramanga, Santander',
      userId: producer.id,
    },
  });

  // Crear lotes
  const loteA = await prisma.lot.create({
    data: {
      name: 'Lote A',
      crop: 'Maíz',
      farmId: farm.id,
    },
  });

  const loteB = await prisma.lot.create({
    data: {
      name: 'Lote B',
      crop: 'Tomate',
      farmId: farm.id,
    },
  });

  const invernadero = await prisma.lot.create({
    data: {
      name: 'Invernadero 1',
      crop: 'Lechuga',
      farmId: farm.id,
    },
  });

  // Crear actividades (lotId en vez de lotName)
  await prisma.activity.createMany({
    data: [
      {
        type: 'SIEMBRA',
        crop: 'Maíz',
        quantity: 50,
        unit: 'kg',
        date: new Date('2026-01-10'),
        notes: 'Siembra inicial temporada 1',
        farmId: farm.id,
        lotId: loteA.id,
      },
      {
        type: 'RIEGO',
        crop: 'Tomate',
        quantity: 200,
        unit: 'litros',
        date: new Date('2026-01-15'),
        notes: 'Riego por goteo',
        farmId: farm.id,
        lotId: loteB.id,
      },
      {
        type: 'FERTILIZACION',
        crop: 'Lechuga',
        quantity: 10,
        unit: 'kg',
        date: new Date('2026-01-20'),
        notes: 'Fertilizante orgánico',
        farmId: farm.id,
        lotId: invernadero.id,
      },
    ],
  });

  // Crear admin
  const admin = await prisma.user.create({
    data: {
      name: 'Admin SGA',
      email: 'admin@sga.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
    },
  });

  console.log('✅ Seed completado');
  console.log(`   Usuario productor: productor@sga.com / password123`);
  console.log(`   Usuario admin:     admin@sga.com / admin123`);
  console.log(`   Finca: ${farm.name}`);
  console.log(`   Lotes: Lote A, Lote B, Invernadero 1`);
  console.log(`   Actividades: 3 creadas`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
