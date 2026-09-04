import { Tour } from "@/types/tour";
import snorkelingImg from "@/assets/tour-snorkeling.jpg";
import catamaranImg from "@/assets/tour-catamaran.jpg";
import ruinsImg from "@/assets/tour-ruins.jpg";
import adventureImg from "@/assets/tour-adventure.jpg";

export const tours: Tour[] = [
  {
    id: "1",
    title: "Snorkel en Arrecife de Coral",
    description: "Explora el vibrante mundo submarino con peces tropicales, tortugas y arrecifes de coral espectaculares. Tour guiado con todo el equipo incluido.",
    category: "Acuático",
    image: snorkelingImg,
    duration: "4 horas",
    priceAdult: 89,
    priceChild: 59,
    priceInfant: 0,
    featured: true,
    includes: ["Equipo de snorkel", "Guía certificado", "Refrigerios", "Transporte"],
    rating: 4.9,
    reviews: 234,
  },
  {
    id: "2",
    title: "Paseo en Catamarán al Atardecer",
    description: "Disfruta de un relajante paseo en catamarán mientras el sol se pone sobre el océano. Incluye bebidas y música en vivo.",
    category: "Crucero",
    image: catamaranImg,
    duration: "3 horas",
    priceAdult: 129,
    priceChild: 89,
    priceInfant: 0,
    featured: true,
    includes: ["Bebidas ilimitadas", "Música en vivo", "Cena ligera", "Transporte"],
    rating: 5.0,
    reviews: 189,
  },
  {
    id: "3",
    title: "Tour Ruinas Mayas",
    description: "Viaja en el tiempo visitando antiguas ruinas mayas. Aprende sobre la fascinante historia y cultura con guías expertos.",
    category: "Cultural",
    image: ruinsImg,
    duration: "6 horas",
    priceAdult: 99,
    priceChild: 69,
    priceInfant: 0,
    featured: true,
    includes: ["Guía arqueólogo", "Entradas", "Almuerzo", "Transporte"],
    rating: 4.8,
    reviews: 312,
  },
  {
    id: "4",
    title: "Aventura en la Selva - Tirolesa",
    description: "Adrenalina pura volando entre los árboles en nuestras tirolesas de última generación. Incluye rappel y puentes colgantes.",
    category: "Aventura",
    image: adventureImg,
    duration: "5 horas",
    priceAdult: 119,
    priceChild: 89,
    priceInfant: 0,
    featured: true,
    includes: ["Equipo de seguridad", "Instructor", "Refrigerios", "Transporte", "Fotos digitales"],
    rating: 4.9,
    reviews: 267,
  },
];

export const categories = [
  "Todos",
  "Acuático",
  "Crucero",
  "Cultural",
  "Aventura",
];
