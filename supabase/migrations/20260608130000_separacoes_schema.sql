DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'separacao_status') THEN
    CREATE TYPE public.separacao_status AS ENUM (
      'Rascunho', 'Pendente', 'Em separação', 'Pronto', 'Enviado', 'Cancelado', 'finalizado', 'separado', 'material_solicitado'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.separacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id uuid REFERENCES public.projetos(id) ON DELETE SET NULL,
  responsavel_id uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
  status public.separacao_status NOT NULL DEFAULT 'Pendente'::public.separacao_status,
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  endereco_entrega text,
  delivery_type text DEFAULT 'flexible'::text,
  scheduled_time time without time zone,
  data_entrega date,
  cliente text,
  codigo_obra text,
  data_entrega_original date,
  reagendamentos integer NOT NULL DEFAULT 0,
  cliente_id uuid REFERENCES public.contatos(id) ON DELETE SET NULL,
  responsavel_recebimento text,
  telefone text,
  endereco text,
  material_tipo text,
  material_conteudo jsonb,
  solicitante text,
  order_in_route boolean DEFAULT false,
  observacoes_internas text,
  gestora_equipe text,
  separacoes_parciais jsonb,
  nivel_complexidade text,
  tipo_entrega text,
  transportadora_nome text,
  codigo_rastreamento text,
  numero_venda text,
  numero_entrega text,
  data_inicio_separacao timestamp with time zone,
  tipo_pedido text,
  garantia_detalhes text,
  inclui_garantia boolean DEFAULT false,
  garantia_peca text,
  garantia_motivo text
);

ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS projeto_id uuid REFERENCES public.projetos(id) ON DELETE SET NULL;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS responsavel_id uuid REFERENCES public.usuarios(id) ON DELETE SET NULL;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS status public.separacao_status NOT NULL DEFAULT 'Pendente'::public.separacao_status;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS observacoes text;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS created_at timestamp with time zone NOT NULL DEFAULT now();
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS endereco_entrega text;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS delivery_type text DEFAULT 'flexible'::text;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS scheduled_time time without time zone;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS data_entrega date;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS cliente text;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS codigo_obra text;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS data_entrega_original date;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS reagendamentos integer NOT NULL DEFAULT 0;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS cliente_id uuid REFERENCES public.contatos(id) ON DELETE SET NULL;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS responsavel_recebimento text;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS telefone text;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS endereco text;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS material_tipo text;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS material_conteudo jsonb;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS solicitante text;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS order_in_route boolean DEFAULT false;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS observacoes_internas text;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS gestora_equipe text;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS separacoes_parciais jsonb;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS nivel_complexidade text;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS tipo_entrega text;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS transportadora_nome text;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS codigo_rastreamento text;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS numero_venda text;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS numero_entrega text;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS data_inicio_separacao timestamp with time zone;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS tipo_pedido text;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS garantia_detalhes text;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS inclui_garantia boolean DEFAULT false;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS garantia_peca text;
ALTER TABLE public.separacoes ADD COLUMN IF NOT EXISTS garantia_motivo text;

CREATE INDEX IF NOT EXISTS idx_sep_projeto ON public.separacoes USING btree (projeto_id);
CREATE INDEX IF NOT EXISTS idx_sep_responsavel ON public.separacoes USING btree (responsavel_id);
CREATE INDEX IF NOT EXISTS idx_sep_status ON public.separacoes USING btree (status);
CREATE INDEX IF NOT EXISTS idx_sep_data_entrega ON public.separacoes USING btree (data_entrega);
CREATE INDEX IF NOT EXISTS idx_sep_cliente_id ON public.separacoes USING btree (cliente_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'separacoes_delivery_type_check'
  ) THEN
    ALTER TABLE public.separacoes ADD CONSTRAINT separacoes_delivery_type_check CHECK (delivery_type = ANY (ARRAY['scheduled'::text, 'flexible'::text]));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS separacoes_updated_at ON public.separacoes;
CREATE TRIGGER separacoes_updated_at BEFORE UPDATE ON public.separacoes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.trigger_separacao_pronta()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'Pronto'::public.separacao_status AND OLD.status <> 'Pronto'::public.separacao_status THEN
    IF NEW.data_entrega IS NULL THEN
      RAISE EXCEPTION 'Defina a data de entrega antes de marcar a separação como Pronto.';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM public.entregas
      WHERE separacao_id = NEW.id
        AND status <> 'Cancelado'::public.entrega_status
    ) THEN
      INSERT INTO public.entregas (
        separacao_id,
        projeto_id,
        entregador_id,
        endereco_entrega,
        contato_destino,
        data_prevista,
        status
      ) VALUES (
        NEW.id,
        NEW.projeto_id,
        NEW.responsavel_id,
        NEW.endereco_entrega,
        NEW.cliente,
        NEW.data_entrega,
        'Pendente'::public.entrega_status
      );
    ELSE
      UPDATE public.entregas
      SET data_prevista = NEW.data_entrega,
          updated_at    = NOW()
      WHERE separacao_id = NEW.id
        AND status = 'Pendente'::public.entrega_status;
    END IF;
  END IF;

  IF NEW.status = 'Pronto'::public.separacao_status
     AND OLD.data_entrega IS DISTINCT FROM NEW.data_entrega
     AND NEW.data_entrega IS NOT NULL THEN

    UPDATE public.entregas
    SET data_prevista = NEW.data_entrega,
        updated_at    = NOW()
    WHERE separacao_id = NEW.id
      AND status = 'Pendente'::public.entrega_status;

  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_separacao_pronta ON public.separacoes;
CREATE TRIGGER trg_separacao_pronta AFTER UPDATE OF status, data_entrega ON public.separacoes FOR EACH ROW EXECUTE FUNCTION public.trigger_separacao_pronta();

CREATE OR REPLACE FUNCTION public.sync_separacao_cliente()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.cliente_id IS NOT NULL THEN
    SELECT nome INTO NEW.cliente
    FROM public.contatos
    WHERE id = NEW.cliente_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_sep_cliente ON public.separacoes;
CREATE TRIGGER trg_sync_sep_cliente BEFORE INSERT OR UPDATE OF cliente_id ON public.separacoes FOR EACH ROW EXECUTE FUNCTION public.sync_separacao_cliente();

CREATE OR REPLACE FUNCTION public.sync_separacao_codigo_obra()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.projeto_id IS NOT NULL THEN
    SELECT codigo INTO NEW.codigo_obra
    FROM public.projetos
    WHERE id = NEW.projeto_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_sep_codigo_obra ON public.separacoes;
CREATE TRIGGER trg_sync_sep_codigo_obra BEFORE INSERT OR UPDATE OF projeto_id ON public.separacoes FOR EACH ROW EXECUTE FUNCTION public.sync_separacao_codigo_obra();

CREATE OR REPLACE FUNCTION public.track_reagendamento()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.data_entrega IS NULL AND NEW.data_entrega IS NOT NULL THEN
    NEW.data_entrega_original = NEW.data_entrega;
  END IF;
  IF OLD.data_entrega IS NOT NULL
     AND NEW.data_entrega IS NOT NULL
     AND OLD.data_entrega <> NEW.data_entrega THEN
    NEW.reagendamentos = OLD.reagendamentos + 1;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_track_reagendamento ON public.separacoes;
CREATE TRIGGER trg_track_reagendamento BEFORE UPDATE OF data_entrega ON public.separacoes FOR EACH ROW EXECUTE FUNCTION public.track_reagendamento();
