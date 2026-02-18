#!/usr/bin/env node

/**
 * Multi-Tenant Static Build Script
 *
 * This script builds a separate static site for each tenant.
 * Each build gets its own output directory with the tenant slug hardcoded.
 *
 * Usage:
 *   node build-tenants.js
 *
 * Outputs:
 *   out-iee-6049-ricardo-palma/
 *   out-ie-francisco-bolognesi-cervantes/
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Define your tenants here (must match backend tenant slugs)
const TENANTS = [
    {
        slug: 'iee-6049-ricardo-palma',
        name: 'I.E.E 6049 Ricardo Palma',
    },
    {
        slug: 'ie-francisco-bolognesi-cervantes',
        name: 'I.E Francisco Bolognesi Cervantes',
    },
];

console.log('🏗️  Multi-Tenant Static Build');
console.log('================================\n');

// Clean previous builds
console.log('🧹 Cleaning previous builds...');
TENANTS.forEach(tenant => {
    const outDir = path.join(__dirname, `out-${tenant.slug}`);
    if (fs.existsSync(outDir)) {
        fs.rmSync(outDir, { recursive: true, force: true });
        console.log(`   Removed: out-${tenant.slug}/`);
    }
});
console.log('');

// Build each tenant
TENANTS.forEach((tenant, index) => {
    console.log(`📦 Building ${index + 1}/${TENANTS.length}: ${tenant.name}`);
    console.log(`   Slug: ${tenant.slug}`);
    console.log(`   Output: out-${tenant.slug}/\n`);

    try {
        // Set tenant slug as environment variable and build
        const env = {
            ...process.env,
            NEXT_PUBLIC_TENANT_SLUG: tenant.slug,
        };

        execSync('npm run build', {
            cwd: __dirname,
            env: env,
            stdio: 'inherit',
        });

        // Rename 'out' to 'out-{tenant-slug}'
        const defaultOutDir = path.join(__dirname, 'out');
        const tenantOutDir = path.join(__dirname, `out-${tenant.slug}`);

        if (fs.existsSync(defaultOutDir)) {
            fs.renameSync(defaultOutDir, tenantOutDir);
            console.log(`   ✅ Build complete: out-${tenant.slug}/\n`);
        } else {
            console.error(`   ❌ Build failed: 'out' directory not found\n`);
        }

    } catch (error) {
        console.error(`   ❌ Build failed for ${tenant.slug}`);
        console.error(error.message);
        process.exit(1);
    }
});

console.log('================================');
console.log('✨ All tenant builds completed!\n');
console.log('📁 Output directories:');
TENANTS.forEach(tenant => {
    console.log(`   - out-${tenant.slug}/`);
});
console.log('\n💡 Deploy each directory to its subdomain:');
TENANTS.forEach(tenant => {
    const subdomain = tenant.slug.split('-')[0]; // e.g., 'iee' or 'ie'
    console.log(`   - out-${tenant.slug}/ → ${subdomain}.yourdomain.com`);
});
console.log('');
