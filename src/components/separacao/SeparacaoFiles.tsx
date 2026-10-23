import { useState, useEffect } from 'react'
import { useSeparacaoArquivos, SeparacaoArquivo } from '@/hooks/useSeparacaoArquivos'
import { FileText, Image, Download, Loader2, Undo2 } from 'lucide-react'
import { linkAssinado, registrarEvento } from '@/lib/logistica'

interface SeparacaoFilesProps {
  separacaoId: string
}

export function SeparacaoFiles({ separacaoId }: SeparacaoFilesProps) {
  const { fetchArquivos } = useSeparacaoArquivos()
  const [files, setFiles] = useState<(SeparacaoArquivo & { categoria?: string })[]>([])
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

  // SPEC-226: url_arquivo agora é o caminho no bucket privado; o link assinado é gerado
  // na hora (os links antigos de 7 dias venciam). URLs antigas continuam funcionando.
  const abrir = async (file: SeparacaoArquivo) => {
    const janela = window.open('', '_blank')
    const url = await linkAssinado('materiais-separacao', file.url_arquivo)
    if (janela) janela.location.href = url
    else window.location.href = url
    registrarEvento('abriu_documento', separacaoId, file.nome_arquivo)
  }

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
      {files.map((file) => {
        const devolucao = file.categoria === 'orcamento_devolucao'
        return (
          <button
            key={file.id}
            type="button"
            onClick={() => abrir(file)}
            className={
              'w-full text-left flex items-center gap-2 p-2 rounded-md border transition-colors group ' +
              (devolucao
                ? 'border-red-400 bg-red-50 hover:bg-red-100'
                : 'border-border hover:bg-muted')
            }
          >
            {devolucao ? (
              <Undo2 className="w-4 h-4 text-red-600 shrink-0" />
            ) : file.tipo_arquivo === 'pdf' ? (
              <FileText className="w-4 h-4 text-red-500 shrink-0" />
            ) : (
              <Image className="w-4 h-4 text-blue-500 shrink-0" />
            )}
            <span className="text-sm flex-1 truncate text-foreground">{file.nome_arquivo}</span>
            {devolucao && (
              <span className="text-[10px] font-bold text-red-700 shrink-0">
                ORÇAMENTO DE DEVOLUÇÃO
              </span>
            )}
            <Download className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          </button>
        )
      })}
    </div>
  )
}
