import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { bookingsService } from "@/lib/supabase/bookings";
import { useTours } from "@/hooks/useTours";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CountryCodeSelect } from "@/components/CountryCodeSelect";
import { countryCodes, DEFAULT_COUNTRY_ISO2 } from "@/lib/country-codes";
import { Trash2, ShoppingBag, Calendar, Tag, Sparkles, Clock, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Cart = () => {
  const {
    items,
    removeItem,
    totalPrice,
    clearCart,
    discountPercentage,
    discountAmount,
    finalPrice,
    referralCode,
    referralUser
  } = useCart();
  const { data: allTours } = useTours();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countryIso2, setCountryIso2] = useState(DEFAULT_COUNTRY_ISO2);
  const [bookingData, setBookingData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: ""
  });

  const cartTourIds = new Set(items.map((item) => item.tour.id));
  const recommendedTours = (allTours ?? [])
    .filter((tour) => !cartTourIds.has(tour.id))
    .slice(0, 3);

  const fullPhoneNumber = () => {
    const dialCode = countryCodes.find((c) => c.iso2 === countryIso2)?.dialCode ?? "";
    return `${dialCode}${bookingData.phone.replace(/\D/g, "")}`;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (bookingData.phone.replace(/\D/g, "").length < 7) {
      toast.error("Por favor ingresa un número de teléfono válido");
      return;
    }

    const customerPhone = fullPhoneNumber();

    setIsSubmitting(true);
    try {
      // Crear reservas para cada item del carrito
      const bookingPromises = items.map((item) => {
        const itemTotal =
          item.tour.priceAdult * item.adults +
          item.tour.priceChild * item.children +
          item.tour.priceInfant * item.infants;

        return bookingsService.create({
          tour_id: item.tour.id,
          customer_name: bookingData.name,
          customer_email: bookingData.email,
          customer_phone: customerPhone,
          booking_date: item.date,
          adults: item.adults,
          children: item.children,
          infants: item.infants,
          total_price: itemTotal,
          notes: bookingData.notes || null,
          referral_code: referralCode || null,
        });
      });

      await Promise.all(bookingPromises);

      // También enviar por WhatsApp
      const message = items
        .map(
          (item) =>
            `*${item.tour.title}*\nFecha: ${item.date}\nAdultos: ${item.adults}, Niños: ${item.children}, Infantes: ${item.infants}\nSubtotal: $${
              item.tour.priceAdult * item.adults +
              item.tour.priceChild * item.children +
              item.tour.priceInfant * item.infants
            }`
        )
        .join("\n\n");

      const discountText = discountPercentage > 0 
        ? `\n*Descuento aplicado: ${discountPercentage}% (-$${discountAmount.toFixed(2)})*` 
        : '';
      
      const fullMessage = `*Nueva Reserva*\n\nNombre: ${bookingData.name}\nEmail: ${bookingData.email}\nTeléfono: ${customerPhone}\n\n*Tours:*\n${message}\n\n*Subtotal: $${totalPrice.toFixed(2)}*${discountText}\n*Total: $${finalPrice.toFixed(2)}*\n\nNotas: ${bookingData.notes}`;
      const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(fullMessage)}`;
      
      window.open(whatsappUrl, "_blank");
      toast.success("Reserva creada correctamente");
      clearCart();
      setShowBookingForm(false);
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Error al crear la reserva. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold">Tu carrito está vacío</h2>
          <p className="text-muted-foreground">¡Explora nuestros tours y comienza tu aventura!</p>
          <Link to="/">
            <Button className={buttonVariants({ variant: "default" })}>
              Explorar Tours
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Carrito de Compras</h1>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? "tour" : "tours"} en tu carrito
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const itemTotal =
                item.tour.priceAdult * item.adults +
                item.tour.priceChild * item.children +
                item.tour.priceInfant * item.infants;

              return (
                <Card key={item.tour.id}>
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row gap-4 p-4">
                      <img
                        src={item.tour.image}
                        alt={item.tour.title}
                        className="w-full sm:w-32 h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-lg">{item.tour.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{item.date}</span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {item.adults > 0 && (
                            <p>
                              {item.adults} Adulto{item.adults > 1 ? "s" : ""} × ${item.tour.priceAdult}
                            </p>
                          )}
                          {item.children > 0 && (
                            <p>
                              {item.children} Niño{item.children > 1 ? "s" : ""} × ${item.tour.priceChild}
                            </p>
                          )}
                          {item.infants > 0 && (
                            <p>
                              {item.infants} Infante{item.infants > 1 ? "s" : ""} × $
                              {item.tour.priceInfant}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-between gap-2">
                        <p className="text-2xl font-bold text-primary">${itemTotal}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            removeItem(item.tour.id);
                            toast.success("Tour eliminado del carrito");
                          }}
                        >
                          <Trash2 className="h-5 w-5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Recommended tours */}
            {recommendedTours.length > 0 && (
              <div className="pt-6">
                <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">También te puede interesar</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {recommendedTours.map((tour) => (
                    <Link key={tour.id} to={`/tour/${tour.id}`}>
                      <Card className="group overflow-hidden hover:shadow-[var(--shadow-card)] transition-all">
                        <div className="relative h-24 overflow-hidden">
                          <img
                            src={tour.image}
                            alt={tour.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <CardContent className="p-3 space-y-1">
                          <p className="text-sm font-medium line-clamp-1">{tour.title}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {tour.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-accent text-accent" />
                              {tour.rating}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-primary">
                            ${tour.priceAdult}
                            <span className="text-xs font-normal text-muted-foreground">/adulto</span>
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumen de Compra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((item) => {
                    const itemTotal =
                      item.tour.priceAdult * item.adults +
                      item.tour.priceChild * item.children +
                      item.tour.priceInfant * item.infants;
                    return (
                      <div key={item.tour.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.tour.title}</span>
                        <span className="font-medium">${itemTotal}</span>
                      </div>
                    );
                  })}
                </div>
                {referralCode && referralUser && discountPercentage > 0 && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200 my-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">
                        Descuento aplicado ({referralUser.name})
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Descuento ({discountPercentage}%):</span>
                      <span className="font-semibold text-green-600">-${discountAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold">Subtotal</span>
                    <span className="text-xl font-bold">${totalPrice.toFixed(2)}</span>
                  </div>
                  {discountPercentage > 0 ? (
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-3xl font-bold text-primary">${finalPrice.toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-3xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                {!showBookingForm ? (
                  <>
                    <Button
                      onClick={() => setShowBookingForm(true)}
                      className={buttonVariants({ variant: "hero", className: "w-full" })}
                    >
                      Reservar Ahora
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        clearCart();
                        toast.success("Carrito vaciado");
                      }}
                      className="w-full"
                    >
                      Vaciar Carrito
                    </Button>
                  </>
                ) : (
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle className="text-lg">Datos de Reserva</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleBookingSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nombre Completo *</Label>
                          <Input
                            id="name"
                            value={bookingData.name}
                            onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                            placeholder="Juan Pérez"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={bookingData.email}
                            onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                            placeholder="juan@email.com"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Teléfono *</Label>
                          <div className="flex gap-2">
                            <CountryCodeSelect value={countryIso2} onChange={setCountryIso2} />
                            <Input
                              id="phone"
                              type="tel"
                              inputMode="numeric"
                              value={bookingData.phone}
                              onChange={(e) =>
                                setBookingData({
                                  ...bookingData,
                                  phone: e.target.value.replace(/[^\d\s-]/g, ""),
                                })
                              }
                              placeholder="849 710 8953"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="notes">Notas Adicionales</Label>
                          <Input
                            id="notes"
                            value={bookingData.notes}
                            onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                            placeholder="Alergias, necesidades especiales, etc."
                          />
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                          <Button
                            type="submit"
                            className={buttonVariants({ variant: "hero", className: "w-full" })}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "Procesando..." : "Confirmar Reserva"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowBookingForm(false)}
                            className="w-full"
                          >
                            Volver
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
