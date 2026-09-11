import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { useVerifiedReviews } from "@/hooks/useReviews";
import { MapPin, Wallet, MessageCircle, Star } from "lucide-react";
import heroImage from "@/assets/hero-beach.jpg";

const Nosotros = () => {
  const { data: verifiedReviews = [] } = useVerifiedReviews();
  const reviewCount = verifiedReviews.length;
  const avgRating =
    reviewCount > 0
      ? verifiedReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Nosotros"
        description="Conocé a Take Me On Tours: operador local de excursiones en Punta Cana, República Dominicana."
        path="/nosotros"
      />

      <div className="relative h-[280px] md:h-[340px]">
        <img src={heroImage} alt="Punta Cana" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-black/30" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white">Nosotros</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="space-y-4 text-lg text-muted-foreground">
          <p>
            Take Me On Tours es un operador local de excursiones en{" "}
            <strong className="text-foreground">Punta Cana, República Dominicana</strong>. Armamos
            un catálogo de tours pensado para que reservar tu próxima aventura sea simple: elegís
            el tour, la fecha y la cantidad de personas, y nosotros coordinamos el resto.
          </p>
          <p>
            Trabajamos experiencias acuáticas, cruceros en catamarán, tours culturales y aventuras
            con guías locales, todas con pickup incluido desde tu hotel.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-10">
          <Card>
            <CardContent className="p-5 text-center space-y-2">
              <MapPin className="h-6 w-6 mx-auto text-primary" />
              <p className="font-semibold">Punta Cana, RD</p>
              <p className="text-xs text-muted-foreground">Operamos localmente en la zona</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center space-y-2">
              <Wallet className="h-6 w-6 mx-auto text-primary" />
              <p className="font-semibold">Sin pago adelantado</p>
              <p className="text-xs text-muted-foreground">Reservás y coordinamos por WhatsApp</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center space-y-2">
              <MessageCircle className="h-6 w-6 mx-auto text-primary" />
              <p className="font-semibold">Atención directa</p>
              <p className="text-xs text-muted-foreground">Hablás con nosotros, no con un bot</p>
            </CardContent>
          </Card>
        </div>

        {reviewCount > 0 && (
          <div className="flex items-center justify-center gap-2 mb-10 text-muted-foreground">
            <Star className="h-5 w-5 fill-accent text-accent" />
            <span>
              <strong className="text-foreground">{avgRating.toFixed(1)}</strong> · {reviewCount}{" "}
              {reviewCount === 1 ? "reseña verificada" : "reseñas verificadas"} de viajeros reales
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/#tours" className={buttonVariants({ variant: "hero" })}>
            Ver tours
          </Link>
          <Link to="/contacto" className={buttonVariants({ variant: "outline" })}>
            Contactanos
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Nosotros;
