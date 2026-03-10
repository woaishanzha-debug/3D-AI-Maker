import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // 1. Create Super Admin
    const hashedPassword = await bcrypt.hash("woaishanzha", 10);
    const superAdmin = await prisma.user.upsert({
        where: { username: "adminmax" },
        update: {},
        create: {
            username: "adminmax",
            name: "超级管理员",
            email: "admin@3dai.com",
            password: hashedPassword,
            role: "SUPER_ADMIN",
            credits: 99999,
        },
    });
    console.log(`✅ Super Admin created: ${superAdmin.username}`);

    // 2. Create a Test Organization
    const testOrg = await prisma.organization.create({
        data: {
            name: "宋工创意空间示范校",
        },
    });
    console.log(`✅ Test Organization created: ${testOrg.name}`);

    // 3. Create a Principal (ORG_ADMIN) for the Test Organization
    const principalPassword = await bcrypt.hash("org123", 10);
    const principal = await prisma.user.create({
        data: {
            username: "principal_song",
            name: "宋校长",
            password: principalPassword,
            role: "ORG_ADMIN",
            orgId: testOrg.id,
            credits: 5000,
        },
    });
    console.log(`✅ Principal created: ${principal.username}`);

    // 4. Create initial Course Series and Courses
    const series1 = await prisma.courseSeries.create({
        data: {
            name: "3D打印体系",
            courses: {
                create: [
                    { name: "掐丝珐琅互动实验" },
                    { name: "3D打印建模基础" },
                ]
            }
        }
    });
    console.log(`✅ Course Series created: ${series1.name}`);

    console.log("🏁 Seeding finished successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
