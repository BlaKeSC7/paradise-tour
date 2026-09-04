import { Link } from "react-router-dom";
import { useTours } from "@/hooks/useTours";
import { CATEGORY_META } from "@/lib/category-meta";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { ArrowRight } from "lucide-react";

const Categorias = () => {
  const { data: tours = [], isLoading } = useTours();

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Categorías de Tours en Punta Cana"
        description="Explorá excursiones en Punta Cana por categoría: acuático, crucero, cultural y aventura."
        path="/categorias"
      />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Categorías
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Elegí el tipo de experiencia que buscás en Punta Cana
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Cargando categorías...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {CATEGORY_META.map(({ name, slug, icon: Icon, description }) => {
              const categoryTours = tours.filter((t) => t.category === name);
              const representativeImage = categoryTours[0]?.image;

              return (
                <Link
                  key={slug}
                  to={`/?categoria=${slug}`}
                  className="group relative overflow-hidden rounded-2xl aspect-[4/5] block hover:shadow-[var(--shadow-card)] transition-shadow"
                >
                  {representativeImage ? (
                    <img
                      src={representativeImage}
                      alt={name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="relative h-full flex flex-col justify-end p-5 text-white">
                    <Icon className="h-8 w-8 mb-3" />
                    <h2 className="text-xl font-bold leading-tight">{name}</h2>
                    <p className="text-sm text-white/80 mb-2">{description}</p>
                    <p className="text-sm font-medium flex items-center gap-1 text-white/90">
                      {categoryTours.length} {categoryTours.length === 1 ? "tour" : "tours"}
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Categorias;
