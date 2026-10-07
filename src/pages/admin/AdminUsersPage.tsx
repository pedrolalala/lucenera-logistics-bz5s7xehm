import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Search, Shield, Truck, User, Mail, Calendar } from 'lucide-react'
import { EditUserModal } from '@/components/admin/EditUserModal'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function AdminUsersPage() {
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('user_roles').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Acesso de usuário removido com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (err: any) => {
      toast.error('Erro ao remover usuário: ' + err.message)
    },
  })

  const filteredUsers = users?.filter(
    (u) =>
      (u.nome_completo || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()),
  )

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3 h-3 mr-1" />
      case 'entregador':
        return <Truck className="w-3 h-3 mr-1" />
      default:
        return <User className="w-3 h-3 mr-1" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'entregador':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const handleAddUser = () => {
    toast.info(
      'Para adicionar novos usuários, eles devem se registrar na tela de login primeiro. Depois você poderá alterar o nível de acesso deles aqui.',
      {
        duration: 6000,
      },
    )
  }

  const handleDelete = (id: string, name: string) => {
    if (
      confirm(
        `Tem certeza que deseja excluir o acesso de ${name}? Esta ação não afeta o login base no banco de dados, apenas remove o perfil do painel.`,
      )
    ) {
      deleteUserMutation.mutate(id)
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-purple-700">Gestão de Equipe</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Controle os perfis e permissões dos membros da plataforma
          </p>
        </div>
        <Button
          onClick={handleAddUser}
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-md h-10 px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Usuário
        </Button>
      </div>

      <Card className="border-t-4 border-t-purple-500 shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email do usuário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background border-border h-10"
            />
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className="px-4 py-1.5 text-sm font-medium bg-purple-100 text-purple-700 whitespace-nowrap"
            >
              Total de Cadastros: {users?.length || 0}
            </Badge>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[300px] font-semibold text-foreground">Usuário</TableHead>
                  <TableHead className="font-semibold text-foreground">Email</TableHead>
                  <TableHead className="font-semibold text-foreground">Nível de Acesso</TableHead>
                  <TableHead className="font-semibold text-foreground">Data de Cadastro</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
                        <p>Carregando equipe...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="w-12 h-12 text-muted-foreground/30 mb-3" />
                        <p>Nenhum usuário encontrado com "{search}".</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers?.map((u) => (
                    <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0 uppercase border border-purple-200 shadow-sm">
                            {(u.nome_completo || u.email || '?')[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="truncate max-w-[200px] font-semibold text-foreground">
                              {u.nome_completo || 'Usuário Sem Nome'}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              ID: {u.id?.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4 shrink-0" />
                          <span className="truncate">{u.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize px-2.5 py-1 ${getRoleColor(u.role || 'user')}`}
                        >
                          {getRoleIcon(u.role || 'user')}
                          {u.role === 'admin'
                            ? 'Administrador'
                            : u.role === 'entregador'
                              ? 'Entregador'
                              : 'Usuário Padrão'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Calendar className="w-4 h-4 shrink-0" />
                          {u.created_at
                            ? format(parseISO(u.created_at), 'dd/MM/yyyy', { locale: ptBR })
                            : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-purple-200 text-purple-700 hover:bg-purple-50"
                            onClick={() => {
                              setSelectedUser(u)
                              setIsEditUserModalOpen(true)
                            }}
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1.5" />
                            Editar Acesso
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20"
                            title="Remover Acesso"
                            onClick={() =>
                              handleDelete(u.id, u.nome_completo || u.email || 'Usuário')
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {isEditUserModalOpen && selectedUser && (
        <EditUserModal
          isOpen={isEditUserModalOpen}
          onClose={() => setIsEditUserModalOpen(false)}
          user={selectedUser}
        />
      )}
    </AdminLayout>
  )
}
