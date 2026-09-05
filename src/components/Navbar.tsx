import { Link } from "react-router-dom";
import { ShoppingCart, Waves, Menu, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";

const MENU_LINKS = [
  { to: "/", label: "Inicio" },
  { to: "/#tours", label: "Tours" },
  { to: "/categorias", label: "Categorías" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/contacto", label: "Contacto" },
];

export const Navbar = () => {
  const { totalItems } = useCart();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menú">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="rounded-full bg-gradient-to-br from-primary to-secondary p-1.5">
                    <Waves className="h-4 w-4 text-white" />
                  </div>
                  Paradise Tours
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 mt-8">
                {MENU_LINKS.map((item) => (
                  <SheetClose asChild key={item.to}>
                    <Link
                      to={item.to}
                      className="rounded-md px-3 py-2.5 text-base text-foreground hover:bg-muted hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center gap-2 group">
            <div className="rounded-full bg-gradient-to-br from-primary to-secondary p-2">
              <Waves className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Paradise Tours
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/carrito" className="relative">
            <Button variant="ghost" size="icon" className="relative" aria-label="Ver carrito">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground text-xs">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>
          <Link to="/ofertas" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Tag className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Ofertas</span>
          </Link>
          <a
            href="https://wa.me/1234567890"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "hero", size: "sm" })}
          >
            WhatsApp
          </a>
        </div>
      </div>
    </nav>
  );
};
