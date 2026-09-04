import { Tour } from "@/types/tour";
import { CATEGORY_META } from "@/lib/category-meta";

interface CategoryShowcaseProps {
  tours: Tour[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryShowcase = ({ tours, selectedCategory, onSelectCategory }: CategoryShowcaseProps) => {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          ¿Qué quieres hacer?
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Elegí por tipo de experiencia y te mostramos las excursiones disponibles
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {CATEGORY_META.map(({ name, icon: Icon, description }) => {
          const categoryTours = tours.filter((t) => t.category === name);
          const isSelected = selectedCategory === name;
          const representativeImage = categoryTours[0]?.image;

          return (
            <button
              key={name}
              type="button"
              onClick={() => onSelectCategory(isSelected ? "Todos" : name)}
              className={`group relative overflow-hidden rounded-2xl aspect-[4/5] text-left transition-all duration-300 ${
                isSelected ? "ring-4 ring-primary" : "hover:shadow-[var(--shadow-card)]"
              }`}
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

              <div className="relative h-full flex flex-col justify-end p-4 text-white">
                <Icon className="h-7 w-7 mb-2" />
                <h3 className="text-lg font-bold leading-tight">{name}</h3>
                <p className="text-xs text-white/80 mb-1">{description}</p>
                <p className="text-xs font-medium text-white/70">
                  {categoryTours.length} {categoryTours.length === 1 ? "tour" : "tours"}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {selectedCategory !== "Todos" && (
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => onSelectCategory("Todos")}
            className="text-sm text-primary hover:underline font-medium"
          >
            Quitar filtro y ver todas las categorías
          </button>
        </div>
      )}
    </section>
  );
};
