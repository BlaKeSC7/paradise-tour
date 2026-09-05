import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTour } from "@/hooks/useTours";
import { useTourExtras } from "@/hooks/useTourExtras";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import {
  Clock,
  Star,
  Users,
  CalendarIcon,
  Minus,
  Plus,
  Check,
  Tag,
  User,
  Baby,
  ChevronDown,
  Backpack,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { ReactNode } from "react";
import { Seo } from "@/components/Seo";
import { SITE_URL } from "@/lib/site-config";

const capitalizeFirst = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const TourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, discountPercentage, referralUser } = useCart();
  const { data: tour, isLoading } = useTour(id || "");
  const { data: extras = [] } = useTourExtras(id || "");

  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [travelersOpen, setTravelersOpen] = useState(false);
  const [selectedExtraIds, setSelectedExtraIds] = useState<Set<string>>(new Set());

  const toggleExtra = (extraId: string) => {
    setSelectedExtraIds((prev) => {
      const next = new Set(prev);
      if (next.has(extraId)) {
        next.delete(extraId);
      } else {
        next.add(extraId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Cargando tour...</p>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Tour no encontrado</h1>
        <Button onClick={() => navigate("/")}>Volver al inicio</Button>
      </div>
    );
  }

  const selectedExtras = extras.filter((extra) => selectedExtraIds.has(extra.id));
  const extrasTotal = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);

  const handleAddToCart = () => {
    if (!selectedDate) {
      toast.error("Por favor selecciona una fecha");
      return;
    }

    if (adults === 0 && children === 0) {
      toast.error("Debes agregar al menos un adulto o niño");
      return;
    }

    addItem({
      tour,
      adults,
      children,
      infants,
      date: format(selectedDate, "yyyy-MM-dd"),
      extras: selectedExtras.map(({ id, name, price }) => ({ id, name, price })),
    });

    toast.success("Tour agregado al carrito");
    navigate("/carrito");
  };

  const subtotal =
    (tour.priceAdult || 0) * adults +
    (tour.priceChild || 0) * children +
    (tour.priceInfant || 0) * infants;

  const discountAmount = discountPercentage > 0
    ? (subtotal * discountPercentage) / 100
    : 0;

  const totalPrice = subtotal - discountAmount + extrasTotal;

  const totalTravelers = adults + children + infants;
  const travelersSummary = () => {
    const parts: string[] = [];
    if (adults > 0) parts.push(`${adults} adulto${adults > 1 ? "s" : ""}`);
    if (children > 0) parts.push(`${children} niño${children > 1 ? "s" : ""}`);
    if (infants > 0) parts.push(`${infants} infante${infants > 1 ? "s" : ""}`);
    return parts.length > 0 ? parts.join(", ") : "Selecciona viajeros";
  };

  const TravelerRow = ({
    icon,
    title,
    subtitle,
    priceLabel,
    value,
    onChange,
    min = 0,
    max = 20,
  }: {
    icon: ReactNode;
    title: string;
    subtitle: string;
    priceLabel: string;
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
  }) => (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="font-medium leading-tight">{title}</p>
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          <p className="text-xs font-semibold text-primary">{priceLabel}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <span className="w-5 text-center font-semibold tabular-nums">{value}</span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: tour.title,
      description: tour.description,
      image: tour.image.startsWith("http") ? tour.image : `${SITE_URL}${tour.image}`,
      touristType: tour.category,
      offers: {
        "@type": "Offer",
        price: tour.priceAdult,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/tour/${tour.id}`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Categorías", item: `${SITE_URL}/categorias` },
        { "@type": "ListItem", position: 3, name: tour.title, item: `${SITE_URL}/tour/${tour.id}` },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={tour.title}
        description={tour.description}
        path={`/tour/${tour.id}`}
        image={tour.image}
        type="product"
        jsonLd={jsonLd}
      />
      {/* Hero Image */}
      <div className="relative h-[400px] md:h-[500px]">
        <img
          src={tour.image}
          alt={tour.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <Badge className="absolute top-4 right-4 bg-background/90 text-foreground">
          {tour.category}
        </Badge>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4 text-foreground">{tour.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-5 w-5" />
                  <span>{tour.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-accent text-accent" />
                  <span className="font-semibold">{tour.rating}</span>
                  <span>({tour.reviews} reseñas)</span>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{tour.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Incluye</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {tour.includes.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Reserva tu Tour</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Date Selection */}
                <div className="space-y-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Fecha
                  </span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={`w-full justify-between font-normal h-12 px-4 ${
                          !selectedDate ? "text-muted-foreground" : ""
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 shrink-0" />
                          {selectedDate
                            ? capitalizeFirst(format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es }))
                            : "Selecciona una fecha"}
                        </span>
                        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
                        locale={es}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Passenger Selector */}
                <div className="space-y-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Viajeros
                  </span>
                  <Popover open={travelersOpen} onOpenChange={setTravelersOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between font-normal h-12 px-4"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <Users className="h-4 w-4 shrink-0" />
                          <span className="truncate">{travelersSummary()}</span>
                        </span>
                        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[320px] p-4 divide-y" align="start">
                      <TravelerRow
                        icon={<User className="h-5 w-5" />}
                        title="Adultos"
                        subtitle="13 años o más"
                        priceLabel={`$${(tour.priceAdult || 0).toFixed(2)} c/u`}
                        value={adults}
                        onChange={setAdults}
                        min={0}
                      />
                      <TravelerRow
                        icon={<Users className="h-5 w-5" />}
                        title="Niños"
                        subtitle="2 a 12 años"
                        priceLabel={`$${(tour.priceChild || 0).toFixed(2)} c/u`}
                        value={children}
                        onChange={setChildren}
                        min={0}
                      />
                      <TravelerRow
                        icon={<Baby className="h-5 w-5" />}
                        title="Infantes"
                        subtitle="Menores de 2 años"
                        priceLabel={
                          (tour.priceInfant || 0) === 0
                            ? "Gratis"
                            : `$${(tour.priceInfant || 0).toFixed(2)} c/u`
                        }
                        value={infants}
                        onChange={setInfants}
                        min={0}
                      />
                      <div className="pt-3">
                        <Button
                          type="button"
                          className="w-full"
                          onClick={() => setTravelersOpen(false)}
                        >
                          Listo
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">
                    {totalTravelers} {totalTravelers === 1 ? "viajero" : "viajeros"} en total
                  </p>
                </div>

                {/* Accesorios y recomendaciones */}
                {extras.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <span className="text-sm font-medium flex items-center gap-2 pt-2">
                      <Backpack className="h-4 w-4" />
                      Accesorios y recomendaciones
                    </span>
                    <div className="space-y-1">
                      {extras.map((extra) => {
                        const checked = selectedExtraIds.has(extra.id);
                        return (
                          <div
                            key={extra.id}
                            role="checkbox"
                            aria-checked={checked}
                            tabIndex={0}
                            onClick={() => toggleExtra(extra.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                toggleExtra(extra.id);
                              }
                            }}
                            className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                              checked ? "border-primary bg-primary/5" : "hover:bg-muted"
                            }`}
                          >
                            <div
                              aria-hidden="true"
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary ${
                                checked ? "bg-primary text-primary-foreground" : ""
                              }`}
                            >
                              {checked && <Check className="h-3.5 w-3.5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium leading-tight">{extra.name}</p>
                              {extra.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">{extra.description}</p>
                              )}
                            </div>
                            <span className="text-sm font-semibold text-primary shrink-0">
                              +${extra.price.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Price Summary */}
                <div className="pt-4 border-t">
                  {extrasTotal > 0 && (
                    <div className="flex justify-between items-center mb-2 text-sm text-muted-foreground">
                      <span>Accesorios ({selectedExtras.length})</span>
                      <span>+${extrasTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-3xl font-bold text-primary">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    onClick={handleAddToCart}
                    className={buttonVariants({ variant: "hero", className: "w-full" })}
                  >
                    Agregar al Carrito
                  </Button>
                  <a
                    href={`https://wa.me/1234567890?text=Hola, estoy interesado en el tour: ${tour.title}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2"
                  >
                    <Button className={buttonVariants({ variant: "outline", className: "w-full" })}>
                      Consultar por WhatsApp
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetail;
