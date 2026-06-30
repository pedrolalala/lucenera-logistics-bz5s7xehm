import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

interface UserRole {
  id: string
  user_id: string
  email: string
  role: 'admin' | 'operador' | 'entregador' | 'user'
  nome_completo: string | null
  funcao: string | null
  sistema: string | null
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
    queryKey: ['user-role-separacao', user?.id],
    queryFn: async () => {
      if (!user?.id) return null

      const { data, error: queryError } = await supabase
        .from('user_roles_separacao')
        .select('*')
        .eq('user_id', user.id)
        .eq('sistema', 'Separação e Entregas')
        .maybeSingle()

      if (queryError) {
        console.error('Error fetching user role from user_roles_separacao:', queryError)
      }

      if (user.email === 'pedro@lucenera.com.br') {
        return {
          id: data?.id || 'admin-fallback',
          user_id: user.id,
          email: user.email,
          role: 'admin',
          nome_completo: data?.nome_completo || 'Pedro',
          funcao: data?.funcao || null,
          sistema: data?.sistema || 'Separação e Entregas',
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
          nome_completo: user.email?.split('@')[0] || 'Usuário',
          funcao: null,
          sistema: 'Separação e Entregas',
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
    isOperador: userRole?.role === 'operador',
    isEntregador: userRole?.role === 'entregador',
    isUser: userRole?.role === 'user',
    isLoading,
    error,
    userName: userRole?.nome_completo || user?.email?.split('@')[0] || 'Usuário',
  }
}
