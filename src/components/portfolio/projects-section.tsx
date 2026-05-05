'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Code, UserPlus, Calendar, Activity, Clock } from 'lucide-react'
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

  // Measure height of one card, then set container to fit exactly 2 rows + gap
  useEffect(() => {
    if (!firstCardRef.current) return

    const measure = () => {
      const card = firstCardRef.current
      if (!card) return
      const cardHeight = card.getBoundingClientRect().height
      // 2 rows of cards + 1 gap (20px from gap-5)
      setContainerHeight(cardHeight * 2 + 20)
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
          setGithubStats(data)
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
      <div className="lg:w-[25%] bg-[#09090b]/80 text-white p-6 md:p-8 relative hidden lg:flex flex-col border-r border-white/10 backdrop-blur-md">

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
      <div className="lg:w-[75%] bg-[#0f0f11]/40 p-8 md:p-10 relative backdrop-blur-sm">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 h-fit">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, idx) => (
                  <motion.div
                    ref={idx === 0 ? firstCardRef : undefined}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    key={project.id}
                  className="bg-[#1c1c1f]/80 backdrop-blur-md rounded-xl p-5 shadow-sm hover:shadow-2xl hover:bg-[#232326]/90 transition-all border border-white/10 flex flex-col group"
                >
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4 bg-zinc-900 border border-white/5">
                    {project.image_url ? (
                      <img 
                        src={project.image_url} 
                        alt={project.title} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-600 text-[10px] font-bold uppercase tracking-widest">No Preview</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex gap-1.5 mb-3 flex-wrap h-6 items-center overflow-hidden">
                    {project.technologies && project.technologies.length > 0 ? (
                      project.technologies.slice(0, 3).map((tech, idx) => (
                        <span 
                          key={idx} 
                          className="bg-white/5 text-zinc-400 text-[7px] uppercase font-black tracking-tighter px-2 py-1 rounded-lg border border-white/5 truncate max-w-[80px]"
                          title={tech.name}
                        >
                          {tech.name}
                        </span>
                      ))
                    ) : (
                      <span className="bg-white/5 text-zinc-500 text-[7px] uppercase font-black tracking-tighter px-2 py-1 rounded-lg border border-white/5">
                        PROJECT
                      </span>
                    )}
                    {project.technologies && project.technologies.length > 3 && (
                      <span className="bg-white/5 text-zinc-500 text-[7px] uppercase font-black tracking-tighter px-2 py-1 rounded-lg border border-white/5">
                        +{project.technologies.length - 3}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold mb-1.5 leading-tight text-white group-hover:text-white transition-colors line-clamp-2 h-10 flex items-start">{project.title}</h3>
                  <p className="text-zinc-500 text-[11px] line-clamp-2 mb-4 leading-relaxed h-9 overflow-hidden">{project.description}</p>
                  <div className="mt-auto">
                    <a 
                      href={project.live_url || '#'} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
                    >
                      Lihat Proyek <ChevronRight className="w-3 h-3" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
