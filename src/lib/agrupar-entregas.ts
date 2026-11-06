// SPEC-256: no sistema novo cada pedido de separação cria uma lista própria. Quando o mesmo cliente recebe várias listas
// no mesmo dia e no mesmo endereço, é UMA entrega com várias listas — o calendário e a contagem do dia usam o grupo.
// Só agrupa na visualização: as listas continuam separadas para a separação, a baixa e o PDF.
//
// Chave do grupo = cliente + endereço de entrega. A data já é a do dia do calendário, então lista com outra data
// (ex.: peça especial para 2 semanas) nunca entra no grupo. Nunca agrupa só pelo nome do cliente e, sem endereço
// preenchido, a lista fica sozinha (na dúvida, não junta).

export interface GrupoEntrega {
  chave: string
  entregas: any[]
  /** Complexidade do grupo = a mais alta entre as listas (dificil > medio > facil). */
  nivelComplexidade: string | null
}

const ORDEM_COMPLEXIDADE = ['facil', 'medio', 'dificil']

const normalizar = (t: unknown) =>
  String(t ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

function chaveDoGrupo(e: any): string | null {
  const endereco = normalizar(e.endereco || e.endereco_entrega)
  if (!endereco) return null
  // código do cliente quando existe; senão o nome normalizado (o endereço também precisa bater)
  const cliente = e.cliente_id ? `id:${e.cliente_id}` : `nome:${normalizar(e.cliente)}`
  if (cliente === 'nome:') return null
  return `${cliente}|${endereco}`
}

export function agruparEntregas(entregas: any[]): GrupoEntrega[] {
  const grupos: GrupoEntrega[] = []
  const porChave = new Map<string, GrupoEntrega>()
  for (const e of entregas) {
    const chave = chaveDoGrupo(e)
    if (chave && porChave.has(chave)) {
      porChave.get(chave)!.entregas.push(e)
      continue
    }
    const grupo: GrupoEntrega = {
      chave: chave ?? `solta:${e.id}`,
      entregas: [e],
      nivelComplexidade: null,
    }
    grupos.push(grupo)
    if (chave) porChave.set(chave, grupo)
  }
  for (const g of grupos) {
    let melhor = -1
    for (const e of g.entregas) {
      const i = ORDEM_COMPLEXIDADE.indexOf(e.nivel_complexidade)
      if (i > melhor) melhor = i
    }
    g.nivelComplexidade = melhor >= 0 ? ORDEM_COMPLEXIDADE[melhor] : null
  }
  return grupos
}
