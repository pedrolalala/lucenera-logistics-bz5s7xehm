import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

interface UserRole {
  id: string
  user_id: string
  email: string
  role: 'admin' | 'user' | 'entregador'
  nome_completo: string | null
  created_at: string | null
  updated_at: string | null
}

export function useUserRole() {
  const { user } = useAuth()

  const {
    data: userRole,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null

      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Error fetching user role:', error)
      }

      // Hardcoded fallback para garantir que o dono sempre tenha acesso ao admin
      // mesmo que as tabelas do banco estejam dessincronizadas
      if (user.email === 'pedro@lucenera.com.br') {
        return {
          id: data?.id || 'admin-fallback',
          user_id: user.id,
          email: user.email,
          role: 'admin',
          nome_completo: data?.nome_completo || 'Pedro',
          created_at: data?.created_at || new Date().toISOString(),
          updated_at: data?.updated_at || new Date().toISOString(),
        } as UserRole
      }

      // Retorno seguro caso o usuário não tenha role explícita definida no banco ainda
      return (
        (data as UserRole) ||
        ({
          id: 'guest',
          user_id: user.id,
          email: user.email || '',
          role: 'user',
          nome_completo: user.email?.split('@')[0] || 'Usuário',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as UserRole)
      )
    },
    enabled: !!user?.id,
  })

  return {
    userRole,
    isAdmin: userRole?.role === 'admin',
    isUser: userRole?.role === 'user',
    isEntregador: userRole?.role === 'entregador',
    isLoading,
    error,
    userName: userRole?.nome_completo || user?.email?.split('@')[0] || 'Usuário',
  }
}
