/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['paper'],
    eslint: {
        // Keeping this as safety for some experimental components, 
        // but we've fixed many linting issues.
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: '**',
            },
        ],
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Client-side build: ignore Node-only modules
            config.resolve.fallback = {
                ...config.resolve.fallback,
                canvas: false,
                fs: false,
                path: false,
                jsdom: false,
            };
        } else {
            // Server-side build: externals for paper to avoid node environment detection issues
            config.externals = [...(config.externals || []), {
                paper: 'paper',
                'paper/dist/paper-core': 'paper'
            }];
        }
        return config;
    },
};

export default nextConfig;
