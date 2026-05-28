'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Code, Calendar, Activity, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { GithubIcon } from '@/components/icons'
import type { ProjectWithDetails, ProjectCategory } from '@/lib/types'

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    }
  }
} as const

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 90,
      damping: 15
    }
  }
} as const

interface ProjectsSectionProps {
  projects: ProjectWithDetails[]
  categories: ProjectCategory[]
  githubUsername: string | null
}

export function ProjectsSection({ projects, categories, githubUsername }: ProjectsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  useEffect(() => {
    setIsMounted(true)
  }, [])
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

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 5)
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5)
    }
  }

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true })
      checkScroll()
      const timer = setTimeout(checkScroll, 300)
      window.addEventListener('resize', checkScroll)
      return () => {
        el.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
        clearTimeout(timer)
      }
    }
  }, [activeFilter, projects])

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return

    const children = Array.from(el.children) as HTMLElement[]
    if (children.length === 0) return

    const containerLeft = el.getBoundingClientRect().left
    const scrollLeft = el.scrollLeft
    const targetOffset = direction === 'left' ? -el.clientWidth * 0.75 : el.clientWidth * 0.75
    const targetScrollLeft = scrollLeft + targetOffset

    // Find the card closest to target position
    let bestScrollLeft = targetScrollLeft
    let minDiff = Infinity

    children.forEach((child) => {
      const childScrollLeft = scrollLeft + (child.getBoundingClientRect().left - containerLeft)
      const diff = Math.abs(childScrollLeft - targetScrollLeft)
      if (diff < minDiff) {
        minDiff = diff
        bestScrollLeft = childScrollLeft
      }
    })

    // Clamp the target scroll position
    const maxScroll = el.scrollWidth - el.clientWidth
    const finalScrollLeft = Math.max(0, Math.min(bestScrollLeft, maxScroll))

    // Smooth ease-out cubic scroll animation
    const start = el.scrollLeft
    const change = finalScrollLeft - start
    const startTime = performance.now()
    const duration = 500 // ms

    const originalSnap = el.style.scrollSnapType
    const originalBehavior = el.style.scrollBehavior
    el.style.scrollSnapType = 'none'
    el.style.scrollBehavior = 'auto'

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic curve
      const ease = 1 - Math.pow(1 - progress, 3)
      el.scrollLeft = start + change * ease

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        el.style.scrollSnapType = originalSnap
        el.style.scrollBehavior = originalBehavior
      }
    }

    requestAnimationFrame(animate)
  }

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
    <div className="w-full flex flex-col gap-8" id="works">
      {/* Section Header (Centered, Outside) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center space-y-4"
      >
        <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Karya Saya</p>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight font-serif italic text-white">Proyek Saya</h2>
      </motion.div>

      {/* Main Card Container */}
      <section className="w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 bg-[#121214]/50 backdrop-blur-lg p-8 md:p-10 relative">
        {/* Background Dots */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

        <div className="relative z-10 flex flex-col h-full">
          {/* GitHub Stats Row (Horizontal Layout) */}
          {githubUsername && (
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <GithubIcon className="w-4 h-4 text-zinc-400" />
                <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Statistik GitHub</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {stats.map((stat, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                      <stat.icon className="w-3.5 h-3.5 text-zinc-400" />
                    </div>
                    <div>
                      <div className={`font-bold leading-tight text-white ${stat.isSmall ? 'text-xs' : 'text-base'}`}>{stat.value}</div>
                      <div className="text-[7px] uppercase tracking-widest text-zinc-500 font-bold">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters & Navigation Arrows */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
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

            {/* Slider Navigation Buttons */}
            <div className="flex gap-2 self-end sm:self-auto z-10">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                disabled={isMounted ? !canScrollLeft : false}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-white/5 disabled:hover:text-zinc-400 disabled:cursor-not-allowed transition-all cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll('right')}
                disabled={isMounted ? !canScrollRight : false}
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-white/5 disabled:hover:text-zinc-400 disabled:cursor-not-allowed transition-all cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Project Slider Container */}
          <motion.div 
            key={activeFilter}
            ref={scrollRef}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-6 pb-6 no-scrollbar -mr-8 pr-8 md:-mr-10 md:pr-10"
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <motion.div
                  variants={cardVariants}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={project.id}
                  className="w-[290px] sm:w-[350px] flex-shrink-0 snap-start h-full"
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
                            sizes="(max-width: 640px) 100vw, 350px"
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
          </motion.div>
        </div>
      </section>

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
    </div>
  )
}
