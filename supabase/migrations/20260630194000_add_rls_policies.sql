-- Enable RLS on key tables
ALTER TABLE public.separacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.separacao_arquivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entregas_finalizadas ENABLE ROW LEVEL SECURITY;

-- Policies for separacoes
DROP POLICY IF EXISTS "sep_select_auth" ON public.separacoes;
CREATE POLICY "sep_select_auth" ON public.separacoes
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "sep_insert_auth" ON public.separacoes;
CREATE POLICY "sep_insert_auth" ON public.separacoes
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "sep_update_auth" ON public.separacoes;
CREATE POLICY "sep_update_auth" ON public.separacoes
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "sep_delete_auth" ON public.separacoes;
CREATE POLICY "sep_delete_auth" ON public.separacoes
  FOR DELETE TO authenticated USING (true);

-- Policies for separacao_arquivos
DROP POLICY IF EXISTS "sep_arq_select_auth" ON public.separacao_arquivos;
CREATE POLICY "sep_arq_select_auth" ON public.separacao_arquivos
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "sep_arq_insert_auth" ON public.separacao_arquivos;
CREATE POLICY "sep_arq_insert_auth" ON public.separacao_arquivos
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "sep_arq_update_auth" ON public.separacao_arquivos;
CREATE POLICY "sep_arq_update_auth" ON public.separacao_arquivos
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "sep_arq_delete_auth" ON public.separacao_arquivos;
CREATE POLICY "sep_arq_delete_auth" ON public.separacao_arquivos
  FOR DELETE TO authenticated USING (true);

-- Policies for entregas_finalizadas
DROP POLICY IF EXISTS "ent_fin_select_auth" ON public.entregas_finalizadas;
CREATE POLICY "ent_fin_select_auth" ON public.entregas_finalizadas
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "ent_fin_insert_auth" ON public.entregas_finalizadas;
CREATE POLICY "ent_fin_insert_auth" ON public.entregas_finalizadas
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "ent_fin_update_auth" ON public.entregas_finalizadas;
CREATE POLICY "ent_fin_update_auth" ON public.entregas_finalizadas
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "ent_fin_delete_auth" ON public.entregas_finalizadas;
CREATE POLICY "ent_fin_delete_auth" ON public.entregas_finalizadas
  FOR DELETE TO authenticated USING (true);
