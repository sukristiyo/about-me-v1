'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Eye, Code2, X, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import type { PortfolioProject } from '@prisma/client'
import { useLocale, useTranslations } from 'next-intl'
import { ProjectGallery } from './ProjectGallery'

interface PortfolioClientProps {
  projects: PortfolioProject[]
}

const CATEGORIES = [
  { id: 'All', labelEn: 'All Projects', labelId: 'Semua Proyek' },
  { id: 'web-design', labelEn: 'Web Design', labelId: 'Desain Web' },
  { id: 'applications', labelEn: 'Applications', labelId: 'Aplikasi' },
  { id: 'web-development', labelEn: 'Web Development', labelId: 'Pengembangan Web' },
]

export default function PortfolioClient({ projects }: PortfolioClientProps) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null)
  const locale = useLocale()
  const t = useTranslations('Portfolio')
  const tCommon = useTranslations('Common')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const projectId = params.get('project')
    if (projectId) {
      const project = projects.find(p => p.id === projectId)
      if (project) {
        setSelectedProject(project)
      }
    }
  }, [projects])

  const handleOpenProject = (project: PortfolioProject) => {
    setSelectedProject(project)
    window.history.pushState({}, '', `?project=${project.id}`)
  }

  const handleCloseProject = () => {
    setSelectedProject(null)
    window.history.pushState({}, '', window.location.pathname)
  }

  const handleShare = async () => {
    if (!selectedProject) return;
    const url = `${window.location.origin}${window.location.pathname}?project=${selectedProject.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedProject.title,
          text: `Check out my project: ${selectedProject.title}`,
          url: url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success(locale === 'id' ? 'Link disalin ke clipboard!' : 'Link copied to clipboard!');
    }
  }

  const filteredProjects = activeFilter === 'All'
    ? projects
    : projects.filter((p) => p.category === activeFilter)

  return (
    <div className="space-y-8">
      
      {/* ── Header & Filter ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h2 className="font-outfit text-3xl font-bold text-[var(--foreground)]">
          <span className="text-gradient-gold">{t('title')}</span>
        </h2>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                activeFilter === cat.id
                  ? 'bg-[var(--gold)] text-white'
                  : 'bg-black/5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/10'
              }`}
            >
              {locale === 'id' ? cat.labelId : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* ── Projects Grid ── */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="sync">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group relative rounded-2xl overflow-hidden glass card-hover cursor-pointer aspect-video border border-transparent hover:border-[var(--gold)]/30 hover:shadow-[0_0_20px_-5px_rgba(var(--gold-rgb),0.3)] transition-all duration-500"
              onClick={() => handleOpenProject(project)}
            >
              {/* Thumbnail */}
              {project.thumbnailUrl ? (
                <Image
                  src={project.thumbnailUrl}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={index < 2}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a27] to-[#0f0f1a] flex items-center justify-center">
                  <span className="text-[var(--muted-foreground)] font-outfit text-xl font-medium opacity-30">
                    {project.title}
                  </span>
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm z-20">
                <div className="w-10 h-10 rounded-full bg-[var(--gold)] text-white flex items-center justify-center mb-3 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="font-outfit text-base font-bold text-white mb-1.5 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                  {project.title}
                </h3>
                <p className="text-[var(--gold)] text-xs uppercase tracking-wider transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                  {CATEGORIES.find(c => c.id === project.category)?.[locale === 'id' ? 'labelId' : 'labelEn'] || project.category}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-[var(--muted-foreground)]">
            {locale === 'id' ? 'Tidak ada proyek dalam kategori ini.' : 'No projects found in this category.'}
          </p>
        </div>
      )}

      {/* ── Project Detail Modal ── */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseProject}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative w-full max-w-3xl glass-strong rounded-2xl overflow-hidden shadow-2xl border border-[var(--gold)]/20 flex flex-col max-h-[90vh]"
            >
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-[var(--foreground)] hover:bg-[var(--gold)] hover:text-white transition-colors shadow-lg"
                  title="Share Project"
                  aria-label="Share Project"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCloseProject}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-[var(--foreground)] hover:bg-[var(--gold)] hover:text-white transition-colors shadow-lg"
                  title="Close"
                  aria-label="Close Project Modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto custom-scrollbar">
                {/* Modal Gallery */}
                <ProjectGallery 
                  images={selectedProject.images || []} 
                  thumbnailUrl={selectedProject.thumbnailUrl} 
                  title={selectedProject.title} 
                />

                {/* Modal Content */}
                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 className="font-outfit text-2xl font-bold text-[var(--foreground)] mb-2">
                      {selectedProject.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-[var(--gold)] font-medium">
                        {CATEGORIES.find(c => c.id === selectedProject.category)?.[locale === 'id' ? 'labelId' : 'labelEn'] || selectedProject.category}
                      </span>
                      <span className="text-[var(--muted-foreground)]">&bull;</span>
                      <span className="text-[var(--muted-foreground)]">{selectedProject.year}</span>
                    </div>
                  </div>

                  <div 
                    className="prose prose-invert prose-sm sm:prose-base max-w-none text-[var(--muted-foreground)]"
                    dangerouslySetInnerHTML={{ __html: locale === 'id' ? selectedProject.descriptionId || selectedProject.descriptionEn : selectedProject.descriptionEn }}
                  />

                  {/* Tech Stack */}
                  {selectedProject.techStack.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider mb-3">
                        Technologies
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.techStack.map(tech => (
                          <span key={tech} className="px-3 py-1 rounded-full text-xs bg-black/5 border border-[var(--border)] text-[var(--foreground)]">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  {(selectedProject.liveUrl || selectedProject.repoUrl) && (
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-[var(--border)]">
                      {selectedProject.liveUrl && (
                        <a
                          href={selectedProject.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--gold)] text-white font-semibold text-sm hover:bg-[var(--gold-hover)] transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Live Demo
                        </a>
                      )}
                      {selectedProject.repoUrl && (
                        <a
                          href={selectedProject.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-5 py-2.5 rounded-lg glass text-[var(--foreground)] font-semibold text-sm hover:bg-white/10 transition-colors"
                        >
                          <Code2 className="w-4 h-4" />
                          Source Code
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
