import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding data...')

  // 1. Seed Empresa
  const empresa = await prisma.empresas.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nombre: 'SOCIEDAD AGROVASPALMA S.A.S.',
      nit: '901.666.764-5',
      direccion: 'KDX 9-1 B Vrd Llano Grande - Norte de Santander',
      telefono: '315 393 0918',
      email: 'facturacion@agrovaspalma.com',
    },
  })
  console.log('Empresa creada:', empresa.nombre)

  // 2. Seed Usuario Administrador
  const adminPinPlain = '1234'
  const adminPinHashed = await bcrypt.hash(adminPinPlain, 10)
  
  const adminUser = await prisma.usuarios.upsert({
    where: { cedula: '1234567890' }, // Dummy cedula for the initial admin
    update: {},
    create: {
      nombre: 'Admin',
      cedula: '1234567890',
      rol: 'ADMINISTRADOR',
      pin: adminPinHashed,
      activo: true,
    },
  })
  console.log('Usuario creado:', adminUser.nombre, 'con PIN:', adminPinPlain)

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
