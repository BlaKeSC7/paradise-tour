import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { CategoryShowcase } from "@/components/CategoryShowcase";
import { TourCard } from "@/components/TourCard";
import { ComboCard } from "@/components/ComboCard";
import { Reviews } from "@/components/Reviews";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { useTours } from "@/hooks/useTours";
import { useCombos } from "@/hooks/useCombos";
import { categories } from "@/lib/tours-data";
import { getCategoryBySlug } from "@/lib/category-meta";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site-config";
import { CalendarCheck, BadgePercent, ShieldCheck } from "lucide-react";

const Index = () => {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Deep link desde /categorias, ej. /?categoria=acuatico
  useEffect(() => {
    const slug = searchParams.get("categoria");
    if (!slug) return;
    const match = getCategoryBySlug(slug);
    if (match) {
      setSelectedCategory(match.name);
      setTimeout(() => {
        document.getElementById("tours")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
    // Solo se lee al llegar a la página, no se re-sincroniza en cada cambio de filtro.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Obtener tours desde Supabase
  const { data: allTours = [], isLoading: toursLoading } = useTours();
  const { data: combos = [], isLoading: combosLoading } = useCombos();

  const filteredTours = useMemo(() => {
    let result = allTours;
    if (selectedCategory !== "Todos") {
      result = result.filter((tour) => tour.category === selectedCategory);
    }
    const keyword = searchKeyword.trim().toLowerCase();
    if (keyword) {
      result = result.filter(
        (tour) =>
          tour.title.toLowerCase().includes(keyword) ||
          tour.description.toLowerCase().includes(keyword) ||
          tour.category.toLowerCase().includes(keyword)
      );
    }
    return result;
  }, [selectedCategory, searchKeyword, allTours]);

  const handleHeroSearch = ({ keyword, category }: { keyword: string; category: string }) => {
    setSearchKeyword(keyword);
    setSelectedCategory(category);
  };

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Excursiones y Tours en Punta Cana"
        description={SITE_DESCRIPTION}
        path="/"
        jsonLd={jsonLd}
      />
      <Hero categories={categories.filter((c) => c !== "Todos")} onSearch={handleHeroSearch} />

      <CategoryShowcase
        tours={allTours}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <section id="tours" className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Tours Destacados
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explora nuestras mejores experiencias cuidadosamente seleccionadas para ti
          </p>
        </div>

        {(searchKeyword || selectedCategory !== "Todos") && (
          <p className="text-center text-sm text-muted-foreground mb-6">
            Mostrando {filteredTours.length}{" "}
            {filteredTours.length === 1 ? "resultado" : "resultados"}
            {selectedCategory !== "Todos" && <> en <strong>{selectedCategory}</strong></>}
            {searchKeyword && <> para "<strong>{searchKeyword}</strong>"</>}
            {" · "}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => {
                setSelectedCategory("Todos");
                setSearchKeyword("");
              }}
            >
              limpiar filtros
            </button>
          </p>
        )}

        {toursLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Cargando tours...</p>
          </div>
        ) : filteredTours.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No encontramos tours con esos filtros. Probá con otra búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </section>

      {/* Combos Section */}
      {combos.length > 0 && (
        <section className="container mx-auto px-4 py-16">
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
      )}

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
