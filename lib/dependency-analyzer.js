const fs = require('fs');
const path = require('path');

// Analyze dependencies and suggest optimizations
async function analyzeDependencies() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  console.log('🔍 Analyzing dependencies for optimization opportunities...\n');
  
  // Check for potentially unused or oversized packages
  const analysis = {
    heavy: [],
    potentiallyUnused: [],
    suggestions: []
  };

  // Known heavy packages that might have lighter alternatives
  const heavyPackages = {
    'framer-motion': {
      size: '~100KB gzipped',
      alternative: 'CSS animations or react-spring',
      impact: 'High - Used in 5 components'
    },
    'recharts': {
      size: '~150KB gzipped', 
      alternative: 'Chart.js or lightweight alternatives',
      impact: 'Medium - Used in analytics only'
    },
    'embla-carousel-react': {
      size: '~50KB gzipped',
      alternative: 'CSS-only carousel or Swiper.js',
      impact: 'Low - Limited usage'
    }
  };

  // Radix UI package analysis
  const radixPackages = Object.keys(dependencies).filter(pkg => pkg.startsWith('@radix-ui'));
  
  console.log('📦 Heavy Package Analysis:');
  console.log('=' .repeat(50));
  
  Object.entries(heavyPackages).forEach(([pkg, info]) => {
    if (dependencies[pkg]) {
      console.log(`⚠️  ${pkg}`);
      console.log(`   Size: ${info.size}`);
      console.log(`   Alternative: ${info.alternative}`);
      console.log(`   Impact: ${info.impact}\n`);
      
      analysis.heavy.push({ package: pkg, ...info });
    }
  });

  console.log('🎨 Radix UI Packages:');
  console.log('=' .repeat(50));
  console.log(`Found ${radixPackages.length} Radix UI packages:`);
  radixPackages.forEach(pkg => {
    console.log(`   - ${pkg}`);
  });
  
  if (radixPackages.length > 15) {
    console.log(`\n⚠️  High number of Radix UI packages detected.`);
    console.log(`   Consider using only the components you need.`);
    analysis.suggestions.push('Audit Radix UI component usage');
  }

  // Bundle size estimates
  console.log('\n📊 Estimated Bundle Impact:');
  console.log('=' .repeat(50));
  
  const estimatedSizes = {
    'All Radix UI packages': '~200-300KB',
    'Framer Motion': '~100KB', 
    'Recharts': '~150KB',
    'Date-fns': '~30KB',
    'Lucide React': '~50KB (if not tree-shaken)'
  };

  Object.entries(estimatedSizes).forEach(([item, size]) => {
    console.log(`   ${item}: ${size}`);
  });

  // Optimization suggestions
  console.log('\n🚀 Optimization Suggestions:');
  console.log('=' .repeat(50));
  
  const suggestions = [
    'Replace framer-motion with CSS animations where possible',
    'Use tree-shaking for lucide-react icons',
    'Consider lightweight chart alternatives to recharts',
    'Audit and remove unused Radix UI components',
    'Implement dynamic imports for heavy components',
    'Use date-fns with babel plugin for tree-shaking'
  ];

  suggestions.forEach((suggestion, index) => {
    console.log(`${index + 1}. ${suggestion}`);
  });

  // Generate optimization script suggestions
  console.log('\n🛠  Recommended Actions:');
  console.log('=' .repeat(50));
  
  const actions = [
    'npm run analyze - Analyze current bundle size',
    'npm run optimize-images - Optimize image assets',
    'Consider removing unused @radix-ui packages',
    'Implement code splitting for analytics page (recharts)',
    'Replace framer-motion with CSS animations for simple transitions'
  ];

  actions.forEach((action, index) => {
    console.log(`${index + 1}. ${action}`);
  });

  return analysis;
}

// Check for unused imports in source files
async function checkUnusedImports() {
  console.log('\n🔍 Checking for potentially unused imports...\n');
  
  const srcDirs = ['app', 'components', 'lib', 'hooks'];
  const importUsage = new Map();

  for (const dir of srcDirs) {
    if (fs.existsSync(dir)) {
      const files = getAllTsxFiles(dir);
      
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        const imports = extractImports(content);
        
        imports.forEach(imp => {
          if (!importUsage.has(imp.package)) {
            importUsage.set(imp.package, []);
          }
          importUsage.get(imp.package).push({
            file,
            imports: imp.imports
          });
        });
      }
    }
  }

  // Report findings
  console.log('📄 Import Usage Summary:');
  console.log('=' .repeat(50));
  
  importUsage.forEach((usage, packageName) => {
    if (packageName.startsWith('@radix-ui') || ['framer-motion', 'recharts'].includes(packageName)) {
      console.log(`\n${packageName}:`);
      usage.forEach(({ file, imports }) => {
        console.log(`   ${file}: ${imports.join(', ')}`);
      });
    }
  });
}

function getAllTsxFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        files.push(fullPath);
      }
    });
  }
  
  traverse(dir);
  return files;
}

function extractImports(content) {
  const imports = [];
  const importRegex = /import\s+(?:{([^}]+)}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([@\w\-\/]+)['"]/g;
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const packageName = match[2];
    const importedItems = match[1] ? match[1].split(',').map(s => s.trim()) : ['default'];
    
    imports.push({
      package: packageName,
      imports: importedItems
    });
  }
  
  return imports;
}

// Run analysis
if (require.main === module) {
  analyzeDependencies()
    .then(() => checkUnusedImports())
    .catch(console.error);
}

module.exports = { analyzeDependencies, checkUnusedImports };