import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import luceneraVertical from '@/assets/logos/lucenera-vertical.png'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'

const resetSchema = z
  .object({
    password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({})
  const [shake, setShake] = useState(false)

  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (
        !session &&
        !window.location.hash.includes('access_token') &&
        !window.location.hash.includes('type=recovery')
      ) {
        toast({
          title: 'Link inválido ou expirado',
          description: 'Por favor, solicite um novo link de redefinição de senha.',
          variant: 'destructive',
        })
        navigate('/forgot-password', { replace: true })
      }
    }

    checkSession()
  }, [navigate, toast])

  const validateForm = () => {
    const result = resetSchema.safeParse({ password, confirmPassword })
    if (!result.success) {
      const fieldErrors: { password?: string; confirmPassword?: string } = {}
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'password') fieldErrors.password = err.message
        if (err.path[0] === 'confirmPassword') fieldErrors.confirmPassword = err.message
      })
      setErrors(fieldErrors)
      return false
    }
    setErrors({})
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setShake(true)
      setTimeout(() => setShake(false), 400)
      return
    }

    setIsLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        setShake(true)
        setTimeout(() => setShake(false), 400)
        toast({
          title: 'Erro ao redefinir senha',
          description: updateError.message,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Senha redefinida!',
        description: 'Sua senha foi alterada com sucesso. Você já pode fazer login.',
        className: 'bg-success text-success-foreground border-none',
      })

      await supabase.auth.signOut()
      navigate('/login', { replace: true })
    } catch (err) {
      toast({
        title: 'Erro inesperado',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-primary-light px-4">
      <div
        className={cn(
          'w-full max-w-[420px] bg-card rounded-2xl shadow-lg p-8 sm:p-12 transition-all',
          shake && 'animate-shake',
        )}
      >
        <div className="text-center mb-10">
          <img
            src={luceneraVertical}
            alt="Lucenera"
            className="w-[140px] sm:w-[180px] h-auto mx-auto mb-3"
          />
          <p className="text-muted-foreground text-sm">Sistema de Entregas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-center">Criar Nova Senha</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Sua nova senha deve ter no mínimo 8 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-xs uppercase font-semibold text-muted-foreground tracking-wide"
            >
              Nova Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite a nova senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={validateForm}
                disabled={isLoading}
                className={cn(
                  'h-14 pl-12 pr-12 text-base border-2 rounded-xl',
                  errors.password ? 'border-destructive' : 'border-border',
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-xs uppercase font-semibold text-muted-foreground tracking-wide"
            >
              Confirmar Nova Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={validateForm}
                disabled={isLoading}
                className={cn(
                  'h-14 pl-12 pr-12 text-base border-2 rounded-xl',
                  errors.confirmPassword ? 'border-destructive' : 'border-border',
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 text-base font-bold rounded-xl bg-primary hover:bg-primary-dark shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Redefinindo...
              </>
            ) : (
              'Redefinir Senha'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
