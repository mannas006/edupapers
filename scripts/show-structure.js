#!/usr/bin/env node
/**
 * Project Structure Generator
 * Generates a visual tree structure of the EduPapers project
 */

import fs from 'fs';
import path from 'path';

function generateTree(dir, prefix = '', isLast = true) {
  const items = fs.readdirSync(dir)
    .filter(item => !item.startsWith('.') && item !== 'node_modules' && item !== 'dist')
    .sort((a, b) => {
      const aIsDir = fs.statSync(path.join(dir, a)).isDirectory();
      const bIsDir = fs.statSync(path.join(dir, b)).isDirectory();
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.localeCompare(b);
    });

  let tree = '';
  
  items.forEach((item, index) => {
    const itemPath = path.join(dir, item);
    const isDirectory = fs.statSync(itemPath).isDirectory();
    const isLastItem = index === items.length - 1;
    
    // Icon and structure
    const icon = isDirectory ? '📂' : getFileIcon(item);
    const connector = isLastItem ? '└── ' : '├── ';
    const nextPrefix = prefix + (isLastItem ? '    ' : '│   ');
    
    tree += `${prefix}${connector}${icon} ${item}`;
    
    // Add description for important directories
    const description = getDirectoryDescription(item, isDirectory);
    if (description) {
      tree += ` ${description}`;
    }
    
    tree += '\n';
    
    // Recursively process directories (limit depth for readability)
    if (isDirectory && shouldExpand(item) && prefix.length < 12) {
      tree += generateTree(itemPath, nextPrefix, isLastItem);
    }
  });
  
  return tree;
}

function getFileIcon(filename) {
  const ext = path.extname(filename).toLowerCase();
  const icons = {
    '.js': '📜', '.ts': '📘', '.tsx': '⚛️', '.jsx': '⚛️',
    '.json': '📋', '.md': '📖', '.sql': '🗃️',
    '.css': '🎨', '.html': '🌐', '.py': '🐍',
    '.pdf': '📄', '.env': '🔐', '.gitignore': '🚫'
  };
  return icons[ext] || '📄';
}

function getDirectoryDescription(name, isDirectory) {
  if (!isDirectory) return '';
  
  const descriptions = {
    'src': '# Frontend source code',
    'server': '# Backend API server',
    'config': '# Configuration files',
    'docs': '# Documentation',
    'database': '# Database related files',
    'scripts': '# Utility scripts',
    'public': '# Static assets',
    'components': '# Reusable React components',
    'pages': '# Page components',
    'contexts': '# React contexts',
    'hooks': '# Custom React hooks',
    'lib': '# External library configurations',
    'types': '# TypeScript type definitions',
    'PDF Question Processor': '# Python PDF processing pipeline'
  };
  
  return descriptions[name] || '';
}

function shouldExpand(dirname) {
  const expandDirs = ['src', 'server', 'config', 'docs', 'database', 'scripts', 'components', 'pages'];
  return expandDirs.includes(dirname);
}

// Generate the tree
console.log('📁 EduPapers - Question Paper Organizer');
console.log('');
console.log(generateTree(process.cwd()));

console.log(`
🚀 Quick Commands:
├── npm run dev                    # Start frontend development server
├── npm run pdf-processor          # Start PDF processing server  
├── npm run dev-with-processor     # Start both servers
├── npm run build                  # Build for production
└── npm run lint                   # Run code linting

📖 Documentation available in docs/ directory
🗄️ Database schemas in database/ directory
⚙️ Configuration files in config/ directory
`);
