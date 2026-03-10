import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    // 1. 公开课逻辑：每个体系的第一节课公开
    const publicLessons = [
      "/course/l1/lesson-1",
      "/tools/s1",
      "/tools/lithophane-generator",
      "/course/12-ai/lesson-1"
    ];

    if (publicLessons.some(path => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    // 2. 权限拦截：
    // 如果是 SUPER_ADMIN 或 ADMIN，放行所有
    const token = req.nextauth.token;
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
          "/course/l1/lesson-1",
          "/course/12-ai/lesson-1",
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
    "/tools/:path*",
    "/course/:path*",
    "/dashboard/:path*"
  ]
};
