// SPEC-226: ações compartilhadas do Logística — registro de log, arquivos
// privados, impressão de uma solicitação e e-mail de recusa.
import { format, parseISO } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import type { Separacao } from '@/hooks/useSeparacoes'

export type BucketLogistica = 'materiais-separacao' | 'entregas-fotos'

// SPEC-231 D4: separacoes.numero_venda guarda o número do ORÇAMENTO (ex.: ORC-0003); o da venda (VENDA-0003,
// sequência própria) vem de orcamentos.numero_venda. Devolve orçamento -> venda.
export async function numerosDaVenda(orcamentos: unknown[]): Promise<Map<string, string>> {
  const numeros = Array.from(
    new Set(orcamentos.map((n) => String(n ?? '').trim()).filter((n) => /^ORC-/i.test(n))),
  )
  if (numeros.length === 0) return new Map()
  const { data } = await supabase.from('orcamentos').select('numero, numero_venda').in('numero', numeros)
  return new Map(
    ((data as any[]) || []).filter((o) => o.numero_venda).map((o) => [o.numero, o.numero_venda]),
  )
}

/** "VENDA-0003" -> "0003" */
export const semPrefixo = (numero: string | null | undefined) =>
  numero ? numero.replace(/^[A-Za-z]+-/, '') : ''

export const COMPLEXIDADE_LABEL: Record<string, string> = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Complexo',
}

export const isGarantia = (s: Pick<Separacao, 'tipo_pedido' | 'inclui_garantia'>) =>
  s.tipo_pedido === 'garantia' || !!s.inclui_garantia

export const isDevolucao = (s: Pick<Separacao, 'inclui_devolucao'>) => !!s.inclui_devolucao

/** Tem entrega de material normal (garantia "pura" não tem). */
export const temEntregaNormal = (s: Pick<Separacao, 'tipo_pedido'>) =>
  (s.tipo_pedido || 'normal') !== 'garantia'

/** Ações que não mudam o banco (imprimir, e-mail, abrir documento) também vão para o registro. */
export async function registrarEvento(
  tipo: 'imprimiu' | 'enviou_email' | 'abriu_documento' | 'exportou',
  separacaoId: string | null,
  detalhe?: string,
) {
  try {
    // função nova (SPEC-226) ainda fora dos tipos gerados
    await (supabase as any).rpc('logistica_registrar_evento', {
      p_tipo: tipo,
      p_separacao_id: separacaoId,
      p_detalhe: detalhe ?? null,
    })
  } catch {
    // o registro nunca pode travar a tela
  }
}

/** Envia para o bucket privado e devolve o caminho (o link assinado é gerado na hora de abrir). */
export async function enviarArquivo(bucket: BucketLogistica, pasta: string, file: File, i = 0) {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const caminho = `${pasta || 'sem-obra'}/${Date.now()}_${i}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(caminho, file)
  if (error) throw new Error(`Erro ao enviar ${file.name}: ${error.message}`)
  return caminho
}

/** Aceita caminho do bucket ou URL antiga (pública/assinada) e devolve um link válido. */
export async function linkAssinado(bucket: BucketLogistica, urlOuCaminho: string) {
  let caminho = urlOuCaminho
  if (/^https?:\/\//.test(urlOuCaminho)) {
    const m = urlOuCaminho.match(new RegExp(`/${bucket}/([^?]+)`))
    if (!m) return urlOuCaminho
    caminho = decodeURIComponent(m[1])
  }
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(caminho, 3600)
  if (error || !data) return urlOuCaminho
  return data.signedUrl
}

const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const dataBR = (v?: string | null, comHora = false) => {
  if (!v) return '—'
  try {
    return format(parseISO(v), comHora ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy')
  } catch {
    return v
  }
}

const numeroVenda = (s: Separacao) =>
  String(
    Array.isArray(s.numero_venda) ? s.numero_venda.join(', ') : s.numero_venda || '—',
  ).replace(/\b(VENDA|ORC)-(\d)/gi, '$2')

const tiposTexto = (s: Separacao) =>
  [
    temEntregaNormal(s) && 'Entrega',
    isGarantia(s) && 'Garantia',
    isDevolucao(s) && 'Retirada de devolução',
  ]
    .filter(Boolean)
    .join(' + ')

/** Imprime só esta solicitação (como imprimir o corpo de um e-mail). */
export async function imprimirSolicitacao(s: Separacao) {
  const [{ data: itens }, { data: arquivos }] = await Promise.all([
    supabase
      .from('separacao_itens')
      .select('descricao, quantidade, unidade, observacoes')
      .eq('separacao_id', s.id)
      .order('created_at'),
    supabase.from('separacao_arquivos').select('nome_arquivo, categoria').eq('separacao_id', s.id),
  ])

  const linha = (rot: string, val: unknown) =>
    `<tr><th>${esc(rot)}</th><td>${esc(val) || '—'}</td></tr>`

  const itensHtml = (itens || []).length
    ? `<h2>Peças (${itens!.length})</h2><table class="itens"><tr><th>Qtd</th><th>Descrição</th><th>Obs.</th></tr>${itens!
        .map(
          (i: any) =>
            `<tr><td>${esc(i.quantidade)} ${esc(i.unidade || '')}</td><td>${esc(i.descricao)}</td><td>${esc(i.observacoes || '')}</td></tr>`,
        )
        .join('')}</table>`
    : ''

  const arqs = (arquivos || []) as { nome_arquivo: string; categoria?: string }[]
  const arqHtml = arqs.length
    ? `<ul>${arqs
        .map(
          (a) =>
            `<li>${esc(a.nome_arquivo)}${a.categoria === 'orcamento_devolucao' ? ' <b>(orçamento de devolução)</b>' : ''}</li>`,
        )
        .join('')}</ul>`
    : ''

  const garantia = isGarantia(s)
    ? `<div class="box gar"><b>GARANTIA</b>${s.garantia_detalhes ? `<p>${esc(s.garantia_detalhes)}</p>` : ''}${
        s.garantia_peca ? `<p>Peça: ${esc(s.garantia_peca)}</p>` : ''
      }${s.garantia_motivo ? `<p>Motivo: ${esc(s.garantia_motivo)}</p>` : ''}</div>`
    : ''
  const devolucao = isDevolucao(s)
    ? `<div class="box dev"><b>RETIRADA DE DEVOLUÇÃO</b>${
        s.devolucao_detalhes ? `<p>${esc(s.devolucao_detalhes)}</p>` : ''
      }</div>`
    : ''

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Solicitação ${esc(s.numero_entrega || '')} - ${esc(s.cliente)}</title>
<style>
 body{font-family:Arial,sans-serif;font-size:12px;color:#111;margin:24px}
 h1{font-size:18px;margin:0 0 4px} h2{font-size:14px;margin:18px 0 6px}
 .sub{color:#555;margin-bottom:12px}
 table{border-collapse:collapse;width:100%} th,td{border:1px solid #bbb;padding:5px 7px;text-align:left;vertical-align:top}
 th{background:#f2f2f2;width:180px} table.itens th{width:auto}
 .box{border:2px solid;padding:8px 10px;margin-top:12px;border-radius:4px} .box p{margin:4px 0 0}
 .gar{border-color:#d4a000;background:#fff8db} .dev{border-color:#c62828;background:#fdecea}
 .obs{white-space:pre-wrap}
 @media print{body{margin:10mm}}
</style></head><body>
<h1>Solicitação de separação ${esc(s.numero_entrega || '')}</h1>
<div class="sub">${esc(tiposTexto(s))} · Complexidade: ${esc(COMPLEXIDADE_LABEL[s.nivel_complexidade || ''] || '—')} · Impresso em ${format(new Date(), 'dd/MM/yyyy HH:mm')}</div>
<table>
${linha('Cliente', s.cliente)}
${linha('Obra / Nº venda', `${s.codigo_obra || '—'} / ${numeroVenda(s)}`)}
${linha('Pedido em', dataBR(s.created_at, true))}
${linha('Solicitante', s.solicitante)}
${linha('Gestora da equipe', s.gestora_equipe)}
${linha('Data da entrega', dataBR(s.data_entrega) + (s.delivery_type === 'scheduled' ? ` — HORA MARCADA ${s.scheduled_time || ''}` : ' — flexível'))}
${linha('Quem vai receber', s.responsavel_recebimento)}
${linha('Telefone', s.telefone)}
${linha('Endereço', s.endereco_entrega || s.endereco)}
${linha('Forma de entrega', (s.tipo_entrega || '').replace(/_/g, ' '))}
${linha('Anexos', arqs.length)}
</table>
${s.observacoes_internas ? `<h2>Observação</h2><div class="obs">${esc(s.observacoes_internas)}</div>` : ''}
${garantia}${devolucao}
${itensHtml}
${arqHtml ? `<h2>Arquivos anexados (${arqs.length})</h2>${arqHtml}` : ''}
<script>window.onload=function(){window.print()}</script>
</body></html>`

  const w = window.open('', '_blank')
  if (!w) throw new Error('O navegador bloqueou a janela de impressão. Libere pop-ups para este site.')
  w.document.open()
  w.document.write(html)
  w.document.close()
  registrarEvento('imprimiu', s.id)
}

const normalizar = (v: string) =>
  v
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()

/** Procura o e-mail pelo primeiro nome no cadastro de usuários; só usa se achar exatamente 1. */
async function emailPorNome(nomes: (string | null | undefined)[]) {
  const alvos = nomes.filter(Boolean).map((n) => normalizar(String(n)).split(/\s+/)[0])
  if (alvos.length === 0) return []
  const { data } = await supabase.from('usuarios').select('nome, email').eq('ativo', true)
  const lista = (data || []) as { nome: string | null; email: string | null }[]
  const achados: string[] = []
  for (const alvo of alvos) {
    const m = lista.filter(
      (u) => u.email && u.nome && normalizar(u.nome).split(/\s+/)[0] === alvo,
    )
    if (m.length === 1 && !achados.includes(m[0].email!)) achados.push(m[0].email!)
  }
  return achados
}

/** Abre um e-mail novo (Outlook) já preenchido; quem recusou só confere e envia. */
export async function abrirEmailRecusa(s: Separacao, motivo: string) {
  const para = await emailPorNome([s.solicitante, s.gestora_equipe])
  const assunto = `Solicitação de entrega RECUSADA — ${s.numero_entrega || ''} ${s.cliente}`.trim()
  const corpo = [
    'Olá,',
    '',
    'A solicitação de separação abaixo foi recusada pelo estoque e precisa de ajuste:',
    '',
    `Cliente: ${s.cliente}`,
    `Nº entrega: ${s.numero_entrega || '—'}   Obra: ${s.codigo_obra || '—'}   Venda: ${numeroVenda(s)}`,
    `Data de entrega pedida: ${dataBR(s.data_entrega)}`,
    `Solicitante: ${s.solicitante || '—'}`,
    '',
    `MOTIVO: ${motivo}`,
    '',
    'Corrija a solicitação no Sistema de Entregas (aba Recusados → Corrigir e reenviar).',
  ].join('\r\n')
  const href = `mailto:${para.join(';')}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`
  window.location.href = href
  registrarEvento('enviou_email', s.id, `Recusa para ${para.join(', ') || '(sem destinatário)'}`)
  return para
}
