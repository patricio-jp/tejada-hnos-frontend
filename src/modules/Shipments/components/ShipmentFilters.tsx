import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ShipmentFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function ShipmentFilters({ searchTerm, onSearchChange }: ShipmentFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Despacho de Mercadería</h1>
        <p className="text-muted-foreground mt-1">
          Selecciona un pedido aprobado para iniciar la preparación (Picking).
        </p>
      </div>
      
      <div className="relative w-full md:w-72">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cliente o pedido..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}