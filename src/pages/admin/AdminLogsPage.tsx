import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminLogsPage() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['admin-logs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('separacoes')
        .select('id, cliente, created_at')
        .order('created_at', { ascending: false })
        .limit(20)
      return data || []
    },
  })

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-purple-700">Logs de Auditoria</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Carregando...</p>
          ) : (
            logs?.map((log, i) => (
              <div key={i} className="p-3 border-b">
                <p>{log.cliente}</p>
                <p className="text-xs text-muted-foreground">{log.created_at}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
