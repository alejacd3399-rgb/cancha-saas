import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Creando datos de prueba...");

  // 1. Buscar o crear tenant de prueba
  const tenant = await prisma.tenants.upsert({
    where: { slug: "el-golazo" },
    update: {},
    create: {
      business_name: "Canchas El Golazo",
      slug: "el-golazo",
      phone: "3001234567",
      email: "golazo@email.com",
    },
  });
  console.log("✅ Tenant:", tenant.business_name);

  // 2. Crear usuario dueño de cancha
  const passwordHash = await bcrypt.hash("123456", 10);
  await prisma.tenant_users.upsert({
    where: { email: "dueno@golazo.com" },
    update: {},
    create: {
      tenant_id: tenant.id,
      email: "dueno@golazo.com",
      full_name: "Carlos Dueno",
      password_hash: passwordHash,
      role: "owner",
    },
  });
  console.log("✅ Usuario dueno: dueno@golazo.com");

  // 3. Crear usuario administradora
  const adminHash = await bcrypt.hash("admin123", 10);
  await prisma.tenant_users.upsert({
    where: { email: "admin@canchasaas.com" },
    update: {},
    create: {
      tenant_id: tenant.id,
      email: "admin@canchasaas.com",
      full_name: "Administradora",
      password_hash: adminHash,
      role: "owner",
    },
  });
  console.log("✅ Admin: admin@canchasaas.com");

  console.log("\n Datos listos!");
  console.log("Dueno  - Email: dueno@golazo.com / Pass: 123456");
  console.log("Admin  - Email: admin@canchasaas.com / Pass: admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());