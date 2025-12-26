import { useProductos } from '../contexts/ProductosContext';

export function SupabaseBadge() {
  const { usandoSupabase, cargando } = useProductos();

  if (cargando) return null;

  return (
    <div className="fixed top-4 left-4 z-50">
      <div
        className={`
          px-3 py-1.5 rounded-full text-xs
          flex items-center gap-2
          shadow-lg border
          ${usandoSupabase 
            ? 'bg-green-50 text-green-800 border-green-200' 
            : 'bg-yellow-50 text-yellow-800 border-yellow-200'
          }
        `}
      >
        <div className={`w-2 h-2 rounded-full ${usandoSupabase ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
        <span>
          {usandoSupabase ? '☁️ Supabase' : '💾 Local'}
        </span>
      </div>
    </div>
  );
}
