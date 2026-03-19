import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email === 'admin@lucenera.com' && password === 'admin') {
      navigate('/')
    } else {
      setError(true)
      setTimeout(() => setError(false), 500)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card
        className={cn('w-full max-w-md shadow-xl', error && 'animate-shake border-destructive')}
      >
        <CardHeader className="space-y-3 text-center pb-8">
          <h1 className="font-serif text-4xl font-bold text-primary tracking-tight">Lucenera</h1>
          <CardDescription className="text-base">Gestão Logística Operacional</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="field-label">
                Email de Acesso
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="operador@lucenera.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="field-label mb-0">
                  Senha
                </Label>
                <a
                  href="#"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Esqueceu a senha?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
            >
              Entrar no Sistema
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Dica: admin@lucenera.com / admin
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
