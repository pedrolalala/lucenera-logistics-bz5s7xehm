import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
export function ObservationsField({ value, onChange }: any) {
  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
      <Label className="field-label mb-2 block">Observações (Opcional)</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Detalhes adicionais..."
        rows={3}
      />
    </div>
  )
}
