import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                username: { label: "用户名 / 邀请码", type: "text" },
                password: { label: "密码 / 密钥", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username) {
                    throw new Error("请输入账号或邀请码");
                }

                const { username, password } = credentials;

                // 1. 优先尝试作为已有账号登录 (通过用户名或邮箱)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const user = await (prisma as any).user.findFirst({
                    where: {
                        OR: [
                            { username: username },
                            { email: username }
                        ]
                    }
                });

                if (user) {
                    if (user.password && password) {
                        const isValid = await bcrypt.compare(password, user.password);
                        if (!isValid) throw new Error("密码错误");
                        return { id: user.id, name: user.name, username: user.username, email: user.email, role: user.role };
                    }
                    // 处理硬编码 adminmax 兜底 (只有当数据库中没设置密码时才允许用硬编码)
                    if (username === "adminmax" && password === "woaishanzha") {
                        return { id: user.id, name: user.name, username: user.username, email: user.email, role: user.role };
                    }
                    // 处理无密码账户
                    if (!user.password && !password) {
                        return { id: user.id, name: user.name, username: user.username, email: user.email, role: user.role };
                    }
                    throw new Error("提供密码以登录");
                }

                // 0. 特殊超级管理员兜底逻辑 - 如果数据库连 adminmax 记录都没有
                if (username === "adminmax" && password === "woaishanzha") {
                    return { id: "ADMIN_MAX", name: "超级管理员", username: "adminmax", email: "admin@3dai.com", role: "SUPER_ADMIN" };
                }

                // 2. 如果账号不存在，尝试作为邀请码激活
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const invite = await (prisma as any).invitationCode.findUnique({
                    where: { code: username.toUpperCase() },
                    include: { organization: true }
                });

                if (!invite) {
                    throw new Error("账号或邀请码无效");
                }

                // 增加状态校验
                if ((invite as any).status === "DISABLED") {
                    throw new Error("该激活码已被停用，请联系管理员");
                }

                if (invite.maxUses > 0 && invite.usedCount >= invite.maxUses) {
                    throw new Error("该邀请码已被使用完毕");
                }

                if (invite.expiresAt && new Date() > invite.expiresAt) {
                    throw new Error("该邀请码已过期");
                }

                // 激活码逻辑：
                // 如果是学生码 (STUDENT)，可能无需预设密码。
                // 如果是老师码 (TEACHER)，通常需要设置。
                const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

                // 增加激活码使用记录
                await prisma.invitationCode.update({
                    where: { id: invite.id },
                    data: { usedCount: { increment: 1 } }
                });

                // 对于学生邀请码，生成一个临时的唯一昵称，用户登录后可以自修改
                // 如果是 V2.0 规划中的“教师生成 -> 学生绑定”，这里创建一个未完全设定的账号
                const role = invite.type === "TEACHER" ? "TEACHER" : (invite.type === "PRINCIPAL" ? "ORG_ADMIN" : "STUDENT");
                const generatedUsername = invite.type === "STUDENT"
                    ? `STU_${username}_${Math.random().toString(36).substring(2, 5)}`.toUpperCase()
                    : (invite.type === "PRINCIPAL" ? `PRIN_${username}`.toUpperCase() : `TEA_${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const newUser = await (prisma as any).user.create({
                    data: {
                        username: generatedUsername,
                        name: invite.type === "STUDENT" ? "新学生" : (invite.type === "PRINCIPAL" ? "机构校长" : "新教师"),
                        password: hashedPassword,
                        role: role,
                        organizationId: invite.organizationId,
                        usedInvitationCodeId: invite.id,
                        credits: role === "TEACHER" || role === "ORG_ADMIN" ? 1000 : 200
                    }
                });

                return { id: newUser.id, name: newUser.name, username: newUser.username, email: newUser.email, role: newUser.role };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.role = (user as any).role;
                token.id = user.id;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.username = (user as any).username;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).role = token.role;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).id = token.id;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).username = token.username;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
        error: "/login"
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development_only_12345"
};
