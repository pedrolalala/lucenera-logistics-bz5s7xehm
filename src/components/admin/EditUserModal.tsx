import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, Shield } from 'lucide-react'

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
}

export function EditUserModal({ isOpen, onClose, user }: EditUserModalProps) {
  const [nome, setNome] = useState('')
  const [role, setRole] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (user) {
      setNome(user.nome_completo || '')
      setRole(user.role || 'user')
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      // Atualiza a tabela user_roles
      const { error: rolesError } = await supabase
        .from('user_roles')
        .update({ nome_completo: nome, role })
        .eq('id', user.id)

      if (rolesError) throw rolesError

      // Sincroniza os dados com a tabela usuarios (caso exista relacionamento)
      if (user.user_id) {
        await supabase.from('usuarios').update({ nome: nome, role }).eq('id', user.user_id)
      }

      toast.success('Permissões e perfil atualizados com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      onClose()
    } catch (error: any) {
      console.error('Error updating user:', error)
      toast.error('Erro ao atualizar usuário: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Editar Permissões do Usuário
          </DialogTitle>
          <DialogDescription>
            Altere as informações de perfil e o nível de acesso do usuário no sistema.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label>Email do Usuário</Label>
            <Input value={user?.email || ''} disabled className="bg-muted text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <Label>Nome Completo</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do usuário"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-purple-700 font-semibold">Nível de Acesso (Role)</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="border-purple-200 bg-purple-50/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuário Padrão (Leitura e Escrita Básica)</SelectItem>
                <SelectItem value="entregador">Entregador (Acesso a Rotas)</SelectItem>
                <SelectItem value="admin">Administrador (Acesso Total)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {role === 'admin' &&
                'Atenção: Administradores têm controle total sobre o sistema e outros usuários.'}
              {role === 'entregador' &&
                'Entregadores são direcionados automaticamente para a tela de otimização de rotas.'}
              {role === 'user' && 'Usuários podem criar separações e finalizar entregas.'}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Shield className="w-4 h-4 mr-2" />
            )}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
