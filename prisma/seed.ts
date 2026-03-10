import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // 1. Create Super Admin
    const hashedPassword = await bcrypt.hash("woaishanzha", 10);
    const superAdmin = await prisma.user.upsert({
        where: { username: "adminmax" },
        update: {
            password: hashedPassword,
            role: "SUPER_ADMIN",
        },
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

    // 2. Clear existing course data to avoid duplicates in this specific setup
    await prisma.teacherLicense.deleteMany();
    await prisma.invitationCode.deleteMany();
    await prisma.orgLicense.deleteMany();
    await prisma.course.deleteMany();
    await prisma.courseSeries.deleteMany();

    // 3. Create all 5 Course Series
    const seriesData = [
        {
            id: "ai-interactive",
            name: "AI 互动教育体系",
            courses: ["AI 助手基础", "对话式编程入门"]
        },
        {
            id: "3d-printing",
            name: "3D 打印工具课程",
            courses: ["Lithophane 照片浮雕", "模型切片与打印"]
        },
        {
            id: "maker-l1",
            name: "AI 创客教育 L1",
            courses: ["景泰蓝工艺互动实验", "3D 打印笔空间建模"]
        },
        {
            id: "maker-l2",
            name: "AI 创客教育 L2",
            courses: ["参数化设计进阶", "智能机械结构"]
        },
        {
            id: "maker-l3",
            name: "AI 创客教育 L3",
            courses: ["综合创客项目集", "AI 视觉控制系统"]
        }
    ];

    for (const s of seriesData) {
        const series = await (prisma as any).courseSeries.upsert({
            where: { id: s.id },
            update: { name: s.name },
            create: {
                id: s.id,
                name: s.name,
                courses: {
                    create: s.courses.map(name => ({ name }))
                }
            }
        });
        console.log(`✅ Course Series created: ${series.name}`);
    }

    // 4. Create a Test Organization
    const testOrg = await prisma.organization.upsert({
        where: { id: "test-org-1" },
        update: {},
        create: {
            id: "test-org-1",
            name: "多面体创客实验室",
        },
    });
    console.log(`✅ Test Organization: ${testOrg.name}`);

    // 5. Create a Principal (ORG_ADMIN)
    const principalPassword = await bcrypt.hash("dmtjy888", 10);
    const principal = await (prisma as any).user.upsert({
        where: { username: "dmtjy" },
        update: {
            orgId: testOrg.id,
            role: "ORG_ADMIN",
        },
        create: {
            username: "dmtjy",
            name: "多面体 校长",
            initialPassword: "dmtjy888",
            password: principalPassword,
            role: "ORG_ADMIN",
            orgId: testOrg.id,
            credits: 5000,
        },
    });
    console.log(`✅ Principal created: ${principal.username}`);

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
