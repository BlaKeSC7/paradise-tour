import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <h3 className="inline-flex flex-col items-center text-xl font-bold leading-tight">
              <span>Take Me On</span>
              <span>Tours</span>
            </h3>
            <p className="text-sm opacity-90">
              Tu mejor opción para explorar el paraíso. Experiencias inolvidables garantizadas.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-accent transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/carrito" className="hover:text-accent transition-colors">
                  Carrito
                </Link>
              </li>
              <li>
                <Link to="/categorias" className="hover:text-accent transition-colors">
                  Categorías
                </Link>
              </li>
              <li>
                <Link to="/ofertas" className="hover:text-accent transition-colors">
                  Ofertas
                </Link>
              </li>
              <li>
                <a href="#tours" className="hover:text-accent transition-colors">
                  Tours
                </a>
              </li>
              <li>
                <Link to="/nosotros" className="hover:text-accent transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="hover:text-accent transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <a href="#reviews" className="hover:text-accent transition-colors">
                  Reseñas
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+52 123 456 7890</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@paradisetours.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Punta Cana, República Dominicana</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Síguenos</h3>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Take Me On Tours. Created By SH Computers SRL</p>
        </div>
      </div>
    </footer>
  );
};
