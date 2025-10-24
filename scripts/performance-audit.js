#!/usr/bin/env node

/**
 * Performance Audit Script
 * 
 * This script helps monitor and optimize performance metrics
 * Run with: node scripts/performance-audit.js
 */

const fs = require('fs');
const path = require('path');

// Performance thresholds
const THRESHOLDS = {
  LCP: 2500, // 2.5s
  FCP: 1800, // 1.8s
  FID: 100,  // 100ms
  CLS: 0.1,  // 0.1
  TTFB: 800, // 800ms
};

// Bundle size thresholds
const BUNDLE_THRESHOLDS = {
  firstLoad: 250000, // 250KB
  totalSize: 1000000, // 1MB
};

function checkBundleSize() {
  console.log('📦 Checking bundle sizes...');
  
  const buildDir = path.join(__dirname, '..', '.next');
  if (!fs.existsSync(buildDir)) {
    console.log('❌ Build directory not found. Run `npm run build` first.');
    return false;
  }
  
  // Check for bundle analysis
  const staticDir = path.join(buildDir, 'static');
  if (fs.existsSync(staticDir)) {
    const chunks = fs.readdirSync(staticDir, { recursive: true })
      .filter(file => file.endsWith('.js'))
      .map(file => {
        const filePath = path.join(staticDir, file);
        const stats = fs.statSync(filePath);
        return { file, size: stats.size };
      })
      .sort((a, b) => b.size - a.size);
    
    console.log('📊 Largest JavaScript chunks:');
    chunks.slice(0, 5).forEach(chunk => {
      const sizeKB = (chunk.size / 1024).toFixed(2);
      const status = chunk.size > BUNDLE_THRESHOLDS.firstLoad ? '❌' : '✅';
      console.log(`  ${status} ${chunk.file}: ${sizeKB}KB`);
    });
    
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
    const status = totalSize > BUNDLE_THRESHOLDS.totalSize ? '❌' : '✅';
    console.log(`\n${status} Total bundle size: ${totalSizeMB}MB`);
    
    return totalSize <= BUNDLE_THRESHOLDS.totalSize;
  }
  
  return true;
}

function checkCriticalFiles() {
  console.log('\n🔍 Checking critical performance files...');
  
  const files = [
    'src/lib/queries/optimized-dashboard.ts',
    'src/lib/redis.ts',
    'src/app/api/dashboard/route.ts',
    'next.config.ts',
    'prisma/schema.prisma',
  ];
  
  let allExist = true;
  
  files.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    const exists = fs.existsSync(filePath);
    const status = exists ? '✅' : '❌';
    console.log(`  ${status} ${file}`);
    if (!exists) allExist = false;
  });
  
  return allExist;
}

function checkDatabaseIndexes() {
  console.log('\n🗄️  Checking database indexes...');
  
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  const requiredIndexes = [
    'clerkUserId',
    'createdAt',
    'orderId',
    'status',
  ];
  
  let hasIndexes = true;
  
  requiredIndexes.forEach(index => {
    const hasIndex = schema.includes(`@@index([${index}])`) || 
                    schema.includes(`@@index([clerkUserId, ${index}])`);
    const status = hasIndex ? '✅' : '❌';
    console.log(`  ${status} Index on ${index}`);
    if (!hasIndex) hasIndexes = false;
  });
  
  return hasIndexes;
}

function generatePerformanceReport() {
  console.log('🚀 Performance Audit Report');
  console.log('========================\n');
  
  const bundleCheck = checkBundleSize();
  const filesCheck = checkCriticalFiles();
  const indexesCheck = checkDatabaseIndexes();
  
  console.log('\n📋 Summary:');
  console.log(`  Bundle optimization: ${bundleCheck ? '✅' : '❌'}`);
  console.log(`  Critical files: ${filesCheck ? '✅' : '❌'}`);
  console.log(`  Database indexes: ${indexesCheck ? '✅' : '❌'}`);
  
  const overall = bundleCheck && filesCheck && indexesCheck;
  console.log(`\n🎯 Overall status: ${overall ? '✅ PASS' : '❌ NEEDS WORK'}`);
  
  if (!overall) {
    console.log('\n💡 Recommendations:');
    if (!bundleCheck) {
      console.log('  - Run `npm run build` and check bundle sizes');
      console.log('  - Consider code splitting for large chunks');
    }
    if (!filesCheck) {
      console.log('  - Ensure all performance optimization files exist');
    }
    if (!indexesCheck) {
      console.log('  - Run `npx prisma migrate dev` to add database indexes');
    }
  }
  
  console.log('\n🔧 Next steps:');
  console.log('  1. Deploy changes to production');
  console.log('  2. Monitor Core Web Vitals in Vercel Analytics');
  console.log('  3. Run Lighthouse audit on production');
  console.log('  4. Set up performance monitoring alerts');
}

// Run the audit
generatePerformanceReport();
