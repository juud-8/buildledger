/**
 * Next.js Configuration
 * 
 * Production-optimized configuration with security, performance,
 * and monitoring features for the BuildLedger application.
 * 
 * @author BuildLedger Team
 * @version 1.0.0
 */

import type { NextConfig } from "next"
// import { withSentryConfig } from "@sentry/nextjs"

// Bundle analyzer for performance optimization
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// Environment-specific configuration
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  // Standalone output for optimized Docker deployment
  output: 'standalone',
  
  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: isProduction ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // Image optimization configuration
  images: {
    // Enable image optimization
    unoptimized: false,
    // Image domains for external images
    domains: [
      'supabase.co',
      'www.gravatar.com',
      'images.unsplash.com'
    ],
    // Image formats to serve
    formats: ['image/avif', 'image/webp'],
    // Image sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Minimum cache TTL for optimized images
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Experimental features for performance
  experimental: {
    // Package import optimization
    optimizePackageImports: [
      '@react-pdf/renderer',
      'recharts',
      '@supabase/supabase-js',
      'react-hook-form',
      'date-fns'
    ],
    // Enable Turbopack in development
    turbo: isDevelopment ? {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    } : undefined,
    // WebAssembly optimization
    webVitalsAttribution: ['CLS', 'LCP'],
    // Optimize server components
    serverComponentsExternalPackages: ['sharp'],
  },

  // Performance optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,

  // Security headers
  async headers() {
    const headers = [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Referrer policy for privacy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://api.emailjs.com https://js.stripe.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://*.supabase.co https://api.emailjs.com wss://*.supabase.co https://api.stripe.com",
              "frame-src https://js.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          // Permissions policy
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'payment=(self)',
            ].join(', '),
          },
        ],
      },
      // Add cache headers for static assets
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]

    // Add HSTS header in production
    if (isProduction) {
      headers[0].headers.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      })
    }

    return headers
  },

  // Redirects for SEO and user experience
  async redirects() {
    return [
      // Remove www subdomain
      {
        source: '/www/:path*',
        destination: '/:path*',
        permanent: true,
      },
      // Legacy route redirects
      {
        source: '/app/:path*',
        destination: '/dashboard/:path*',
        permanent: true,
      },
      // Redirect root to dashboard for authenticated users
      {
        source: '/home',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },

  // Rewrites for API proxy and maintenance mode
  async rewrites() {
    const rewrites = []

    // Maintenance mode (uncomment during maintenance)
    // if (process.env.MAINTENANCE_MODE === 'true') {
    //   rewrites.push({
    //     source: '/((?!maintenance|_next|api).*)',
    //     destination: '/maintenance'
    //   })
    // }

    return rewrites
  },

  // Environment variables available to the client
  env: {
    BUILD_TIME: new Date().toISOString(),
    BUILD_VERSION: process.env.npm_package_version || '1.0.0',
  },

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Separate vendor chunks
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 244000,
          },
          // Separate React chunks
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
          },
          // Separate UI library chunks
          ui: {
            test: /[\\/]node_modules[\\/](@headlessui|@heroicons|recharts)[\\/]/,
            name: 'ui',
            chunks: 'all',
          },
        },
      }
    }

    // Add support for SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    // Bundle analyzer in development
    if (dev && process.env.ANALYZE === 'true') {
      config.plugins.push(
        new webpack.DefinePlugin({
          __BUNDLE_ANALYZER__: JSON.stringify(true),
        })
      )
    }

    return config
  },

  // TypeScript configuration
  typescript: {
    // Type checking is handled separately in CI/CD
    ignoreBuildErrors: process.env.CI === 'true',
  },

  // ESLint configuration
  eslint: {
    // Linting is handled separately in CI/CD
    ignoreDuringBuilds: process.env.CI === 'true',
  },

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: isDevelopment,
    },
  },
}

// Apply bundle analyzer
const configWithAnalyzer = withBundleAnalyzer(nextConfig)

// Apply Sentry configuration in production (if available)
const finalConfig = isProduction && process.env.SENTRY_DSN 
  ? (() => {
      try {
        const { withSentryConfig } = require("@sentry/nextjs")
        return withSentryConfig(
          configWithAnalyzer,
          {
            // Sentry configuration options
            silent: true,
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            authToken: process.env.SENTRY_AUTH_TOKEN,
          },
          {
            // Upload source maps to Sentry
            hideSourceMaps: true,
            disableLogger: true,
            widenClientFileUpload: true,
          }
        )
      } catch (error) {
        console.warn('Sentry not available, skipping Sentry configuration')
        return configWithAnalyzer
      }
    })()
  : configWithAnalyzer

export default finalConfig
