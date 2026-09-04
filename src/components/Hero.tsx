import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Star, Wallet, MessageCircle } from "lucide-react";
import { useVerifiedReviews } from "@/hooks/useReviews";
import heroImage from "@/assets/hero-beach.jpg";
import catamaranImage from "@/assets/tour-catamaran.jpg";
import snorkelingImage from "@/assets/tour-snorkeling.jpg";

const backgroundImages = [heroImage, catamaranImage, snorkelingImage];

interface HeroProps {
  categories: string[];
  onSearch: (params: { keyword: string; category: string }) => void;
}

export const Hero = ({ categories, onSearch }: HeroProps) => {
  const [activeImage, setActiveImage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("Todos");
  const { data: verifiedReviews = [] } = useVerifiedReviews();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const reviewCount = verifiedReviews.length;
  const avgRating =
    reviewCount > 0
      ? verifiedReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ keyword: keyword.trim(), category });
    document.getElementById("tours")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[640px] md:min-h-[720px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        {backgroundImages.map((src, index) => (
          <img
            key={src}
            src={src}
            alt="Excursiones en Punta Cana"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === activeImage ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-background" />
      </div>

      <div className="container mx-auto px-4 z-10 text-center text-white py-20">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in text-balance">
          Vive el Caribe sin líos ni sorpresas
        </h1>
        <p className="text-lg md:text-2xl mb-10 max-w-2xl mx-auto text-white/90">
          Excursiones en Punta Cana con guías locales, pickup incluido y reserva
          sin pagar por adelantado.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-3xl bg-white/95 backdrop-blur rounded-2xl p-3 md:p-4 shadow-2xl flex flex-col md:flex-row gap-3 text-left"
        >
          <div className="flex-1">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="¿Qué quieres hacer? Ej: snorkel, catamarán..."
              className="h-12 border-0 shadow-none text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div className="md:w-56">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-12 border-0 md:border-l md:rounded-none text-foreground">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todas las categorías</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className={buttonVariants({ variant: "coral", size: "xl", className: "md:w-auto" })}>
            <Search className="mr-2 h-5 w-5" />
            Buscar
          </Button>
        </form>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm md:text-base text-white/90">
          {reviewCount > 0 && (
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-accent text-accent" />
              <span>
                <strong className="text-white">{avgRating.toFixed(1)}</strong> · {reviewCount}{" "}
                {reviewCount === 1 ? "reseña verificada" : "reseñas verificadas"}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            <span>Reserva sin pagar por adelantado</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <span>Atención directa por WhatsApp</span>
          </div>
        </div>
      </div>
    </section>
  );
};
