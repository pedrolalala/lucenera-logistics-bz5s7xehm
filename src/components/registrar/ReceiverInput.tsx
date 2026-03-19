import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
export function ReceiverInput({ value, onChange }: any) {
  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
      <Label className="field-label mb-2 block">Recebido Por</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nome de quem recebeu"
        className="h-14"
      />
    </div>
  )
}
