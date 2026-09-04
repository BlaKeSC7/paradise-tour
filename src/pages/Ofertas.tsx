import { useCombos } from "@/hooks/useCombos";
import { ComboCard } from "@/components/ComboCard";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { Tag } from "lucide-react";

const Ofertas = () => {
  const { data: combos = [], isLoading } = useCombos();

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Ofertas y Combos de Tours"
        description="Paquetes combinados de excursiones en Punta Cana con descuento sobre el precio individual de cada tour."
        path="/ofertas"
      />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Ofertas
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Paquetes combinados con descuento sobre el precio de cada tour por separado
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Cargando ofertas...</p>
          </div>
        ) : combos.length === 0 ? (
          <div className="text-center py-16 max-w-md mx-auto space-y-3">
            <Tag className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              Por ahora no tenemos combos activos. Volvé pronto o escribinos por WhatsApp
              para armar un paquete a medida.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {combos.map((combo) => (
              <ComboCard key={combo.id} combo={combo} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Ofertas;
