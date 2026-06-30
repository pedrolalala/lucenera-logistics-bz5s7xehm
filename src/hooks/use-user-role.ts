import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

interface UserRole {
  id: string
  user_id: string | null
  email: string
  role: string | null
  funcao: 'admin' | 'operador' | 'entregador' | 'user' | null
  nome_completo: string
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
        .from('user_roles_separacao')
        .select('*')
        .eq('user_id', user.id)
        .eq('sistema', 'Separação e Entregas')
        .maybeSingle()

      if (error) {
        console.error('Error fetching user role:', error)
      }

      if (user.email === 'pedro@lucenera.com.br') {
        return {
          id: data?.id || 'admin-fallback',
          user_id: user.id,
          email: user.email,
          role: data?.role || 'admin',
          funcao: 'admin',
          nome_completo: data?.nome_completo || 'Pedro',
          created_at: data?.created_at || new Date().toISOString(),
          updated_at: data?.updated_at || new Date().toISOString(),
        } as UserRole
      }

      return (
        (data as UserRole) ||
        ({
          id: 'guest',
          user_id: user.id,
          email: user.email || '',
          role: 'user',
          funcao: 'user',
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
    isAdmin: userRole?.funcao === 'admin' || userRole?.role === 'admin',
    isUser: userRole?.funcao === 'user' || userRole?.role === 'user',
    isEntregador: userRole?.funcao === 'entregador' || userRole?.role === 'entregador',
    isOperador: userRole?.funcao === 'operador' || userRole?.role === 'operador',
    isLoading,
    error,
    userName: userRole?.nome_completo || user?.email?.split('@')[0] || 'Usuário',
  }
}
