'use client'

import type { Technology } from '@/lib/types'

function getTechIconUrl(name: string): string {
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

interface SkillsSectionProps {
  technologies: Technology[]
}

export function SkillsSection({ technologies }: SkillsSectionProps) {
  // Duplicate only 2x (sufficient for seamless infinite loop)
  const duplicatedTechs = [...technologies, ...technologies]

  return (
    <section className="py-20 bg-transparent relative overflow-hidden" id="skills">
      <div className="container mx-auto px-4 mb-12 text-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-serif italic text-white">Teknologi & Tools</h2>
        <div className="w-12 h-0.5 bg-white/20 mx-auto mt-4"></div>
      </div>

      {/* Marquee Container with Fade Edges — pure CSS animation, no JS */}
      <div className="relative flex overflow-x-hidden w-full before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-40 before:bg-gradient-to-r before:from-background before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-40 after:bg-gradient-to-l after:after:from-background after:to-transparent">
        <div
          className="flex whitespace-nowrap gap-12 py-4"
          style={{
            animation: 'marquee 40s linear infinite',
          }}
        >
          {duplicatedTechs.map((tech, idx) => (
            <div
              key={`${tech.id}-${idx}`}
              className="flex items-center gap-3 bg-white/5 border border-white/5 pl-8 pr-12 py-4 rounded-xl hover:border-white/20 transition-colors group"
            >
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                <img 
                  src={tech.icon_url || getTechIconUrl(tech.name)} 
                  alt={tech.name} 
                  className="w-6 h-6 object-contain grayscale opacity-50 brightness-200 group-hover:opacity-100 group-hover:grayscale-0 transition-all"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.tech-fallback')) {
                      const fallback = document.createElement('div');
                      fallback.className = "tech-fallback w-6 h-6 rounded bg-white/10 flex items-center justify-center text-[8px] font-bold text-white/40";
                      fallback.innerText = tech.name.slice(0, 2);
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
              <span className="text-sm font-bold text-white/60 group-hover:text-white tracking-widest uppercase transition-colors">{tech.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
