'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Code, Calendar, Activity, Clock } from 'lucide-react'
import { GithubIcon } from '@/components/icons'
import type { ProjectWithDetails, ProjectCategory } from '@/lib/types'

interface ProjectsSectionProps {
  projects: ProjectWithDetails[]
  categories: ProjectCategory[]
  githubUsername: string | null
}

export function ProjectsSection({ projects, categories, githubUsername }: ProjectsSectionProps) {
  const firstCardRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined)
  const [githubStats, setGithubStats] = useState({ 
    repos: 0, 
    followers: 0, 
    year: '2021', 
    contributions: 0,
    topLanguages: [] as string[],
    lastActive: '...'
  })

  const [activeFilter, setActiveFilter] = useState('SEMUA')
  const [selectedProject, setSelectedProject] = useState<ProjectWithDetails | null>(null)

  // Measure height of one card, then set container to fit exactly 2 rows + gap
  useEffect(() => {
    if (!firstCardRef.current) return

    const measure = () => {
      const card = firstCardRef.current
      if (!card) return
      const cardHeight = card.getBoundingClientRect().height
      // 2 rows of cards + 1 gap (24px from gap-6)
      setContainerHeight(cardHeight * 2 + 24)
    }

    // Measure after images load or filter changes
    const timer = setTimeout(measure, 500)
    window.addEventListener('resize', measure)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', measure)
    }
  }, [activeFilter])

  useEffect(() => {
    if (!githubUsername) return
    const username = githubUsername
    const CACHE_KEY = `github_stats_${username}`
    const CACHE_TTL = 60 * 60 * 1000 // 1 hour

    // Check sessionStorage cache first
    try {
      const cached = sessionStorage.getItem(CACHE_KEY)
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < CACHE_TTL) {
          setTimeout(() => setGithubStats(data), 0)
          return
        }
      }
    } catch { /* ignore parse errors */ }

    const fetchedStats = {
      repos: 0, followers: 0, year: '2021',
      contributions: 0, topLanguages: [] as string[], lastActive: '...'
    }

    // Fetch all GitHub data in parallel
    Promise.allSettled([
      // Basic user data
      fetch(`https://api.github.com/users/${username}`)
        .then(res => res.json())
        .then(data => {
          if (data?.created_at) {
            fetchedStats.repos = data.public_repos || 0
            fetchedStats.followers = data.followers || 0
            fetchedStats.year = new Date(data.created_at).getFullYear().toString()
          }
        }),
      // Repos for Top Languages and Last Activity
      fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`)
        .then(res => res.json())
        .then(repos => {
          if (Array.isArray(repos) && repos.length > 0) {
            const langs: Record<string, number> = {}
            repos.forEach(repo => {
              if (repo.language) langs[repo.language] = (langs[repo.language] || 0) + 1
            })
            fetchedStats.topLanguages = Object.entries(langs)
              .sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0])

            const latestPush = new Date(Math.max(...repos.map(r => new Date(r.pushed_at || r.updated_at).getTime())))
            const diffDays = Math.floor((Date.now() - latestPush.getTime()) / (1000 * 60 * 60 * 24))
            fetchedStats.lastActive = diffDays === 0 ? 'Hari ini' : `${diffDays} hari lalu`
          }
        }),
      // Contributions
      fetch(`https://github-contributions-api.deno.dev/${username}.json`)
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.totalContributions === 'number') {
            fetchedStats.contributions = data.totalContributions
          } else if (data?.total) {
            fetchedStats.contributions = (data.total.lastYear || 0) + (data.total.thisYear || 0)
          }
        }),
    ]).then(() => {
      setGithubStats(fetchedStats)
      // Cache to sessionStorage
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: fetchedStats, timestamp: Date.now() }))
      } catch { /* quota exceeded — ignore */ }
    })
  }, [githubUsername])

  const filters = ['SEMUA', ...categories.map(c => c.name)]

  const stats = [
    { label: 'TOTAL REPOSITORI', value: githubStats.repos, icon: Code },
    { label: 'TOTAL KONTRIBUSI', value: githubStats.contributions, icon: Activity },
    { label: 'BAHASA UTAMA', value: githubStats.topLanguages.join(', '), icon: Code, isSmall: githubStats.topLanguages.length > 2 },
    { label: 'AKTIVITAS TERAKHIR', value: githubStats.lastActive, icon: Clock },
    { label: 'BERGABUNG SEJAK', value: githubStats.year, icon: Calendar },
  ]

  const filteredProjects = projects.filter((project) => {
    if (activeFilter === 'SEMUA') return true
    
    // Match against project categories
    return project.categories?.some(cat => cat.name === activeFilter)
  })

  return (
    <section className="w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col lg:flex-row bg-[#121214]/50 backdrop-blur-lg" id="works">

      {/* LEFT SIDEBAR (DARK) */}
      <div className="lg:w-[30%] bg-[#09090b]/80 text-white p-6 md:p-8 relative hidden lg:flex flex-col border-r border-white/10 backdrop-blur-md">

        {/* GitHub Branding */}
        <div className="mb-6 flex items-center gap-2 bg-white/5 p-2.5 rounded-xl border border-white/5">
          <GithubIcon className="w-4 h-4 text-zinc-400" />
          <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase">Statistik GitHub</span>
        </div>

        {/* Stats List */}
        <div className="flex flex-col gap-3 flex-1">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-4 flex items-center gap-4">
              <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                <stat.icon className="w-4 h-4 text-zinc-400" />
              </div>
              <div>
                <div className={`font-bold leading-tight mb-1 ${stat.isSmall ? 'text-sm' : 'text-xl'}`}>{stat.value}</div>
                <div className="text-[7px] uppercase tracking-widest text-zinc-500 font-bold">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE (DARK) */}
      <div className="lg:w-[70%] bg-[#0f0f11]/40 p-8 md:p-10 relative backdrop-blur-sm">
        {/* Background Dots */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="mb-8">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-serif italic text-white mb-3">Proyek Saya</h2>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setActiveFilter(filter)
                }}
                className={`px-4 py-2 rounded-full text-[10px] font-bold tracking-wider transition-all border ${
                  activeFilter === filter
                    ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                    : 'bg-white/5 text-zinc-400 border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Project Grid */}
          <div 
            className={`flex-1 mb-8 ${containerHeight ? 'overflow-y-auto pr-2 custom-scrollbar' : ''}`}
            style={containerHeight ? { maxHeight: containerHeight } : undefined}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-fit">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, idx) => (
                  <motion.div
                    ref={idx === 0 ? firstCardRef : undefined}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    key={project.id}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedProject(project)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setSelectedProject(project)
                        }
                      }}
                      className="bg-[#1c1c1f]/80 backdrop-blur-md rounded-lg shadow-sm hover:shadow-xl hover:border-white/20 hover:bg-[#232326]/90 transition-all duration-300 border border-white/10 flex flex-col group overflow-hidden h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                    >
                      {/* Browser Mockup & Screenshot Area (Full-bleed) */}
                      <div className="relative aspect-[16/10] bg-[#121214] border-b border-white/10 overflow-hidden group/img flex flex-col">
                        {/* Browser Mockup Header */}
                        <div className="h-5 bg-[#1a1a1e] border-b border-white/5 flex items-center px-4 gap-1.5 flex-shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]/60" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#eab308]/60" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]/60" />
                          <span className="ml-2 flex-1 bg-white/[0.03] rounded h-3.5 flex items-center px-2 text-[7px] text-zinc-500 font-mono truncate">
                            {project.live_url ? project.live_url.replace(/^https?:\/\//, '') : `${project.title.toLowerCase().replace(/\s+/g, '-')}.com`}
                          </span>
                        </div>
                        
                        {/* Screenshot Area */}
                        <div className="relative flex-1 bg-[#121214] overflow-hidden">
                          {project.image_url ? (
                            <Image 
                              src={project.image_url} 
                              alt={project.title} 
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 50vw"
                              className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]" 
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-zinc-600 text-[10px] font-bold uppercase tracking-widest">No Preview</div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-4 flex flex-col flex-1">
                        {/* Tech Tags */}
                        <div className="flex gap-1.5 mb-2 flex-wrap h-5 items-center overflow-hidden">
                          {project.technologies && project.technologies.length > 0 ? (
                            project.technologies.slice(0, 3).map((tech, idx) => (
                              <span 
                                key={idx} 
                                className="bg-white/5 text-zinc-400 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border border-white/5 truncate max-w-[90px]"
                                title={tech.name}
                              >
                                {tech.name}
                              </span>
                            ))
                          ) : (
                            <span className="bg-white/5 text-zinc-500 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border border-white/5">
                              PROJECT
                            </span>
                          )}
                          {project.technologies && project.technologies.length > 3 && (
                            <span className="bg-white/5 text-zinc-500 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border border-white/5">
                              +{project.technologies.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-bold mb-1 leading-tight text-white group-hover:text-sky-400 transition-colors duration-300 line-clamp-1">
                          {project.title}
                        </h3>

                        {/* Description */}
                        <p className="text-zinc-400 text-[11px] leading-normal h-[34px] overflow-hidden">
                          {project.description && project.description.length > 100 ? (
                            <>
                              {project.description.slice(0, 90)}...{' '}
                              <span 
                                className="font-bold text-zinc-400 hover:text-sky-400 transition-colors duration-200 cursor-pointer inline-block"
                              >
                                Tampilkan
                              </span>
                            </>
                          ) : (
                            project.description
                          )}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative max-w-2xl w-full bg-[#1c1c1f] rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col z-10 max-h-[90vh]"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-3.5 right-3.5 z-50 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
                title="Tutup"
              >
                <span className="text-xs font-bold font-mono">✕</span>
              </button>

              {/* Browser Mockup Area */}
              <div className="relative aspect-[16/9] bg-[#121214] border-b border-white/10 overflow-hidden flex flex-col flex-shrink-0">
                {/* Browser Mockup Header */}
                <div className="h-5 bg-[#1a1a1e] border-b border-white/5 flex items-center px-4 gap-1.5 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]/60" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#eab308]/60" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]/60" />
                  <span className="ml-2 flex-1 bg-white/[0.03] rounded h-3.5 flex items-center px-2 text-[7px] text-zinc-500 font-mono truncate">
                    {selectedProject.live_url ? selectedProject.live_url.replace(/^https?:\/\//, '') : `${selectedProject.title.toLowerCase().replace(/\s+/g, '-')}.com`}
                  </span>
                </div>
                
                {/* Image Area */}
                <div className="relative flex-1 bg-[#121214]">
                  {selectedProject.image_url ? (
                    <Image 
                      src={selectedProject.image_url} 
                      alt={selectedProject.title} 
                      fill
                      sizes="(max-width: 768px) 100vw, 640px"
                      className="object-cover object-top" 
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-600 text-xs font-bold uppercase tracking-widest">No Preview</div>
                  )}
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 custom-scrollbar">
                {/* Tech Stack */}
                <div className="flex gap-1.5 flex-wrap">
                  {selectedProject.technologies?.map((tech, idx) => (
                    <span 
                      key={idx} 
                      className="bg-white/5 text-zinc-400 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md border border-white/5"
                    >
                      {tech.name}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white leading-tight">
                  {selectedProject.title}
                </h3>

                {/* Full Description */}
                <p className="text-zinc-300 text-xs md:text-sm leading-relaxed whitespace-pre-line">
                  {selectedProject.description}
                </p>
              </div>

              {/* Footer / Actions */}
              <div className="p-4 bg-[#121214] border-t border-white/10 flex flex-wrap gap-3 justify-end flex-shrink-0">
                {selectedProject.repo_url && (
                  <a 
                    href={selectedProject.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white font-bold text-xs rounded-full hover:bg-white/10 transition-colors"
                  >
                    <GithubIcon className="w-3.5 h-3.5" /> Repositori Code
                  </a>
                )}
                {selectedProject.live_url && (
                  <a 
                    href={selectedProject.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-black font-bold text-xs rounded-full hover:bg-zinc-200 transition-colors"
                  >
                    Kunjungi Website
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
