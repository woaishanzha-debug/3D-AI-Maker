import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    // 1. 公开课逻辑：每个体系的第一节课公开
    const publicLessons = [
      "/course/l1/cloisonne-intro",
      "/course/l1/cloisonne",
      "/course/l1/shadow-play",
      "/course/l1/blue-white-porcelain",
      "/tools/s1",
      "/tools/lithophane-generator",
      "/course/12-ai/lesson-1",
      "/course/l1/paper-cutting"
    ];

    if (publicLessons.some(path => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    // 2. 权限拦截：
    const token = req.nextauth.token;

    // Route-based RBAC
    if (pathname.startsWith("/admin") && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (pathname.startsWith("/org") && token?.role !== "ORG_ADMIN" && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (pathname.startsWith("/teacher") && token?.role !== "TEACHER" && token?.role !== "ORG_ADMIN" && token?.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // 如果是 SUPER_ADMIN 或 ADMIN，放行所有其他页面
    if (token?.role === "SUPER_ADMIN" || token?.role === "ADMIN") {
      return NextResponse.next();
    }

    // 默认行为：withAuth 已经处理了未登录重定向
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // 不需要登录即可访问的路径
        const publicPaths = [
          "/course/l1/cloisonne-intro",
          "/course/l1/cloisonne",
          "/course/l1/shadow-play",
          "/course/l1/blue-white-porcelain",
          "/course/12-ai/lesson-1",
      "/course/l1/paper-cutting",
          "/course/l1/paper-cutting",
          "/tools/s1",
          "/tools/lithophane-generator",
          "/login",
          "/register",
          "/student-join",
          "/gallery",
          "/api/auth"
        ];

        if (publicPaths.some(path => pathname.startsWith(path))) {
          return true;
        }

        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    }
  }
);

// 定义需要权限检查的路由路径
// 注意：gallery 和 student-join 是公开页面，不要放在这里
export const config = {
  matcher: [
    "/admin/:path*",
    "/org/:path*",
    "/teacher/:path*",
    "/tools/:path*",
    "/course/:path*",
    "/dashboard/:path*"
  ]
};
