import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Key, Trash2, Search, Shield, Truck, User } from 'lucide-react'
import { ResetPasswordModal } from '@/components/admin/ResetPasswordModal'
import { EditUserModal } from '@/components/admin/EditUserModal'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function AdminUsersPage() {
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false)
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [search, setSearch] = useState('')

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

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-purple-700">Gerenciamento de Usuários</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os acessos e permissões da equipe
          </p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 shadow-md">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Usuário
        </Button>
      </div>

      <Card className="border-t-4 border-t-purple-500 shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <Badge
            variant="secondary"
            className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-700 w-fit"
          >
            Total: {users?.length || 0}
          </Badge>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[300px]">Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Nível de Acesso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Carregando usuários...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers?.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                            {(u.nome_completo || u.email || '?')[0]}
                          </div>
                          <span className="truncate max-w-[200px]">
                            {u.nome_completo || 'Sem nome'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize ${getRoleColor(u.role || 'user')}`}
                        >
                          {getRoleIcon(u.role || 'user')}
                          {u.role || 'user'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => {
                              setSelectedUser(u)
                              setIsEditUserModalOpen(true)
                            }}
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            onClick={() => {
                              setSelectedUser(u)
                              setIsResetPasswordModalOpen(true)
                            }}
                            title="Redefinir Senha"
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Excluir"
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

      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        user={selectedUser}
      />

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
