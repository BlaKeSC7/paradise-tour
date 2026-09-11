import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { Phone, Mail, MapPin, MessageCircle, Facebook, Instagram, Twitter } from "lucide-react";

const Contacto = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Contacto"
        description="Contactá a Take Me On Tours por WhatsApp, teléfono o email. Excursiones en Punta Cana, República Dominicana."
        path="/contacto"
      />

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Contacto
          </h1>
          <p className="text-lg text-muted-foreground">
            ¿Tenés preguntas sobre un tour o querés armar un plan a medida? Escribinos.
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <Phone className="h-6 w-6 mx-auto text-primary" />
                <p className="font-semibold">Teléfono</p>
                <a href="tel:+521234567890" className="text-sm text-muted-foreground hover:text-primary">
                  +52 123 456 7890
                </a>
              </div>
              <div className="space-y-2">
                <Mail className="h-6 w-6 mx-auto text-primary" />
                <p className="font-semibold">Email</p>
                <a
                  href="mailto:info@paradisetours.com"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  info@paradisetours.com
                </a>
              </div>
              <div className="space-y-2">
                <MapPin className="h-6 w-6 mx-auto text-primary" />
                <p className="font-semibold">Ubicación</p>
                <p className="text-sm text-muted-foreground">Punta Cana, República Dominicana</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            La forma más rápida de contactarnos es por WhatsApp — te respondemos directo.
          </p>
          <a
            href="https://wa.me/1234567890"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "hero", size: "lg" })}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Escribir por WhatsApp
          </a>

          <div className="flex justify-center gap-4 pt-6">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-6 w-6" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-6 w-6" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contacto;
