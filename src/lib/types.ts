// =============================================================
// Database Types — mirrors the Supabase schema
// =============================================================

export interface Profile {
  id: string
  full_name: string
  role_title: string
  bio: string
  email: string
  avatar_url: string | null
  avatar_url_2: string | null
  github_url: string | null
  linkedin_url: string | null
  location: string | null
  birth_date: string | null
  hero_title: string | null
  hero_subtitle: string | null
  hero_tagline: string | null
  github_username: string | null
  whatsapp_url: string | null
  instagram_url: string | null
  updated_at: string
}

export interface Resume {
  id: string
  profile_id: string
  file_name: string
  file_url: string
  is_active: boolean
  uploaded_at: string
}

export interface Project {
  id: string
  profile_id: string
  title: string
  slug: string
  description: string
  image_url: string | null
  live_url: string | null
  repo_url: string | null
  is_featured: boolean
  sort_order: number
  created_at: string
}

export interface Technology {
  id: string
  name: string
  icon_url: string | null
  category: string
}

export interface ProjectTech {
  project_id: string
  tech_id: string
}

export interface ProjectCategory {
  id: string
  profile_id: string
  name: string
  sort_order: number
}

export interface ProjectCategoryLink {
  project_id: string
  category_id: string
}

export interface Experience {
  id: string
  profile_id: string
  company_name: string
  position: string
  start_date: string
  end_date: string | null
  description: string
  sort_order: number
}

export interface Service {
  id: string
  profile_id: string
  title: string
  description: string
  icon_name: string | null
  sort_order: number
}

export interface Certificate {
  id: string
  profile_id: string
  title: string
  issuer: string
  issue_date: string | null
  image_url: string | null
  credential_url: string | null
  sort_order: number
}

export interface FAQ {
  id: string
  profile_id: string
  question: string
  answer: string
  sort_order: number
}

export interface Skill {
  id: string
  profile_id: string
  name: string
  level: number
  sort_order: number
}

export interface Education {
  id: string
  profile_id: string
  institution: string
  location: string | null
  start_year: number
  end_year: number | null
  sort_order: number
}

export interface SiteSetting {
  id: string
  profile_id: string
  key: string
  value: string
}

// =============================================================
// Extended types with relations (for joined queries)
// =============================================================

export interface ProjectWithDetails extends Project {
  technologies: Technology[]
  categories: ProjectCategory[]
}

export interface ProfileWithResume extends Profile {
  active_resume: Resume | null
}

// =============================================================
// Form input types (for CRUD operations)
// =============================================================

export interface ProfileFormData {
  full_name: string
  role_title: string
  bio: string
  email: string
  avatar_url: string
  avatar_url_2: string
  github_url: string
  linkedin_url: string
  location: string
  birth_date: string
  hero_title: string
  hero_subtitle: string
  hero_tagline: string
  github_username: string
  whatsapp_url: string
  instagram_url: string
}

export interface ProjectFormData {
  title: string
  slug: string
  description: string
  image_url: string
  live_url: string
  repo_url: string
  is_featured: boolean
  sort_order: number
  tech_ids: string[]
  category_ids: string[]
}

export interface TechnologyFormData {
  name: string
  icon_url: string
  category: string
}

export interface ProjectCategoryFormData {
  name: string
  sort_order: number
}

export interface ExperienceFormData {
  company_name: string
  position: string
  start_date: string
  end_date: string
  description: string
  sort_order: number
}

export interface EducationFormData {
  institution: string
  location: string
  start_year: number
  end_year: number | null
  sort_order: number
}

export interface ServiceFormData {
  title: string
  description: string
  icon_name: string
  sort_order: number
}

export interface CertificateFormData {
  title: string
  issuer: string
  issue_date: string
  image_url: string
  credential_url: string
  sort_order: number
}

export interface FaqFormData {
  question: string
  answer: string
  sort_order: number
}

export interface SkillFormData {
  name: string
  level: number
  sort_order: number
}
