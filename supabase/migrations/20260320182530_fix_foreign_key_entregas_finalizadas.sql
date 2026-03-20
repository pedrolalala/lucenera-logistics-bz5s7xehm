DO $BODY$ 
BEGIN
    -- 1. Remover registros com IDs nulos para permitir a criação de Primary Keys, caso existam
    DELETE FROM public.separacoes WHERE id IS NULL;
    DELETE FROM public.entregas_finalizadas WHERE id IS NULL;

    -- 2. Alterar colunas de identificação para NOT NULL
    ALTER TABLE public.separacoes ALTER COLUMN id SET NOT NULL;
    ALTER TABLE public.entregas_finalizadas ALTER COLUMN id SET NOT NULL;

    -- 3. Adicionar Primary Key para tabela separacoes se não existir
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conrelid = 'public.separacoes'::regclass AND contype = 'p'
    ) THEN
        ALTER TABLE public.separacoes ADD CONSTRAINT separacoes_pkey PRIMARY KEY (id);
    END IF;

    -- 4. Adicionar Primary Key para tabela entregas_finalizadas se não existir
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conrelid = 'public.entregas_finalizadas'::regclass AND contype = 'p'
    ) THEN
        ALTER TABLE public.entregas_finalizadas ADD CONSTRAINT entregas_finalizadas_pkey PRIMARY KEY (id);
    END IF;

    -- 5. Limpar referências órfãs antes de criar a Foreign Key para evitar falhas de restrição
    UPDATE public.entregas_finalizadas 
    SET separacao_id = NULL 
    WHERE separacao_id IS NOT NULL 
    AND separacao_id NOT IN (SELECT id FROM public.separacoes);

    -- 6. Criar a Foreign Key explicitamente configurando o relacionamento esperado
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'entregas_finalizadas_separacao_id_fkey'
    ) THEN
        ALTER TABLE public.entregas_finalizadas 
        ADD CONSTRAINT entregas_finalizadas_separacao_id_fkey 
        FOREIGN KEY (separacao_id) REFERENCES public.separacoes(id) ON DELETE SET NULL;
    END IF;
END $BODY$;

-- Forçar o reload do cache do schema para o PostgREST (Supabase API) reconhecer a nova relação imediatamente
NOTIFY pgrst, 'reload schema';
