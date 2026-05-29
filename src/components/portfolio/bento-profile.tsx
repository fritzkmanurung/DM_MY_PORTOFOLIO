'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { MapPin, Mail, CheckCircle2 } from 'lucide-react'
import type { Profile, Education, Technology, Skill } from '@/lib/types'

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


interface BentoProfileProps {
  profile: Profile | null
  resumeUrl: string | null
  educations: Education[]
  technologies: Technology[]
  skills: Skill[]
  siteSettings: Record<string, string>
}

export function BentoProfile({ profile, resumeUrl, educations, technologies, skills, siteSettings }: BentoProfileProps) {
  const [age, setAge] = useState<number | null>(null)

  useEffect(() => {
    if (profile?.birth_date) {
      const calculatedAge = Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      setTimeout(() => setAge(calculatedAge), 0)
    }
  }, [profile?.birth_date])

  const profileImage = profile?.avatar_url || '/placeholder-avatar.png'
  const profileImage2 = profile?.avatar_url_2 || profileImage
  const name = profile?.full_name || 'Your Name'
  const firstName = name.split(' ')[0]

  // Get exactly the requested technologies: 3 Backend (Laravel, CodeIgniter 4, Flask), 1 Database (MySQL), 1 AI/ML, 1 Frontend, 2 Tools (Git, GitHub)
  // And sort them by category: Backend, Database, AI/ML, Frontend, Tools, Design
  const getDisplayTechnologies = () => {
    const backend = technologies.filter(t => 
      t.category === 'Backend' && 
      ['laravel', 'codeigniter 4', 'flask'].includes(t.name.toLowerCase())
    )
    if (backend.length < 3) {
      const extra = technologies.filter(t => t.category === 'Backend' && !backend.includes(t))
      backend.push(...extra.slice(0, 3 - backend.length))
    }

    const database = technologies.filter(t => 
      t.category === 'Database' && 
      t.name.toLowerCase() === 'mysql'
    ).slice(0, 1)
    if (database.length === 0) {
      database.push(...technologies.filter(t => t.category === 'Database').slice(0, 1))
    }


    
    const frontend = technologies.filter(t => t.category === 'Frontend').slice(0, 1)

    const tools = technologies.filter(t => 
      t.category === 'Tools' && 
      ['git', 'github'].includes(t.name.toLowerCase())
    )
    if (tools.length < 2) {
      const extra = technologies.filter(t => t.category === 'Tools' && !tools.includes(t))
      tools.push(...extra.slice(0, 2 - tools.length))
    }

    const selected = [...backend, ...database, ...frontend, ...tools]

    const catPriority: Record<string, number> = {
      'Backend': 1,
      'Database': 2,
      'AI/ML': 3,
      'Frontend': 4,
      'Tools': 5,
      'Design': 6
    }

    selected.sort((a, b) => {
      const pA = catPriority[a.category || ''] || 99
      const pB = catPriority[b.category || ''] || 99
      if (pA !== pB) return pA - pB
      return (a.sort_order || 0) - (b.sort_order || 0)
    })

    return selected
  }

  const displayTechnologies = getDisplayTechnologies()

  // Format name for background display
  const nameParts = name.toUpperCase().split(' ')
  const bgName = nameParts.length >= 3 
    ? `${nameParts[0]} \u00a0 \u00a0 ${nameParts[1].charAt(0)} \u00a0 \u00a0 ${nameParts.slice(2).join(' ')}`
    : name.toUpperCase()

  return (
    <section id="profile" className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col relative border border-white/10 bg-zinc-900/20 backdrop-blur-md"
      >
        {/* ========================================= */}
        {/* ===== DESKTOP LAYOUT (HIDDEN ON MOBILE) ===== */}
        {/* ========================================= */}
        <div className="hidden lg:block w-full">
          {/* ===== TOP SECTION (DARK) ===== */}
          <div className="bg-[#0f0f11]/80 text-white w-full relative overflow-hidden backdrop-blur-sm">
   
            {/* Nav Bar */}
            <header className="relative z-30 flex items-center justify-between px-8 md:px-12 py-5">
              <span className="text-3xl font-bold tracking-tighter text-white font-serif italic">{firstName}.</span>
              <nav className="hidden md:flex items-center gap-1 bg-white/5 px-2 py-1.5 rounded-2xl shadow-sm backdrop-blur-md border border-white/10">
                <a href="#" className="text-white text-xs font-bold tracking-wider px-4 py-2 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  Beranda
                </a>
                
                {(siteSettings['section_profile'] ?? 'true') === 'true' && (
                  <a href="#profile" className="text-zinc-400 text-xs font-bold tracking-wider px-4 py-2 rounded-xl hover:bg-white/10 transition-colors">Tentang</a>
                )}
                
                {(siteSettings['section_projects'] ?? 'true') === 'true' && (
                  <a href="#works" className="text-zinc-400 text-xs font-bold tracking-wider px-4 py-2 rounded-xl hover:bg-white/10 transition-colors">Proyek</a>
                )}

                {(siteSettings['section_certificates'] ?? 'true') === 'true' && (
                  <a href="#certificates" className="text-zinc-400 text-xs font-bold tracking-wider px-4 py-2 rounded-xl hover:bg-white/10 transition-colors">Sertifikat</a>
                )}

                {(siteSettings['section_experience'] ?? 'true') === 'true' && (
                  <a href="#experience" className="text-zinc-400 text-xs font-bold tracking-wider px-4 py-2 rounded-xl hover:bg-white/10 transition-colors">Pengalaman</a>
                )}

                {(siteSettings['section_footer'] ?? 'true') === 'true' && (
                  <a href="#contact" className="text-zinc-400 text-xs font-bold tracking-wider px-4 py-2 rounded-xl hover:bg-white/10 transition-colors">Kontak</a>
                )}
              </nav>
            </header>
  
            {/* Huge Background Name */}
            <div className="absolute top-16 left-0 right-0 text-center pointer-events-none select-none z-0 px-4">
              <h2 className="text-4xl md:text-[5rem] lg:text-[7rem] font-bold tracking-tighter leading-none text-white/[0.03] whitespace-nowrap overflow-hidden">
                {bgName}
              </h2>
              <p className="text-base md:text-lg text-white/10 font-medium tracking-widest mt-1">{profile?.role_title || 'Developer'}</p>
            </div>
  
            {/* Content Row: Education - Photo - Stats */}
            <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-end justify-between px-8 md:px-12 pt-8 pb-0 min-h-[400px] gap-8 lg:gap-0">
  
              {/* Left: Education (from DB) */}
              <div className="flex-1 max-w-xs pb-8">
                <h3 className="font-bold text-sm mb-5 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                  Riwayat Pendidikan
                </h3>
                <div className="border-l-2 border-white/5 pl-5 space-y-4">
                  {educations.map((edu) => (
                    <div key={edu.id} className="relative">
                      <div className="absolute -left-[27px] top-1 w-2.5 h-2.5 bg-white rounded-full border-[3px] border-[#0f0f11]"></div>
                      <div className="flex items-baseline gap-4">
                        <span className="text-[10px] font-bold text-zinc-500 whitespace-nowrap">{edu.start_year}<br/>{edu.end_year || 'Now'}</span>
                        <div>
                          <div className="font-bold text-sm">{edu.institution}</div>
                          {edu.location && <div className="text-xs text-zinc-400">{edu.location}</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                  {educations.length === 0 && (
                    <p className="text-xs text-zinc-500 italic">Belum ada data pendidikan</p>
                  )}
                </div>
              </div>
  
              {/* Center: Profile Photo */}
              <div className="flex-shrink-0 relative self-center lg:self-auto mx-auto lg:mx-4">
                <Image
                  src={profileImage}
                  alt={name}
                  width={400}
                  height={420}
                  priority
                  className="h-[250px] sm:h-[350px] md:h-[420px] w-auto object-contain object-bottom drop-shadow-2xl"
                />
                {/* Signature overlay */}
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 font-serif italic text-4xl text-white drop-shadow-lg whitespace-nowrap opacity-80">
                  {firstName}
                </div>
              </div>
  
              {/* Right: Stats */}
              <div className="flex-1 max-w-xs flex flex-col items-center lg:items-end pb-8">
                {age && (
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-16 h-16 rounded-full border-2 border-white/10 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold leading-none">{age}</span>
                      <span className="text-[6px] uppercase font-bold tracking-widest text-zinc-400">Tahun</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
  
          {/* ===== BOTTOM SECTION (DARK) ===== */}
          <div className="bg-[#09090b]/90 text-white w-full flex flex-col lg:flex-row backdrop-blur-md">
  
            {/* Left: Photo (different angle, side view) */}
            <div className="lg:w-[30%] relative min-h-[300px] overflow-hidden flex items-end border-b lg:border-b-0 lg:border-r border-white/5 pr-0 lg:pr-8">
              <Image
                src={profileImage2}
                alt={name}
                fill
                sizes="(max-width: 1024px) 100vw, 30vw"
                className="object-cover object-top opacity-80"
              />
            </div>
  
            {/* Right: Bio & Info */}
            <div className="lg:w-[70%] p-8 md:p-12 flex flex-col justify-between">
              <div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight mb-2">
                  Halo, Nama Saya <span className="font-serif italic text-xl md:text-2xl lg:text-3xl text-zinc-100 font-semibold">{name}</span>
                </h2>
                <p className="text-zinc-300 text-sm font-medium mb-5">
                  {profile?.role_title || 'Developer'}
                </p>
                <p className="text-zinc-100 text-sm leading-relaxed w-full mb-8 text-justify">
                  {profile?.bio || 'Bio belum diisi.'}
                </p>
  
                {/* Technologies (Tech Stack) */}
                {displayTechnologies.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[10px] uppercase font-bold mb-3 text-zinc-500 tracking-widest">Tech Stack :</p>
                    <div className="flex flex-wrap gap-2.5">
                      {displayTechnologies.map((tech) => (
                        <div key={tech.id} className="px-3 py-2 bg-white/5 backdrop-blur-md rounded-lg flex items-center gap-2 text-[10px] font-bold text-zinc-100 border border-white/10 group cursor-default hover:border-white/20 transition-colors" title={tech.name}>
                          <img 
                            src={getTechIconUrl(tech.name)} 
                            alt={tech.name} 
                            className="w-3.5 h-3.5 object-contain grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all brightness-200" 
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <span>{tech.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
  
                {/* Skills (Keahlian) */}
                {skills.length > 0 && (
                  <div className="mb-8">
                    <p className="text-[10px] uppercase font-bold mb-3 text-zinc-500 tracking-widest">Keahlian :</p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <div key={skill.id} className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 group hover:border-white/30 transition-colors">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span className="text-[11px] font-medium text-zinc-300 group-hover:text-white transition-colors">{skill.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
  
              {/* Contact Info */}
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6 pt-5 border-t border-white/10">
                  <div className="flex gap-3">
                    <Mail className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[8px] uppercase text-zinc-400 font-bold tracking-widest">Email</p>
                      <p className="text-sm font-bold text-white">{profile?.email || '-'}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[8px] uppercase text-zinc-400 font-bold tracking-widest">Lokasi</p>
                      <p className="text-sm font-bold text-white">{profile?.location || '-'}</p>
                    </div>
                  </div>
                </div>
  
                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {resumeUrl ? (
                    <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="flex-1 border border-white/15 text-white px-5 py-3.5 rounded-xl text-[10px] font-bold tracking-widest uppercase hover:bg-white/5 transition-colors text-center">
                      UNDUH CV
                    </a>
                  ) : (
                    <button disabled className="flex-1 border border-white/15 text-zinc-600 px-5 py-3.5 rounded-xl text-[10px] font-bold tracking-widest uppercase cursor-not-allowed text-center">
                      UNDUH CV
                    </button>
                  )}
                  <a href={`mailto:${profile?.email || ''}`} className="flex-1 bg-white text-black px-5 py-3.5 rounded-xl text-[10px] font-bold tracking-widest uppercase hover:bg-zinc-200 transition-colors text-center">
                    HUBUNGI SAYA
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* ===== MOBILE LAYOUT (HIDDEN ON DESKTOP) ===== */}
        {/* ========================================= */}
        <div className="block lg:hidden w-full flex-col">
          
          {/* MOBILE BLOCK 1: Bio over Primary Photo */}
          <div className="relative w-full bg-[#0f0f11] text-white">
            <Image 
              src={profileImage} 
              alt={name} 
              fill
              sizes="100vw"
              className="object-cover opacity-15 pointer-events-none" 
            />
            {/* Optional gradient overlay to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f11] via-[#0f0f11]/60 to-[#0f0f11]/20 pointer-events-none"></div>
            
            <div className="relative z-10 p-6 pt-12 pb-10 flex flex-col">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight leading-tight mb-2">
                Halo, Nama Saya <span className="font-serif italic text-lg sm:text-xl text-zinc-100 font-semibold">{name}</span>
              </h2>
              <p className="text-zinc-300 text-sm font-medium mb-6">
                {profile?.role_title || 'Developer'}
              </p>
              <p className="text-zinc-200 text-sm leading-relaxed mb-8 text-justify">
                {profile?.bio || 'Bio belum diisi.'}
              </p>
              
              {/* Technologies (Tech Stack) */}
              {displayTechnologies.length > 0 && (
                <div className="mb-6">
                  <p className="text-[10px] uppercase font-bold mb-3 text-zinc-400 tracking-widest">Tech Stack :</p>
                  <div className="flex flex-wrap gap-2.5">
                    {displayTechnologies.map((tech) => (
                      <div key={tech.id} className="px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg flex items-center gap-2 text-[10px] font-bold text-zinc-100 border border-white/10 group" title={tech.name}>
                        <img 
                          src={getTechIconUrl(tech.name)} 
                          alt={tech.name} 
                          className="w-3.5 h-3.5 object-contain grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all brightness-200" 
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span>{tech.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills (Keahlian) */}
              {skills.length > 0 && (
                <div className="mb-10">
                  <p className="text-[10px] uppercase font-bold mb-3 text-zinc-400 tracking-widest">Keahlian :</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <div key={skill.id} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-[11px] font-medium text-white">{skill.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8 pt-6 border-t border-white/10">
                <div className="flex gap-3">
                  <Mail className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[8px] uppercase text-zinc-400 font-bold tracking-widest">Email</p>
                    <p className="text-sm font-bold text-white">{profile?.email || '-'}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[8px] uppercase text-zinc-400 font-bold tracking-widest">Lokasi</p>
                    <p className="text-sm font-bold text-white">{profile?.location || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Buttons moved to Block 2 */}
            </div>
          </div>

          {/* MOBILE BLOCK 2: Education over Secondary Photo */}
          <div className="relative w-full bg-[#09090b] text-white border-t border-white/5">
            <Image 
              src={profileImage2} 
              alt={name} 
              fill
              sizes="100vw"
              className="object-cover opacity-15 pointer-events-none" 
            />
            <div className="absolute inset-0 bg-[#09090b]/40 pointer-events-none"></div>

            <div className="relative z-10 p-6 py-12">
              <h3 className="font-bold text-sm mb-6 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                Riwayat Pendidikan
              </h3>
              
              <div className="border-l-2 border-white/20 pl-5 space-y-6">
                {educations.map((edu) => (
                  <div key={edu.id} className="relative">
                    <div className="absolute -left-[27px] top-1 w-2.5 h-2.5 bg-white rounded-full border-[3px] border-[#09090b]"></div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-zinc-400">{edu.start_year} — {edu.end_year || 'Now'}</span>
                      <div>
                        <div className="font-bold text-sm text-white">{edu.institution}</div>
                        {edu.location && <div className="text-xs text-zinc-300">{edu.location}</div>}
                      </div>
                    </div>
                  </div>
                ))}
                {educations.length === 0 && (
                  <p className="text-xs text-zinc-400 italic">Belum ada data pendidikan</p>
                )}
              </div>

              {/* Buttons (Moved from Block 1) */}
              <div className="flex flex-row gap-3 mt-10">
                {resumeUrl ? (
                  <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="flex-1 border border-white/20 backdrop-blur-sm text-white px-3 py-4 rounded-xl text-[10px] font-bold tracking-widest uppercase hover:bg-white/10 transition-colors flex items-center justify-center text-center">
                    UNDUH CV
                  </a>
                ) : (
                  <button disabled className="flex-1 border border-white/15 text-zinc-500 px-3 py-4 rounded-xl text-[10px] font-bold tracking-widest uppercase cursor-not-allowed flex items-center justify-center text-center">
                    UNDUH CV
                  </button>
                )}
                <a href={`mailto:${profile?.email || ''}`} className="flex-1 bg-white text-black px-3 py-4 rounded-xl text-[10px] font-bold tracking-widest uppercase hover:bg-zinc-200 transition-colors flex items-center justify-center text-center">
                  HUBUNGI SAYA
                </a>
              </div>
            </div>
          </div>
        </div>

      </motion.div>
    </section>
  )
}
