import { useParams, Link, useNavigate } from "react-router-dom";
import { useCombo } from "@/hooks/useCombos";
import { useTours } from "@/hooks/useTours";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { SITE_URL } from "@/lib/site-config";
import { Clock, Star, ArrowRight } from "lucide-react";

const ComboDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: combo, isLoading: comboLoading } = useCombo(id || "");
  const { data: allTours = [], isLoading: toursLoading } = useTours();

  if (comboLoading || toursLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Cargando combo...</p>
      </div>
    );
  }

  if (!combo) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Combo no encontrado</h1>
        <Button onClick={() => navigate("/ofertas")}>Ver ofertas</Button>
      </div>
    );
  }

  const includedTours = allTours.filter((tour) => combo.tourIds.includes(tour.id));
  const savings = combo.originalPrice - combo.discountedPrice;
  const comboImage = combo.image.startsWith("http") ? combo.image : `${SITE_URL}${combo.image}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: combo.title,
    description: combo.description,
    image: comboImage,
    offers: {
      "@type": "Offer",
      price: combo.discountedPrice,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/combo/${combo.id}`,
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={combo.title}
        description={combo.description}
        path={`/combo/${combo.id}`}
        image={combo.image}
        type="product"
        jsonLd={jsonLd}
      />
      <div className="relative h-[350px] md:h-[420px]">
        <img src={combo.image} alt={combo.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground text-base px-3 py-1">
          {combo.discount}% OFF
        </Badge>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-3 text-foreground">{combo.title}</h1>
              <p className="text-muted-foreground text-lg">{combo.description}</p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Este combo incluye</h2>
                {includedTours.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No pudimos cargar el detalle de los tours incluidos.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {includedTours.map((tour) => (
                      <Link
                        key={tour.id}
                        to={`/tour/${tour.id}`}
                        className="flex gap-4 p-3 rounded-lg border hover:border-primary transition-colors group"
                      >
                        <img
                          src={tour.image}
                          alt={tour.title}
                          className="w-24 h-24 object-cover rounded-md shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold group-hover:text-primary transition-colors">
                            {tour.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {tour.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                              {tour.rating}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-primary mt-1">
                            Desde ${tour.priceAdult}/adulto
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground self-center group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground pt-2 border-t">
                  Cada tour se reserva por separado con su propia fecha y cantidad de personas —
                  tocá un tour para elegir fecha y agregarlo al carrito.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Precio combo</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg text-muted-foreground line-through">
                      ${combo.originalPrice}
                    </span>
                    <span className="text-3xl font-bold text-primary">
                      ${combo.discountedPrice}
                    </span>
                  </div>
                  <p className="text-sm text-accent font-medium mt-1">
                    Ahorrás ${savings.toFixed(0)} reservando ambos tours
                  </p>
                </div>

                <a
                  href={`https://wa.me/1234567890?text=${encodeURIComponent(
                    `Hola, estoy interesado en el combo: ${combo.title}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className={buttonVariants({ variant: "hero", className: "w-full" })}>
                    Consultar por WhatsApp
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ComboDetail;
