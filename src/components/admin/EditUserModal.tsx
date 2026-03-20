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
import { Loader2 } from 'lucide-react'

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
      const { error } = await supabase
        .from('user_roles')
        .update({ nome_completo: nome, role })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Usuário atualizado com sucesso!')
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
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Altere as informações de perfil e nível de acesso do usuário.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Email</Label>
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
            <Label>Nível de Acesso (Role)</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuário Padrão</SelectItem>
                <SelectItem value="entregador">Entregador</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
