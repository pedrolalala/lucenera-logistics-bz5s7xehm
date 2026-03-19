import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export function CodeInput({ value, onChange, onValidate, validationState, errorMessage }: any) {
  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
      <Label className="field-label mb-2 block">Código da Obra / ID Entrega</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ex: LUC-0001"
          className="h-14 font-mono text-lg"
        />
        <Button onClick={() => onValidate(true)} className="h-14 px-6">
          Buscar
        </Button>
      </div>
      {errorMessage && <p className="text-destructive text-sm mt-2">{errorMessage}</p>}
    </div>
  )
}
