import { getSkills } from '@/lib/actions/crud'
import { SkillsManager } from '@/components/admin/skills-manager'

export const dynamic = 'force-dynamic'

export default async function AdminSkillsPage() {
  const skills = await getSkills()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Keahlian</h1>
        <p className="text-muted-foreground"> Kelola daftar keahlian (soft skills/non-tech) Anda.</p>
      </div>
      <SkillsManager skills={skills} />
    </div>
  )
}
