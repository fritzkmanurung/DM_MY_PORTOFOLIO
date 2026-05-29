import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTechIconUrl(name: string): string {
  const normalized = name.toLowerCase().trim();
  const mappings: Record<string, string> = {
    'next.js': 'nextdotjs',
    'nextjs': 'nextdotjs',
    'node.js': 'nodedotjs',
    'nodejs': 'nodedotjs',
    'vue.js': 'vuedotjs',
    'vuejs': 'vuedotjs',
    'express.js': 'express',
    'expressjs': 'express',
    'tailwind css': 'tailwindcss',
    'tailwindcss': 'tailwindcss',
    'vs code': 'visualstudiocode',
    'vscode': 'visualstudiocode',
    'c++': 'cplusplus',
    'c#': 'csharp',
    'react.js': 'react',
    'reactjs': 'react',
    'three.js': 'threedotjs',
    'threejs': 'threedotjs',
    'framer motion': 'framer',
    'chatgpt': 'openai',
    'artificial intelligence': 'openai',
    'ai': 'openai',
    'machine learning': 'scikitlearn',
    'fastapi': 'fastapi',
    'supabase': 'supabase',
    'postgresql': 'postgresql',
    'postgres': 'postgresql',
    'mongodb': 'mongodb',
    'mysql': 'mysql',
    'git': 'git',
    'github': 'github',
    'html': 'html5',
    'css': 'css3',
    'javascript': 'javascript',
    'typescript': 'typescript',
    'python': 'python',
    'figma': 'figma',
    'docker': 'docker',
    // New Mappings to avoid 404s
    'codeigniter 4': 'codeigniter',
    'codeigniter': 'codeigniter',
    'filament php': 'laravel',
    'filament': 'laravel',
    'gemini api': 'googlegemini',
    'gemini': 'googlegemini',
    'alpine.js': 'alpinedotjs',
    'alpinejs': 'alpinedotjs',
    'phpword': 'php',
    'scikit-learn': 'scikitlearn',
    'scikitlearn': 'scikitlearn',
    'sklearn': 'scikitlearn',
  };

  if (mappings[normalized]) {
    return `https://cdn.simpleicons.org/${mappings[normalized]}`;
  }

  const slug = normalized
    .replace(/\.js$/, 'dotjs')
    .replace(/\+/g, 'plus')
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');

  return `https://cdn.simpleicons.org/${slug}`;
}
