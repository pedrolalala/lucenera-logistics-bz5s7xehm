ALTER TABLE public.separacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.separacao_arquivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entregas_finalizadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles_separacao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sep_select_auth" ON public.separacoes;
CREATE POLICY "sep_select_auth" ON public.separacoes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "sep_insert_auth" ON public.separacoes;
CREATE POLICY "sep_insert_auth" ON public.separacoes FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "sep_update_auth" ON public.separacoes;
CREATE POLICY "sep_update_auth" ON public.separacoes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "sep_delete_auth" ON public.separacoes;
CREATE POLICY "sep_delete_auth" ON public.separacoes FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "sep_arq_select_auth" ON public.separacao_arquivos;
CREATE POLICY "sep_arq_select_auth" ON public.separacao_arquivos FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "sep_arq_insert_auth" ON public.separacao_arquivos;
CREATE POLICY "sep_arq_insert_auth" ON public.separacao_arquivos FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "sep_arq_update_auth" ON public.separacao_arquivos;
CREATE POLICY "sep_arq_update_auth" ON public.separacao_arquivos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "sep_arq_delete_auth" ON public.separacao_arquivos;
CREATE POLICY "sep_arq_delete_auth" ON public.separacao_arquivos FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "ent_fin_select_auth" ON public.entregas_finalizadas;
CREATE POLICY "ent_fin_select_auth" ON public.entregas_finalizadas FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "ent_fin_insert_auth" ON public.entregas_finalizadas;
CREATE POLICY "ent_fin_insert_auth" ON public.entregas_finalizadas FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "ent_fin_update_auth" ON public.entregas_finalizadas;
CREATE POLICY "ent_fin_update_auth" ON public.entregas_finalizadas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "ent_fin_delete_auth" ON public.entregas_finalizadas;
CREATE POLICY "ent_fin_delete_auth" ON public.entregas_finalizadas FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "user_role_sep_select_auth" ON public.user_roles_separacao;
CREATE POLICY "user_role_sep_select_auth" ON public.user_roles_separacao FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "user_role_sep_insert_auth" ON public.user_roles_separacao;
CREATE POLICY "user_role_sep_insert_auth" ON public.user_roles_separacao FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "user_role_sep_update_auth" ON public.user_roles_separacao;
CREATE POLICY "user_role_sep_update_auth" ON public.user_roles_separacao FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

INSERT INTO public.user_roles_separacao (user_id, nome_completo, email, role, sistema)
SELECT id, 'Pedro', 'pedro@lucenera.com.br', 'admin', 'Separação e Entregas'
FROM auth.users
WHERE email = 'pedro@lucenera.com.br'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles_separacao WHERE email = 'pedro@lucenera.com.br'
);

NOTIFY pgrst, 'reload schema';
