import { useState } from "react";
import { useTours } from "@/hooks/useTours";
import { toursService } from "@/lib/supabase/tours";
import { Tour } from "@/types/tour";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Image as ImageIcon, Save, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const TourManager = () => {
  const { data: tours = [], isLoading } = useTours();
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: "",
    duration: "",
    priceAdult: 0,
    priceChild: 0,
    priceInfant: 0,
    featured: false,
    includes: "",
    rating: 0,
    reviews: 0,
  });

  const handleEdit = (tour: Tour) => {
    setEditingTour(tour);
    setFormData({
      title: tour.title,
      description: tour.description,
      category: tour.category,
      image: tour.image,
      duration: tour.duration,
      priceAdult: tour.priceAdult,
      priceChild: tour.priceChild,
      priceInfant: tour.priceInfant,
      featured: tour.featured,
      includes: tour.includes.join(", "),
      rating: tour.rating,
      reviews: tour.reviews,
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingTour(null);
    setFormData({
      title: "",
      description: "",
      category: "",
      image: "",
      duration: "",
      priceAdult: 0,
      priceChild: 0,
      priceInfant: 0,
      featured: false,
      includes: "",
      rating: 0,
      reviews: 0,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const includesArray = formData.includes
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      const tourData = {
        ...formData,
        includes: includesArray,
      };

      if (editingTour) {
        await toursService.update(editingTour.id, tourData);
        toast.success("Tour actualizado correctamente");
      } else {
        // Generar ID único para nuevo tour
        const newId = Date.now().toString();
        await toursService.create({ ...tourData, id: newId });
        toast.success("Tour creado correctamente");
      }

      // Invalidar todas las queries relacionadas para actualizar el dashboard
      await queryClient.invalidateQueries({ queryKey: ["tours"] });
      await queryClient.refetchQueries({ queryKey: ["tours"] });
      setIsDialogOpen(false);
      setEditingTour(null);
    } catch (error) {
      toast.error("Error al guardar el tour");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este tour?")) {
      return;
    }

    setIsDeleting(id);
    try {
      await toursService.delete(id);
      toast.success("Tour eliminado correctamente");
      await queryClient.invalidateQueries({ queryKey: ["tours"] });
      await queryClient.refetchQueries({ queryKey: ["tours"] });
    } catch (error) {
      toast.error("Error al eliminar el tour");
      console.error(error);
    } finally {
      setIsDeleting(null);
    }
  };

  const toggleFeatured = async (tour: Tour) => {
    try {
      await toursService.update(tour.id, { featured: !tour.featured });
      toast.success(`Tour ${!tour.featured ? "destacado" : "removido de destacados"}`);
      await queryClient.invalidateQueries({ queryKey: ["tours"] });
      await queryClient.refetchQueries({ queryKey: ["tours"] });
    } catch (error) {
      toast.error("Error al actualizar el tour");
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando tours...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Gestión de Tours</h2>
          <p className="text-muted-foreground">Administra tus tours, precios y contenido</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate} className={buttonVariants({ variant: "hero" })}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Tour
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTour ? "Editar Tour" : "Nuevo Tour"}</DialogTitle>
              <DialogDescription>
                {editingTour ? "Modifica la información del tour" : "Completa la información para crear un nuevo tour"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Snorkel en Arrecife de Coral"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción detallada del tour"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ej: Acuático"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duración *</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="Ej: 4 horas"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">URL de Imagen *</Label>
                <div className="flex gap-2">
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://... (URL pública de la imagen)"
                  />
                  {formData.image && (
                    <img src={formData.image} alt="Preview" className="w-20 h-20 object-cover rounded" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priceAdult">Precio Adulto *</Label>
                  <Input
                    id="priceAdult"
                    type="number"
                    value={formData.priceAdult}
                    onChange={(e) => setFormData({ ...formData, priceAdult: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceChild">Precio Niño</Label>
                  <Input
                    id="priceChild"
                    type="number"
                    value={formData.priceChild}
                    onChange={(e) => setFormData({ ...formData, priceChild: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceInfant">Precio Infante</Label>
                  <Input
                    id="priceInfant"
                    type="number"
                    value={formData.priceInfant}
                    onChange={(e) => setFormData({ ...formData, priceInfant: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="includes">Incluye (separado por comas)</Label>
                <Input
                  id="includes"
                  value={formData.includes}
                  onChange={(e) => setFormData({ ...formData, includes: e.target.value })}
                  placeholder="Equipo de snorkel, Guía certificado, Refrigerios"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rating">Calificación</Label>
                  <Input
                    id="rating"
                    type="number"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reviews">Número de Reseñas</Label>
                  <Input
                    id="reviews"
                    type="number"
                    value={formData.reviews}
                    onChange={(e) => setFormData({ ...formData, reviews: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                  <Label htmlFor="featured">Destacado</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className={buttonVariants({ variant: "hero", className: "flex-1" })}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tours.map((tour) => (
          <Card key={tour.id} className="overflow-hidden">
            <div className="relative h-48">
              <img src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 flex gap-2">
                {tour.featured && <Badge className="bg-accent">Destacado</Badge>}
                <Badge>{tour.category}</Badge>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="line-clamp-2">{tour.title}</CardTitle>
              <CardDescription className="line-clamp-2">{tour.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Adulto:</span>
                <span className="font-semibold">${tour.priceAdult}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Niño:</span>
                <span className="font-semibold">${tour.priceChild}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={tour.featured}
                    onCheckedChange={() => toggleFeatured(tour)}
                  />
                  <span className="text-sm">Destacado</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(tour)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(tour.id)}
                    disabled={isDeleting === tour.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TourManager;

