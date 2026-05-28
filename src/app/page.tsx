import { getProfile, getProjects, getTechnologies, getExperiences, getActiveResume, getServices, getCertificates, getFaqs, getEducations, getSiteSettings, getSkills, getProjectCategories } from '@/lib/actions/crud'
import { HeroSection } from '@/components/portfolio/hero-section'
import { BentoProfile } from '@/components/portfolio/bento-profile'
import { ProjectsSection } from '@/components/portfolio/projects-section'
import { CertificatesSection } from '@/components/portfolio/certificates-section'
import { ExperienceSection } from '@/components/portfolio/experience-section'
import { ServicesSection } from '@/components/portfolio/services-section'
import { FaqSection } from '@/components/portfolio/faq-section'
import { FooterSection } from '@/components/portfolio/footer-section'
import { MobileNav } from '@/components/portfolio/mobile-nav'

export default async function HomePage() {
  const [
    profile, 
    projects, 
    technologies,
    experiences,
    activeResume,
    certificates,
    services,
    faqs,
    educations,
    siteSettings,
    skills,
    projectCategories,
  ] = await Promise.all([
    getProfile(),
    getProjects(),
    getTechnologies(),
    getExperiences(),
    getActiveResume(),
    getCertificates(),
    getServices(),
    getFaqs(),
    getEducations(),
    getSiteSettings(),
    getSkills(),
    getProjectCategories(),
  ])

  // Helper to check if a section is visible
  const isVisible = (key: string) => (siteSettings[key] ?? 'true') === 'true'

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 selection:bg-primary/30 relative">
      {/* Global Ambient Retro Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_40%,transparent_100%)]"></div>
      </div>

      {isVisible('section_hero') && <HeroSection profile={profile} siteSettings={siteSettings} />}
      
      <main className="container mx-auto px-4 md:px-8 py-8 lg:py-12 flex flex-col gap-16 lg:gap-24 relative z-10">
        {/* The Bento Identity */}
        {isVisible('section_profile') && (
          <BentoProfile profile={profile} resumeUrl={activeResume?.file_url ?? null} educations={educations} technologies={technologies} skills={skills} siteSettings={siteSettings} />
        )}
        
        {/* Stats & Project Filters / Galeri Proyek */}
        {isVisible('section_projects') && projects && projects.length > 0 && (
          <ProjectsSection projects={projects} categories={projectCategories} githubUsername={profile?.github_username ?? null} />
        )}
        

        {/* Experience Section */}
        {isVisible('section_experience') && experiences && experiences.length > 0 && (
          <ExperienceSection experiences={experiences} />
        )}

        {/* Certificates & Achievements */}
        {isVisible('section_certificates') && certificates && certificates.length > 0 && (
          <CertificatesSection certificates={certificates} />
        )}

        {/* Services Section */}
        {isVisible('section_services') && services && services.length > 0 && (
          <ServicesSection services={services} />
        )}

        {/* FAQ Section */}
        {isVisible('section_faq') && faqs && faqs.length > 0 && (
          <FaqSection faqs={faqs} />
        )}
      </main>

      {isVisible('section_footer') && (
        <div className="container mx-auto px-4 md:px-8 pb-12 relative z-10">
          <FooterSection profile={profile} siteSettings={siteSettings} />
        </div>
      )}

      {/* Persistent Mobile Floating Navigation */}
      <MobileNav siteSettings={siteSettings} />
    </div>
  )
}
