// SPEC-327 (solicitação 4875eaa1, Matheus 19/11/2026): folha "Rota do Dia" em PDF para o entregador.
// Segue o modelo que o estoque já usa (cliente, contato, endereço, entregue sim/não com motivo, hora/data), na
// ordem da rota da janela "Criar Rota Otimizada". Mesmo padrão das outras impressões (pedido-separacao.ts):
// abre uma janela com a página A4 e chama a impressão; o PDF sai pelo "Salvar como PDF" do navegador.
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Separacao } from '@/hooks/useSeparacoes'

const LOGO_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/Logo/lucenera-vertical.png`

const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const ou = (v: unknown) => (String(v ?? '').trim() ? esc(String(v).trim()) : '—')

export interface OpcoesRotaPdf {
  data: Date
  /** entregas já na ordem da rota */
  entregas: Separacao[]
  /** horário de saída (HH:mm) da janela */
  saida?: string
  /** nome do entregador, opcional; vazio deixa a linha para assinar */
  entregador?: string
}

/** Abre a página da rota e chama a impressão. Retorna false se o navegador bloqueou a janela. */
export function imprimirRotaDoDia({ data, entregas, saida, entregador }: OpcoesRotaPdf): boolean {
  const janela = window.open('', '_blank')
  if (!janela) return false

  const dia = format(data, 'dd/MM/yyyy')
  const semana = format(data, 'EEEE', { locale: ptBR }).toUpperCase()

  const linhas = entregas
    .map((d) => {
      const endereco = d.endereco_entrega || d.endereco
      // `numero_venda` é texto no banco, apesar do tipo declarar lista: aceita os dois formatos
      const bruto: unknown = d.numero_venda
      const venda =
        d.venda_numero || (Array.isArray(bruto) ? bruto.filter(Boolean).join(', ') : String(bruto ?? '').trim())
      const contato = [d.responsavel_recebimento, d.telefone].filter((x) => String(x ?? '').trim())
      return `
        <tr>
          <td class="cliente">
            <div class="nome">${ou(d.cliente)}</div>
            <div class="meta">Obra ${ou(d.codigo_obra)}${venda ? ` · Venda ${esc(venda)}` : ''}</div>
          </td>
          <td class="contato">${contato.length ? contato.map((c) => `<div>${esc(String(c).trim())}</div>`).join('') : '—'}</td>
          <td class="endereco">${ou(endereco)}</td>
          <td class="preencher">
            <div>Sim: ( &nbsp;&nbsp; )</div>
            <div>Não: ( &nbsp;&nbsp; )</div>
            <div class="peq">Se não, por qual motivo?:</div>
            <div class="linha"></div>
          </td>
          <td class="preencher">
            <div>Manhã: ( &nbsp;&nbsp; )</div>
            <div>Tarde: ( &nbsp;&nbsp; )</div>
            <div>Hora: ___:___ hrs</div>
            <div class="peq">Data:<br />${esc(dia)}</div>
          </td>
        </tr>`
    })
    .join('')

  janela.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Rota do Dia - ${esc(dia)}</title>
    <style>
      @page { size: A4 portrait; margin: 12mm; }
      * { box-sizing: border-box; }
      body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; font-size: 12px; }
      .topo { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
      .avisos { flex: 1; text-align: center; }
      .aviso1 { display: inline-block; background: #d9d9d9; font-weight: 700; font-size: 12px; padding: 2px 8px; }
      .aviso2 { font-size: 10px; margin-top: 4px; }
      .logo img { height: 46px; }
      h1 { margin: 14px 0 4px; text-align: center; font-size: 22px; }
      h1 span { background: #d9d9d9; padding: 2px 14px; }
      .saida { text-align: center; font-size: 11px; color: #444; margin-bottom: 10px; }
      table { width: 100%; border-collapse: collapse; table-layout: fixed; }
      th, td { border: 1px solid #000; padding: 6px; vertical-align: middle; }
      th { background: #d9d9d9; font-size: 13px; text-align: center; }
      thead { display: table-header-group; }
      tr { page-break-inside: avoid; }
      tbody td { height: 28mm; }
      td.cliente { text-align: center; width: 22%; }
      td.cliente .nome { font-weight: 700; text-transform: uppercase; }
      td.cliente .meta { font-size: 9px; color: #444; margin-top: 3px; }
      td.contato { text-align: center; width: 17%; }
      td.endereco { text-align: center; width: 27%; }
      td.preencher { width: 17%; font-size: 11px; line-height: 1.5; text-align: center; }
      td.preencher .peq { font-size: 9px; margin-top: 3px; }
      td.preencher .linha { border-bottom: 1px solid #000; margin: 16px 6px 2px; height: 1px; }
      .rodape { margin-top: 70px; text-align: right; }
      .assinatura { display: inline-block; min-width: 260px; border-top: 1px solid #000; padding-top: 3px; text-align: center; font-size: 10px; }
      .assinatura b { display: block; font-size: 12px; margin-top: 2px; }
    </style>
  </head>
  <body>
    <div class="topo">
      <div class="avisos">
        <div class="aviso1">****LIGAR ANTES DE IR E COMBINAR PREVIAMENTE A ENTREGA****</div>
        <div class="aviso2"><b>OBS.</b> SEMPRE OLHAR A <b><u>REFERÊNCIA DA PEÇA</u></b> E VERIFICAR CONFORME A LISTA DE ENTREGA.</div>
      </div>
      <div class="logo"><img src="${LOGO_URL}" alt="Lucenera" /></div>
    </div>
    <h1><span>${esc(semana)} – ${esc(dia)}</span></h1>
    <div class="saida">${entregas.length} ${entregas.length === 1 ? 'entrega' : 'entregas'}${saida ? ` · saída ${esc(saida)}` : ''}</div>
    <table>
      <thead>
        <tr><th>CLIENTE</th><th>CONTATO</th><th>ENDEREÇO</th><th>ENTREGUE</th><th>HORA/DATA</th></tr>
      </thead>
      <tbody>${linhas}</tbody>
    </table>
    <div class="rodape">
      <div class="assinatura">Entregador responsável<b>${entregador && entregador.trim() ? esc(entregador.trim()) : '&nbsp;'}</b></div>
    </div>
  </body>
</html>`)
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
  return true
}
