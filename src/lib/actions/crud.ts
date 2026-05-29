'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUser } from './auth'
import type { ProfileFormData, ProjectFormData, TechnologyFormData, ExperienceFormData, EducationFormData, ServiceFormData, CertificateFormData, FaqFormData, SkillFormData } from '@/lib/types'

// =============================================================
// PROFILE ACTIONS
// =============================================================

export async function getProfile() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message)
  }
  return data
}

export async function updateProfile(formData: ProfileFormData) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/admin/profile')
}

// =============================================================
// PROJECT ACTIONS
// =============================================================

export async function getProjects() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*, project_techs(tech_id, technologies(*)), project_category_links(category_id, project_categories(*))')
    .order('sort_order', { ascending: true })

  if (error) {
    console.warn('projects query failed (tables may not exist yet):', error.message)
    // Fallback query without categories if categories table fails
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('projects')
      .select('*, project_techs(tech_id, technologies(*))')
      .order('sort_order', { ascending: true })
    
    if (fallbackError) return []

    return (fallbackData ?? []).map((project) => ({
      ...project,
      technologies: (project.project_techs ?? []).map(
        (pt: { technologies: unknown }) => pt.technologies
      ),
      categories: [],
    }))
  }

  return (data ?? []).map((project) => ({
    ...project,
    technologies: (project.project_techs ?? []).map(
      (pt: { technologies: unknown }) => pt.technologies
    ),
    categories: (project.project_category_links ?? []).map(
      (pcl: { project_categories: unknown }) => pcl.project_categories
    ),
  }))
}

export async function getProject(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*, project_techs(tech_id), project_category_links(category_id)')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return {
    ...data,
    tech_ids: (data.project_techs ?? []).map((pt: { tech_id: string }) => pt.tech_id),
    category_ids: (data.project_category_links ?? []).map((pcl: { category_id: string }) => pcl.category_id),
  }
}

export async function createProject(formData: ProjectFormData) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { tech_ids, category_ids, ...projectData } = formData

  const { data, error } = await supabase
    .from('projects')
    .insert({ ...projectData, profile_id: user.id })
    .select()
    .single()

  if (error) throw new Error(error.message)

  if (tech_ids && tech_ids.length > 0) {
    const techLinks = tech_ids.map((tech_id) => ({
      project_id: data.id,
      tech_id,
    }))
    const { error: techError } = await supabase.from('project_techs').insert(techLinks)
    if (techError) throw new Error(`Gagal menautkan teknologi: ${techError.message}`)
  }

  if (category_ids && category_ids.length > 0) {
    const categoryLinks = category_ids.map((category_id) => ({
      project_id: data.id,
      category_id,
    }))
    const { error: catError } = await supabase.from('project_category_links').insert(categoryLinks)
    if (catError) throw new Error(`Gagal menautkan kategori: ${catError.message}`)
  }

  revalidatePath('/')
  revalidatePath('/admin/projects')
}

export async function updateProject(id: string, formData: ProjectFormData) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { tech_ids, category_ids, ...projectData } = formData

  const { error } = await supabase
    .from('projects')
    .update(projectData)
    .eq('id', id)

  if (error) throw new Error(error.message)

  // Replace tech links
  const { error: techDelError } = await supabase.from('project_techs').delete().eq('project_id', id)
  if (techDelError) throw new Error(`Gagal menghapus teknologi lama: ${techDelError.message}`)
  if (tech_ids && tech_ids.length > 0) {
    const techLinks = tech_ids.map((tech_id) => ({
      project_id: id,
      tech_id,
    }))
    const { error: techInsError } = await supabase.from('project_techs').insert(techLinks)
    if (techInsError) throw new Error(`Gagal menautkan teknologi: ${techInsError.message}`)
  }

  // Replace category links
  const { error: catDelError } = await supabase.from('project_category_links').delete().eq('project_id', id)
  if (catDelError) throw new Error(`Gagal menghapus kategori lama: ${catDelError.message}`)
  if (category_ids && category_ids.length > 0) {
    const categoryLinks = category_ids.map((category_id) => ({
      project_id: id,
      category_id,
    }))
    const { error: catInsError } = await supabase.from('project_category_links').insert(categoryLinks)
    if (catInsError) throw new Error(`Gagal menautkan kategori: ${catInsError.message}`)
  }

  revalidatePath('/')
  revalidatePath('/admin/projects')
}

export async function deleteProject(id: string) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/projects')
}

// =============================================================
// PROJECT CATEGORY ACTIONS
// =============================================================
import type { ProjectCategoryFormData } from '@/lib/types'

export async function getProjectCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('project_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.warn('project_categories query failed (table may not exist yet):', error.message)
    return []
  }
  return data ?? []
}

export async function createProjectCategory(formData: ProjectCategoryFormData) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase
    .from('project_categories')
    .insert({ ...formData, profile_id: user.id })

  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/admin/project-categories')
}

export async function updateProjectCategory(id: string, formData: ProjectCategoryFormData) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase.from('project_categories').update(formData).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/project-categories')
}

export async function deleteProjectCategory(id: string) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase.from('project_categories').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/project-categories')
}

// =============================================================
// TECHNOLOGY ACTIONS
// =============================================================

export async function getTechnologies() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('technologies')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createTechnology(formData: TechnologyFormData) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase.from('technologies').insert(formData)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/technologies')
}

export async function updateTechnology(id: string, formData: TechnologyFormData) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase.from('technologies').update(formData).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/technologies')
}

export async function deleteTechnology(id: string) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase.from('technologies').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/technologies')
}

// =============================================================
// EXPERIENCE ACTIONS
// =============================================================

export async function getExperiences() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .order('start_date', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createExperience(formData: ExperienceFormData) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase
    .from('experiences')
    .insert({ ...formData, profile_id: user.id })

  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/admin/experiences')
}

export async function updateExperience(id: string, formData: ExperienceFormData) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase.from('experiences').update(formData).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/experiences')
}

export async function deleteExperience(id: string) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase.from('experiences').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/experiences')
}

// =============================================================
// EDUCATION ACTIONS
// =============================================================

export async function getEducations() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('educations')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.warn('educations query failed (table may not exist yet):', error.message)
    return []
  }
  return data ?? []
}

export async function createEducation(formData: EducationFormData) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase
    .from('educations')
    .insert({ ...formData, profile_id: user.id })

  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/admin/educations')
}

export async function updateEducation(id: string, formData: EducationFormData) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase.from('educations').update(formData).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/educations')
}

export async function deleteEducation(id: string) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase.from('educations').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/educations')
}

// =============================================================
// SERVICE ACTIONS
// =============================================================

export async function getServices() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.warn('services query failed (table may not exist yet):', error.message)
    return []
  }
  return data ?? []
}

export async function createService(formData: ServiceFormData) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase
    .from('services')
    .insert({ ...formData, profile_id: user.id })

  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/admin/services')
}

export async function updateService(id: string, formData: ServiceFormData) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase.from('services').update(formData).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/services')
}

export async function deleteService(id: string) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/services')
}

// =============================================================
// CERTIFICATE ACTIONS
// =============================================================

export async function getCertificates() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.warn('certificates query failed (table may not exist yet):', error.message)
    return []
  }
  return data ?? []
}

export async function createCertificate(formData: CertificateFormData) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase
    .from('certificates')
    .insert({ ...formData, profile_id: user.id })

  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/admin/certificates')
}

export async function updateCertificate(id: string, formData: CertificateFormData) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase.from('certificates').update(formData).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/certificates')
}

export async function deleteCertificate(id: string) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase.from('certificates').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/certificates')
}

// =============================================================
// SKILL ACTIONS
// =============================================================

export async function getSkills() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.warn('skills query failed (table may not exist yet):', error.message)
    return []
  }
  return data ?? []
}

export async function createSkill(formData: SkillFormData) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase
    .from('skills')
    .insert({ ...formData, profile_id: user.id })

  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/admin/skills')
}

export async function updateSkill(id: string, formData: SkillFormData) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase.from('skills').update(formData).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/skills')
}

export async function deleteSkill(id: string) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase.from('skills').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/skills')
}

// =============================================================
// FAQ ACTIONS
// =============================================================

export async function getFaqs() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.warn('faqs query failed (table may not exist yet):', error.message)
    return []
  }
  return data ?? []
}

export async function createFaq(formData: FaqFormData) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase
    .from('faqs')
    .insert({ ...formData, profile_id: user.id })

  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/admin/faqs')
}

export async function updateFaq(id: string, formData: FaqFormData) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase.from('faqs').update(formData).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/faqs')
}

export async function deleteFaq(id: string) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase.from('faqs').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/faqs')
}

// =============================================================
// RESUME ACTIONS
// =============================================================

export async function getResumes() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .order('uploaded_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getActiveResume() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('is_active', true)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message)
  }
  return data
}

export async function createResume(fileName: string, fileUrl: string) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase.from('resumes').insert({
    profile_id: user.id,
    file_name: fileName,
    file_url: fileUrl,
    is_active: false,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/resumes')
}

export async function setActiveResume(id: string) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()

  // Deactivate all resumes first
  const { error: deactivateError } = await supabase
    .from('resumes')
    .update({ is_active: false })
    .eq('profile_id', user.id)

  if (deactivateError) throw new Error(`Gagal menonaktifkan resume: ${deactivateError.message}`)

  // Activate the selected one
  const { error } = await supabase
    .from('resumes')
    .update({ is_active: true })
    .eq('id', id)
    .eq('profile_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/admin/resumes')
}

export async function deleteResume(id: string) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase.from('resumes').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/resumes')
}

// =============================================================
// AVATAR UPLOAD ACTION
// =============================================================

export async function updateAvatarUrl(avatarUrl: string) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/admin/profile')
}

// =============================================================
// PROJECT IMAGE UPLOAD ACTION
// =============================================================

export async function updateProjectImage(projectId: string, imageUrl: string) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase
    .from('projects')
    .update({ image_url: imageUrl })
    .eq('id', projectId)
    .eq('profile_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/admin/projects')
}

// =============================================================
// SITE SETTINGS ACTIONS
// =============================================================

export async function getSiteSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')

  // If table doesn't exist yet (schema not migrated), return empty defaults
  // so all sections are visible by default
  if (error) {
    console.warn('site_settings query failed (table may not exist yet):', error.message)
    return {} as Record<string, string>
  }
  
  // Convert array to a key-value map for easy access
  const settings: Record<string, string> = {}
  ;(data ?? []).forEach((s: { key: string; value: string }) => {
    settings[s.key] = s.value
  })
  return settings
}

export async function updateSiteSetting(key: string, value: string) {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = await createClient()
  const { error } = await supabase
    .from('site_settings')
    .upsert(
      { profile_id: user.id, key, value },
      { onConflict: 'profile_id,key' }
    )

  if (error) throw new Error(error.message)
  revalidatePath('/')
  revalidatePath('/admin/settings')
}
