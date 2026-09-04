import { useDashboardAuth } from "@/contexts/DashboardAuthContext";
import TourManager from "@/components/Dashboard/TourManager";
import ReviewsManager from "@/components/Dashboard/ReviewsManager";
import UsersManager from "@/components/Dashboard/UsersManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, User, TrendingUp, DollarSign, Users, Package, Star, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTours } from "@/hooks/useTours";
import { useBookings } from "@/hooks/useBookings";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Seo } from "@/components/Seo";

const Dashboard = () => {
  const { user, isAuthenticated, isLoading, logout, refreshUser } = useDashboardAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: tours = [] } = useTours();
  const { data: bookings = [] } = useBookings();

  // Configurar refetch automático cada 30 segundos para mantener datos actualizados
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["tours"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-users"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      refreshUser(); // Actualizar datos del usuario actual
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [queryClient, refreshUser]);


  const handleLogout = () => {
    logout();
    navigate("/dashboard/login");
  };

  const totalEarnings = bookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((sum, b) => sum + b.total_price, 0);

  const pendingBookings = bookings.filter((b) => b.status === "pending").length;

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Dashboard de Administración" description="Panel de administración de Paradise Tours." path="/dashboard" noIndex />
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Dashboard de Administración</h1>
              <p className="text-sm text-muted-foreground">
                Bienvenido, {user?.name} ({user?.referral_code})
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Referidos</p>
                <p className="text-lg font-semibold">{user?.total_referrals || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Ganancias</p>
                <p className="text-lg font-semibold">${user?.total_earnings?.toFixed(2) || "0.00"}</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tours</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tours.length}</div>
              <p className="text-xs text-muted-foreground">
                {tours.filter((t) => t.featured).length} destacados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservas Totales</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
              <p className="text-xs text-muted-foreground">
                {pendingBookings} pendientes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Reservas confirmadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mi Código</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{user?.referral_code}</div>
              <p className="text-xs text-muted-foreground">
                {user?.role || "affiliate"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="tours" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tours" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Tours
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Reseñas
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Usuarios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tours" className="mt-6">
            <TourManager />
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <ReviewsManager />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UsersManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;

