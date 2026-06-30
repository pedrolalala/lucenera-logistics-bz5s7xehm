import { useState, useEffect } from 'react'
import { useSeparacaoArquivos, SeparacaoArquivo } from '@/hooks/useSeparacaoArquivos'
import { FileText, Image, Download, Loader2, Paperclip } from 'lucide-react'

interface SeparacaoFilesProps {
  separacaoId: string
}

export function SeparacaoFiles({ separacaoId }: SeparacaoFilesProps) {
  const { fetchArquivos } = useSeparacaoArquivos()
  const [files, setFiles] = useState<SeparacaoArquivo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchArquivos(separacaoId).then((data) => {
      if (active) {
        setFiles(data)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [separacaoId])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando arquivos...
      </div>
    )
  }

  if (files.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum arquivo anexado.</p>
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <a
          key={file.id}
          href={file.url_arquivo}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-2 rounded-md border border-border hover:bg-muted transition-colors group"
        >
          {file.tipo_arquivo === 'pdf' ? (
            <FileText className="w-4 h-4 text-red-500 shrink-0" />
          ) : (
            <Image className="w-4 h-4 text-blue-500 shrink-0" />
          )}
          <span className="text-sm flex-1 truncate text-foreground">{file.nome_arquivo}</span>
          <Download className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
        </a>
      ))}
    </div>
  )
}
