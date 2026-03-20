DO $$ 
DECLARE
  v_user_id uuid;
BEGIN
  -- Insert or get user from auth.users (idempotent)
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'pedro@lucenera.com.br';
  
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'pedro@lucenera.com.br',
      crypt('securepassword123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Pedro"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;

  -- Ensure exists in user_roles as admin
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE email = 'pedro@lucenera.com.br') THEN
    INSERT INTO public.user_roles (id, user_id, email, nome_completo, role)
    VALUES (gen_random_uuid()::text, v_user_id::text, 'pedro@lucenera.com.br', 'Pedro', 'admin');
  ELSE
    UPDATE public.user_roles SET role = 'admin', user_id = v_user_id::text WHERE email = 'pedro@lucenera.com.br';
  END IF;

  -- Ensure exists in usuarios as admin (to satisfy possible dependencies and sync)
  IF NOT EXISTS (SELECT 1 FROM public.usuarios WHERE email = 'pedro@lucenera.com.br') THEN
    INSERT INTO public.usuarios (id, email, nome, role)
    VALUES (v_user_id, 'pedro@lucenera.com.br', 'Pedro', 'admin');
  ELSE
    UPDATE public.usuarios SET role = 'admin' WHERE email = 'pedro@lucenera.com.br';
  END IF;
END $$;
