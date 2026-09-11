import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardAuth } from "@/contexts/DashboardAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { toast } from "sonner";
import { LogIn, Lock } from "lucide-react";
import { Seo } from "@/components/Seo";

const DashboardLogin = () => {
  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useDashboardAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!referralCode.trim()) {
      toast.error("Por favor ingresa un código de referido");
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(referralCode.toUpperCase());
      
      if (success) {
        toast.success("¡Acceso concedido!");
        navigate("/dashboard");
      } else {
        toast.error("Código de referido inválido o inactivo");
      }
    } catch (error) {
      toast.error("Error al iniciar sesión");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Seo title="Acceso Administrador" description="Panel de administración de Take Me On Tours." path="/dashboard/login" noIndex />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Dashboard de Administración</CardTitle>
          <CardDescription>
            Ingresa tu código de referido para acceder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="referralCode">Código de Referido</Label>
              <Input
                id="referralCode"
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="CDERF"
                className="uppercase"
                disabled={isLoading}
                autoFocus
              />
            </div>
            
            <Button
              type="submit"
              className={buttonVariants({ variant: "hero", className: "w-full" })}
              disabled={isLoading}
            >
              <LogIn className="h-4 w-4 mr-2" />
              {isLoading ? "Verificando..." : "Acceder"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardLogin;

