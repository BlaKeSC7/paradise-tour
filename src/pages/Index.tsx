import { useState, useMemo } from "react";
import { Hero } from "@/components/Hero";
import { CategoryFilter } from "@/components/CategoryFilter";
import { TourCard } from "@/components/TourCard";
import { ComboCard } from "@/components/ComboCard";
import { Reviews } from "@/components/Reviews";
import { Footer } from "@/components/Footer";
import { useTours, useToursByCategory } from "@/hooks/useTours";
import { useCombos } from "@/hooks/useCombos";
import { CalendarCheck, BadgePercent, ShieldCheck } from "lucide-react";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  
  // Obtener tours desde Supabase
  const { data: allTours = [], isLoading: toursLoading } = useTours();
  const { data: categoryTours = [], isLoading: categoryLoading } = useToursByCategory(selectedCategory);
  const { data: combos = [], isLoading: combosLoading } = useCombos();

  const filteredTours = useMemo(() => {
    if (selectedCategory === "Todos") {
      return allTours;
    }
    return categoryTours.length > 0 ? categoryTours : allTours.filter((tour) => tour.category === selectedCategory);
  }, [selectedCategory, allTours, categoryTours]);

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      
      {/* Combos Section */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Combos Especiales
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ahorra más con nuestros paquetes combinados
          </p>
        </div>

        {combosLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Cargando combos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {combos.map((combo) => (
              <ComboCard key={combo.id} combo={combo} />
            ))}
          </div>
        )}
      </section>

      <section id="tours" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Tours Destacados
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explora nuestras mejores experiencias cuidadosamente seleccionadas para ti
          </p>
        </div>

        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {toursLoading || categoryLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Cargando tours...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </section>

      <Reviews />

      {/* Features Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                <CalendarCheck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Reserva Fácil</h3>
              <p className="text-muted-foreground">
                Proceso simple y rápido en pocos clics
              </p>
            </div>
            <div className="space-y-2">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                <BadgePercent className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Mejor Precio</h3>
              <p className="text-muted-foreground">
                Precios especiales y descuentos exclusivos
              </p>
            </div>
            <div className="space-y-2">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Experiencia Garantizada</h3>
              <p className="text-muted-foreground">
                Tours con las mejores calificaciones
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
