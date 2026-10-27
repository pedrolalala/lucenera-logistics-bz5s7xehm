// SPEC-231 D (pedido do usuário 27/10): o mesmo "Pedido em Separação" que a
// Separação Parcial imprime ao separar (separacao-parcial,
// SeparacaoParcialPage.tsx → imprimirListaSeparacao) passa a poder ser
// exportado também daqui, a qualquer momento. O layout é cópia do de lá —
// mudou um, mudar o outro.
import { supabase } from '@/lib/supabase/client'

const LOGO_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/Logo/lucenera-vertical.png`

const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const semPrefixo = (numero: string | null) => (numero ? numero.replace(/^[A-Za-z]+-/, '') : null)

const fmtData = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '-'

// coluna `date` chega como "AAAA-MM-DD"; new Date() mostraria o dia anterior
const fmtDia = (v: string | null) => {
  if (!v) return '-'
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : fmtData(v)
}

const numeroDoL = (l: string | null | undefined) => {
  const m = /(\d+)/.exec(l || '')
  return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER
}

interface ItemPedido {
  descricao: string
  codigo: number | null
  referencia: string | null
  /** SPEC-231 (27/10): marca da peça, ajuda a identificar o item */
  marca: string | null
  classificacao: string | null
  quantidade: number
}

async function carregarDados(separacaoId: string) {
  const { data: sep, error } = await supabase
    .from('separacoes')
    .select('id, numero_venda, numero_entrega, data_entrega, codigo_obra, cliente, cliente_id, created_at')
    .eq('id', separacaoId)
    .single()
  if (error) throw error
  const s = sep as any

  const { data: itensSep, error: errItens } = await supabase
    .from('separacao_itens')
    .select('projeto_item_id, descricao, quantidade, quantidade_estornada')
    .eq('separacao_id', separacaoId)
  if (errItens) throw errItens
  const itensValidos = ((itensSep as any[]) || []).filter(
    (i) => Number(i.quantidade) - Number(i.quantidade_estornada || 0) > 0,
  )
  if (itensValidos.length === 0) {
    throw new Error(
      'Esta separação não tem peças vinculadas a uma venda (foi criada direto na Logística).',
    )
  }

  const projetoItemIds = itensValidos.map((i) => i.projeto_item_id).filter(Boolean)
  const { data: projItens } = projetoItemIds.length
    ? await supabase.from('projeto_itens').select('id, l_fixo, produto_id').in('id', projetoItemIds)
    : { data: [] }
  const produtoIds = ((projItens as any[]) || []).map((p) => p.produto_id).filter(Boolean)
  const { data: produtos } = produtoIds.length
    ? await supabase.from('produtos').select('id, codigo_produto, referencia, marca:marcas(nome)').in('id', produtoIds)
    : { data: [] }
  const projMap = new Map(((projItens as any[]) || []).map((p) => [p.id, p]))
  const prodMap = new Map(((produtos as any[]) || []).map((p) => [p.id, p]))

  const itens: ItemPedido[] = itensValidos.map((i) => {
    const pi = projMap.get(i.projeto_item_id)
    const pr = pi ? prodMap.get(pi.produto_id) : null
    return {
      descricao: i.descricao,
      codigo: pr?.codigo_produto ?? null,
      referencia: pr?.referencia ?? null,
      marca: (Array.isArray(pr?.marca) ? pr.marca[0] : pr?.marca)?.nome ?? null,
      classificacao: pi?.l_fixo ?? null,
      quantidade: Number(i.quantidade) - Number(i.quantidade_estornada || 0),
    }
  })

  const [{ data: orc }, { data: cli }, { data: irmas }] = await Promise.all([
    s.numero_venda
      ? supabase
          .from('orcamentos')
          .select('numero, numero_venda, data_emissao, empresa:empresas(nome), vendedor:funcionarios(nome)')
          .eq('numero', s.numero_venda)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    s.cliente_id
      ? supabase
          .from('contatos')
          .select('nome, cpf_cnpj, telefone, celular, endereco, numero, bairro, cidade, estado')
          .eq('id', s.cliente_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    s.numero_venda
      ? supabase
          .from('separacoes')
          .select('id, created_at')
          .eq('numero_venda', s.numero_venda)
          .order('created_at', { ascending: true })
      : Promise.resolve({ data: [] }),
  ])
  const o = orc as any
  const c = cli as any

  // Número da parcial: o gravado pela Separação Parcial (ex.: 0002-P2); nas
  // antigas, a posição desta separação entre as da mesma venda (mesma conta
  // que a Separação Parcial usa).
  let numeroPedido: string = s.numero_entrega && /-P\d+$/.test(s.numero_entrega) ? s.numero_entrega : ''
  if (!numeroPedido) {
    const pos = ((irmas as any[]) || []).findIndex((x) => x.id === s.id) + 1
    numeroPedido = `${semPrefixo(o?.numero_venda) || s.numero_venda || '-'}-P${pos || 1}`
  }

  return {
    numeroPedido,
    dataEntrega: s.data_entrega as string | null,
    dataEmissaoOrcamento: o?.data_emissao ?? null,
    empresaNome: o?.empresa?.nome ?? null,
    vendedorNome: o?.vendedor?.nome ?? null,
    projetoCodigo: s.codigo_obra as string | null,
    clienteNome: c?.nome || s.cliente || null,
    clienteCpfCnpj: c?.cpf_cnpj ?? null,
    clienteTelefone: c?.telefone || c?.celular || null,
    clienteEndereco: c?.endereco ?? null,
    clienteNumero: c?.numero ?? null,
    clienteBairro: c?.bairro ?? null,
    clienteCidade: c?.cidade ?? null,
    clienteEstado: c?.estado ?? null,
    itens,
  }
}

export async function imprimirPedidoSeparacao(separacaoId: string) {
  // abre a janela antes de buscar os dados (senão o navegador bloqueia o pop-up)
  const janela = window.open('', '_blank', 'width=800,height=900')
  if (!janela) throw new Error('O navegador bloqueou a janela de impressão. Libere pop-ups para este site.')
  janela.document.write('<p style="font-family:Arial;padding:16px">Carregando pedido...</p>')

  let d: Awaited<ReturnType<typeof carregarDados>>
  try {
    d = await carregarDados(separacaoId)
  } catch (err) {
    janela.close()
    throw err
  }

  const itensOrdenados = d.itens
    .map((item, idx) => ({ item, idx }))
    .sort(
      (a, b) =>
        numeroDoL(a.item.classificacao) - numeroDoL(b.item.classificacao) || a.idx - b.idx,
    )
    .map((x) => x.item)
  const totalItens = itensOrdenados.length
  const totalPecas = itensOrdenados.reduce((soma, i) => soma + i.quantidade, 0)

  const linhas = itensOrdenados
    .map(
      (i) => `
        <tr>
          <td class="centro">${esc(i.classificacao || '-')}</td>
          <td class="centro">${esc(i.codigo ?? '-')}</td>
          <td class="ref">${esc(i.referencia || '-')}</td>
          <td class="ref">${esc(i.marca || '-')}</td>
          <td class="descricao">${esc(i.descricao || '-')}</td>
          <td class="centro">${i.quantidade}</td>
        </tr>`,
    )
    .join('')

  const endereco = d.clienteEndereco
    ? `${d.clienteEndereco}${d.clienteNumero ? ', ' + d.clienteNumero : ''}`
    : '-'
  const cidadeEstado = d.clienteCidade
    ? `${d.clienteCidade}${d.clienteEstado ? '-' + d.clienteEstado : ''}`
    : '-'

  const assinatura = (papel: string) => `
    <div class="assinatura">
      <div class="papel">${papel}</div>
      <div class="campo"><span>Nome</span></div>
      <div class="campo"><span>RG/CPF</span></div>
      <div class="campo"><span>Data/Hora</span></div>
    </div>`

  janela.document.open()
  janela.document.write(`
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Pedido em Separação ${esc(d.numeroPedido)}</title>
        <style>
          @page { margin: 14mm; }
          body { font-family: Arial, sans-serif; margin: 0; color: #111; font-size: 12px; }
          .cabecalho { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 16px; padding-bottom: 10px; border-bottom: 2px solid #111; }
          .cabecalho img { height: 56px; width: auto; }
          .cabecalho .titulo { text-align: center; }
          .cabecalho .titulo h1 { font-size: 15px; margin: 0; letter-spacing: 0.5px; }
          .cabecalho .titulo .num { font-size: 13px; font-weight: bold; margin-top: 4px; }
          .cabecalho .datas { text-align: right; font-size: 11px; line-height: 1.6; color: #333; }
          .empresa { margin-top: 10px; font-weight: bold; font-size: 13px; }
          .dados-cliente { margin-top: 8px; display: grid; grid-template-columns: 2fr 1fr; gap: 4px 24px; padding: 8px 10px; border: 1px solid #ccc; border-radius: 4px; }
          .dados-cliente .rotulo { color: #666; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 12px; margin-top: 14px; }
          th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
          th { background: #f3f3f3; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3px; }
          th.centro, td.centro { text-align: center; }
          td.ref { font-size: 11px; word-break: break-word; }
          td.descricao { font-size: 10px; line-height: 1.25; word-break: break-word; }
          tfoot td { font-weight: bold; background: #f9f9f9; }
          .observacoes { margin-top: 18px; }
          .observacoes .linha { border-bottom: 1px solid #999; height: 22px; margin-top: 8px; }
          .declaracao { margin-top: 22px; font-size: 11px; font-weight: bold; text-align: center; text-transform: uppercase; line-height: 1.5; }
          .assinaturas { margin-top: 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
          .assinatura .papel { font-weight: bold; font-size: 12px; text-transform: uppercase; border-top: 1px solid #111; padding-top: 4px; text-align: center; }
          .assinatura .campo { margin-top: 18px; border-bottom: 1px solid #999; height: 16px; font-size: 10px; color: #666; }
        </style>
      </head>
      <body>
        <div class="cabecalho">
          <div><img src="${LOGO_URL}" alt="Lucenera" /></div>
          <div class="titulo">
            <h1>PEDIDO EM SEPARAÇÃO</h1>
            <div class="num">Venda ${esc(d.numeroPedido)}</div>
          </div>
          <div class="datas">
            Impressão: ${new Date().toLocaleString('pt-BR')}<br />
            Data orçamento: ${fmtData(d.dataEmissaoOrcamento)}<br />
            Previsão de entrega: ${d.dataEntrega ? fmtDia(d.dataEntrega) : 'A combinar'}
          </div>
        </div>
        <div class="empresa">${esc(d.empresaNome || 'LUCENERA')}</div>
        <div class="dados-cliente">
          <div><span class="rotulo">Cliente:</span> ${esc(d.clienteNome || '-')}${d.clienteCpfCnpj ? ' · ' + esc(d.clienteCpfCnpj) : ''}</div>
          <div><span class="rotulo">Projeto:</span> ${esc(d.projetoCodigo || '-')}</div>
          <div><span class="rotulo">Endereço:</span> ${esc(endereco)}${d.clienteBairro ? ' - ' + esc(d.clienteBairro) : ''}</div>
          <div><span class="rotulo">Telefone:</span> ${esc(d.clienteTelefone || '-')}</div>
          <div><span class="rotulo">Cidade:</span> ${esc(cidadeEstado)}</div>
          <div><span class="rotulo">Vendedor:</span> ${esc(d.vendedorNome || '-')}</div>
        </div>
        <table>
          <colgroup>
            <col style="width:8%" /><col style="width:8%" /><col style="width:16%" /><col style="width:13%" /><col /><col style="width:7%" />
          </colgroup>
          <thead>
            <tr><th class="centro">ID</th><th class="centro">Cód.</th><th>Ref.</th><th>Marca</th><th>Descrição</th><th class="centro">Quant.</th></tr>
          </thead>
          <tbody>${linhas}</tbody>
          <tfoot>
            <tr><td colspan="5">Total de itens: ${totalItens}</td><td class="centro">${totalPecas}</td></tr>
          </tfoot>
        </table>
        <div class="observacoes">
          <strong>Observações (pendências, avarias, substituições):</strong>
          <div class="linha"></div>
          <div class="linha"></div>
          <div class="linha"></div>
        </div>
        <div class="declaracao">
          Assumo total responsabilidade pelas mercadorias correspondentes a esta entrega,
          bem como declaro correto o conteúdo e as quantidades mencionadas acima.
        </div>
        <div class="assinaturas">
          ${assinatura('Entregador')}
          ${assinatura('Recebedor')}
        </div>
      </body>
    </html>
  `)
  janela.document.close()
  // Espera a logo carregar para ela não sair em branco na impressão.
  const imprimir = () => {
    janela.focus()
    janela.print()
  }
  const logo = janela.document.querySelector('img')
  if (logo && !logo.complete) {
    logo.onload = imprimir
    logo.onerror = imprimir
  } else {
    imprimir()
  }
}
