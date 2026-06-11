import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Creando datos de prueba...");

  // 1. Crear tenant de prueba
  const tenant = await prisma.tenants.create({
    data: {
      business_name: "Canchas El Golazo",
      slug: "el-golazo",
      phone: "3001234567",
      email: "golazo@email.com",
    },
  });
  console.log("✅ Tenant creado:", tenant.business_name);

  // 2. Crear usuario dueño de cancha
  const passwordHash = await bcrypt.hash("123456", 10);

  const usuario = await prisma.tenant_users.create({
    data: {
      tenant_id: tenant.id,
      email: "dueno@golazo.com",
      full_name: "Carlos Dueño",
      password_hash: passwordHash,
      role: "owner",
    },
  });
  console.log("✅ Usuario creado:", usuario.email);

  console.log("\n🎉 Datos de prueba listos!");
  console.log("Email: dueno@golazo.com");
  console.log("Password: 123456");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());