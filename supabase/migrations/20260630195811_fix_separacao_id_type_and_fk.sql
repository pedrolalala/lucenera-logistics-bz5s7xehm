DO $$
BEGIN
  -- 1. Drop any existing FK constraint (may have been created by earlier migration attempt)
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'entregas_finalizadas_separacao_id_fkey'
  ) THEN
    ALTER TABLE public.entregas_finalizadas
      DROP CONSTRAINT entregas_finalizadas_separacao_id_fkey;
  END IF;

  -- 2. Clean up invalid separacao_id values that cannot be cast to UUID
  --    Set to NULL any value that is not a valid UUID string
  UPDATE public.entregas_finalizadas
  SET separacao_id = NULL
  WHERE separacao_id IS NOT NULL
    AND separacao_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

  -- 3. Set orphaned references to NULL (separacao_id points to non-existent separacoes)
  UPDATE public.entregas_finalizadas
  SET separacao_id = NULL
  WHERE separacao_id IS NOT NULL
    AND separacao_id NOT IN (SELECT id::text FROM public.separacoes);

  -- 4. Convert separacao_id from TEXT to UUID
  --    First check current type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'entregas_finalizadas'
      AND column_name = 'separacao_id'
      AND data_type = 'text'
  ) THEN
    ALTER TABLE public.entregas_finalizadas
      ALTER COLUMN separacao_id TYPE uuid USING separacao_id::uuid;
  END IF;

  -- 5. Create the Foreign Key constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'entregas_finalizadas_separacao_id_fkey'
  ) THEN
    ALTER TABLE public.entregas_finalizadas
      ADD CONSTRAINT entregas_finalizadas_separacao_id_fkey
      FOREIGN KEY (separacao_id) REFERENCES public.separacoes(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Force PostgREST schema cache reload so the new relationship is detected immediately
NOTIFY pgrst, 'reload schema';
