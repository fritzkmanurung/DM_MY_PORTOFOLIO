'use client'

import { useState } from 'react'
import Link from 'next/link'
import { deleteProject } from '@/lib/actions/crud'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/shared'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, ExternalLink, Star } from 'lucide-react'
import type { ProjectWithDetails } from '@/lib/types'

interface ProjectsTableProps {
  projects: ProjectWithDetails[]
}


export function ProjectsTable({ projects }: ProjectsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!deleteId) return
    setLoading(true)
    try {
      await deleteProject(deleteId)
    } catch {
      // Error handling
    } finally {
      setLoading(false)
      setDeleteId(null)
    }
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead className="hidden md:table-cell">Teknologi</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="text-muted-foreground font-mono text-xs">
                  {project.sort_order}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{project.title}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {project.slug}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {project.technologies?.slice(0, 3).map((tech) => (
                      <Badge key={tech.id} variant="secondary" className="text-xs">
                        {tech.name}
                      </Badge>
                    ))}
                    {(project.technologies?.length ?? 0) > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.technologies.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {project.is_featured && (
                    <Badge className="gap-1">
                      <Star className="h-3 w-3" />
                      Featured
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="gap-2"
                        onClick={() => window.location.href = `/admin/projects/${project.id}/edit`}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {project.live_url && (
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => window.open(project.live_url!, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                          Lihat Live
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="gap-2"
                        variant="destructive"
                        onClick={() => setDeleteId(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus Proyek?"
        description="Proyek ini akan dihapus secara permanen beserta semua data teknologi terkait."
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  )
}
