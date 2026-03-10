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
                        return {
                            id: user.id,
                            name: user.name,
                            username: user.username,
                            email: user.email,
                            role: user.role,
                            orgId: user.orgId
                        };
                    }
                    // 处理硬编码 adminmax 兜底 (只有当数据库中没设置密码时才允许用硬编码)
                    if (username === "adminmax" && password === "woaishanzha") {
                        return {
                            id: user.id,
                            name: user.name,
                            username: user.username,
                            email: user.email,
                            role: user.role,
                            orgId: user.orgId
                        };
                    }
                    // 处理无密码账户
                    if (!user.password && !password) {
                        return {
                            id: user.id,
                            name: user.name,
                            username: user.username,
                            email: user.email,
                            role: user.role,
                            orgId: user.orgId
                        };
                    }
                    throw new Error("提供密码以登录");
                }

                // 0. 特殊超级管理员兜底逻辑 - 如果数据库连 adminmax 记录都没有
                if (username === "adminmax" && password === "woaishanzha") {
                    return { id: "ADMIN_MAX", name: "超级管理员", username: "adminmax", email: "admin@3dai.com", role: "SUPER_ADMIN", orgId: null };
                }

                // 2. 如果账号不存在，尝试作为邀请码激活 (仅通过邀请码登录即视为自动注册)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const invite = await (prisma as any).invitationCode.findUnique({
                    where: { code: username.toUpperCase() },
                    include: { teacher: true }
                });

                if (!invite) {
                    throw new Error("账号或邀请码无效");
                }

                // 增加状态校验 (由老师或校长控制)
                if (invite.status === "DISABLED") {
                    throw new Error("该激活码已被停用，请联系您的老师");
                }

                if (invite.maxUses > 0 && invite.usedCount >= invite.maxUses) {
                    throw new Error("该邀请码已被使用完毕");
                }

                // 更新使用次数
                await prisma.invitationCode.update({
                    where: { id: invite.id },
                    data: { usedCount: { increment: 1 } }
                });

                // 学生账号自动生成
                const generatedUsername = `S-${username}_${Math.random().toString(36).substring(2, 6)}`.toUpperCase();

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const newUser = await (prisma as any).user.create({
                    data: {
                        username: generatedUsername,
                        name: `学生 (${username})`,
                        role: "STUDENT",
                        orgId: invite.teacher?.orgId,
                        teacherId: invite.teacherId,
                        usedInvitationCodeId: invite.id,
                        credits: 200,
                        initialPassword: "无 (激活码登录)"
                    }
                });

                return {
                    id: newUser.id,
                    name: newUser.name,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role,
                    orgId: newUser.orgId
                };
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.orgId = (user as any).orgId;
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).orgId = token.orgId;
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
