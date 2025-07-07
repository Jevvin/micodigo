"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/app/utils/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, Info, X, Circle, Phone, Instagram, Facebook, Globe, Truck, MapPin, Clock } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";


export default function RestaurantPage() {
  const params = useParams();
  const restaurantSlug = params.restaurantSlug as string;

  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusText, setStatusText] = useState<string>("");
  const [showInfoModal, setShowInfoModal] = useState(false);

  const restaurantId = restaurantSlug;

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!restaurantId) {
        setRestaurant(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data: restaurantData, error } = await supabase
        .from("restaurants")
        .select("*, restaurant_hours(*)")
        .eq("slug", restaurantSlug)
        .single();

      if (error || !restaurantData) {
        setRestaurant(null);
        setLoading(false);
        return;
      }

      setRestaurant(restaurantData);
      setLoading(false);
    };

    fetchRestaurant();
  }, [restaurantId]);

  useEffect(() => {
    if (!restaurant || !restaurant.restaurant_hours) return;

    const updateStatus = () => {
      const now = new Date();
      const day = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
      const todayHours = restaurant.restaurant_hours.find(
        (h: any) => h.day_of_week === day
      );

      if (!todayHours || !todayHours.is_open || !todayHours.open_time || !todayHours.close_time) {
        setStatusText("Cerrado");
        return;
      }

      const [openH, openM] = todayHours.open_time.split(":").map(Number);
      const [closeH, closeM] = todayHours.close_time.split(":").map(Number);

      const openDate = new Date(now);
      openDate.setHours(openH, openM, 0, 0);

      const closeDate = new Date(now);
      closeDate.setHours(closeH, closeM, 0, 0);

      const minsToOpen = Math.floor((openDate.getTime() - now.getTime()) / 60000);
      const minsToClose = Math.floor((closeDate.getTime() - now.getTime()) / 60000);

      if (minsToOpen > 0 && minsToOpen <= 30) {
        setStatusText(`Abre en ${minsToOpen} min`);
      } else if (now >= openDate && now <= closeDate) {
        if (minsToClose > 0 && minsToClose <= 30) {
          setStatusText(`Cierra en ${minsToClose} min`);
        } else {
          setStatusText("Abierto");
        }
      } else {
        setStatusText("Cerrado");
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000);
    return () => clearInterval(interval);
  }, [restaurant]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-lg">Cargando restaurante...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-red-500">Restaurante no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* PORTADA */}
<div className="relative">
  <img
    src={restaurant.cover_image_url || "/placeholder.svg"}
    alt={`Portada de ${restaurant.name}`}
    className="w-full h-64 md:h-80 object-cover rounded-b-2xl"
  />

  <div className="absolute inset-0 bg-black bg-opacity-20 rounded-b-2xl" />

  <div className="absolute top-4 right-4">
    <Badge
      className={`${
        statusText.includes("Abierto") || statusText.includes("Abre")
          ? "bg-green-600"
          : statusText.includes("Cierra")
          ? "bg-yellow-500"
          : "bg-red-500"
      } text-white px-3 py-2 rounded-full text-sm font-medium`}
    >
      {statusText}
    </Badge>
  </div>
</div>

      {/* INFO HEADER */}
<div className="-mt-6 mx-4 mb-6 relative z-10">
  <Card className="p-6">
    <div className="flex items-start space-x-4">

      {/* IMAGEN DE PERFIL */}
      {restaurant.logo_image_url ? (
        <img
          src={restaurant.logo_image_url}
          alt={restaurant.name}
          className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-lg object-cover"
        />
      ) : (
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
          Logo
        </div>
      )}

      {/* CENTRO: NOMBRE, DESCRIPCIÓN, ICONOS */}
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{restaurant.name}</p>
          <Button
            variant="ghost"
            size="icon"
            className="p-1"
            onClick={() => setShowInfoModal(true)}
          >
            <Info className="h-5 w-5 text-gray-600" />
          </Button>
        </div>

        <p className="text-gray-600 text-base md:text-lg mb-3">
          {restaurant.description}
        </p>

        <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
            4.8
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            25-35 min
          </div>
          <div className="flex items-center">
            <Truck className="h-4 w-4 mr-1" />
            Envío $30
          </div>
        </div>
      </div>

      {/* BOTÓN CARRITO */}
      <Button
  variant="default"
  className="bg-black text-white hover:bg-gray-900 px-6 py-3 rounded-lg text-sm font-normal"
>
  <ShoppingCart className="h-5 w-5 mr-2" />
  Carrito (0)
</Button>
    </div>
  </Card>
</div>

      {/* BREADCRUMBS */}
  <Breadcrumbs />

  {/* MODAL DE INFORMACIÓN */}
{showInfoModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Información</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowInfoModal(false)}
          className="h-6 w-6 p-0"
        >
          <X className="h-5 w-5 text-gray-600" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* ESTADO */}
<div className="flex items-center space-x-2">
  <div
    className={`w-3 h-3 rounded-full ${
      statusText.includes("Abierto") || statusText.includes("Abre")
        ? "bg-green-500"
        : statusText.includes("Cierra")
        ? "bg-yellow-500"
        : "bg-red-500"
    }`}
  />
  <span className="font-medium">{statusText}</span>
  <Info className="h-4 w-4 text-gray-400" />
</div>

        {/* NOMBRE Y LOGO */}
<div className="flex items-center space-x-3">
  <img
    src={restaurant.logo_image_url || "/placeholder.svg"}
    alt="Logo"
    className="w-12 h-12 rounded-lg object-cover border"
  />
  <p className="text-lg font-semibold">{restaurant.name}</p>
</div>

        {/* REDES SOCIALES */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="p-2">
            <Phone className="h-5 w-5 text-green-600" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <Instagram className="h-5 w-5 text-pink-600" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <Facebook className="h-5 w-5 text-blue-600" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <Globe className="h-5 w-5 text-gray-600" />
          </Button>
        </div>

        {/* TIPOS DE SERVICIO */}
        <div>
          <p className="text-base font-medium mb-3">Tipos de servicio</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Truck className="h-5 w-5 text-blue-600" />
                <span className="font-medium">A domicilio</span>
              </div>
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">✓</span>
              </div>
            </div>
            <div className="ml-8 space-y-2 text-sm text-gray-600">
              <p>
                Tiempo de entrega a domicilio: <span className="font-medium">25–35 min</span>
              </p>
              <p>
                Entrega a domicilio a partir de <span className="font-medium">MXN 100.00</span>
              </p>
              <div>
                <p className="font-medium text-gray-800 mb-2">Cobertura de entrega</p>
                <div className="bg-gray-50 p-3 rounded text-xs leading-relaxed">
                  Centro, Roma Norte, Condesa, Polanco y zonas aledañas dentro del radio de 5 km.
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-green-600" />
                <span className="font-medium">Para llevar</span>
              </div>
              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* HORARIOS */}
        <div>
          <p className="flex items-center font-medium mb-3">
            <Clock className="h-4 w-4 mr-2" />
            Horarios de atención
          </p>
          <div className="space-y-2 text-sm">
            {restaurant.restaurant_hours?.map((hours: any) => {
              // Traducción de días
              const dayTranslations: { [key: string]: string } = {
                monday: "Lunes",
                tuesday: "Martes",
                wednesday: "Miércoles",
                thursday: "Jueves",
                friday: "Viernes",
                saturday: "Sábado",
                sunday: "Domingo",
              };

              const dayName = dayTranslations[hours.day_of_week] || hours.day_of_week;

              // Formato 12 horas
              const formatTime = (time: string) => {
                if (!time) return "";
                const [hour, minute] = time.split(":").map(Number);
                const date = new Date();
                date.setHours(hour, minute);
                return date.toLocaleTimeString("es-MX", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true
                });
              };

              return (
                <div key={hours.id} className="flex justify-between">
                  <span className="capitalize">{dayName}</span>
                  <span className={hours.is_open ? "text-gray-600" : "text-red-500 font-medium"}>
                    {hours.is_open ? `${formatTime(hours.open_time)} - ${formatTime(hours.close_time)}` : "Cerrado"}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* UBICACIÓN */}
        <div className="border-t pt-4">
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
            <div>
              <p className="font-medium">Ubicación</p>
              <p className="text-sm text-gray-600">
                {restaurant.address || "Dirección no disponible"}
              </p>
            </div>
          </div>
        </div>
        
      </CardContent>
    </Card>
  </div>
)}
{/* MENU DEMO CON TABS Y PRODUCTOS */}
<div className="max-w-7xl mx-auto px-4 pb-8">
  <div className="space-y-6">
    {/* Tabs List */}
    <div className="grid w-full grid-cols-3 gap-2">
      <button className="px-4 py-2 bg-black text-white rounded-md">Platillos</button>
      <button className="px-4 py-2 bg-gray-200 rounded-md">Postres</button>
      <button className="px-4 py-2 bg-gray-200 rounded-md">Bebidas</button>
    </div>

    {/* Platillos Section */}
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Platillos Principales</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
          <img src="/placeholder.svg" alt="Tacos al Pastor" className="w-full h-48 object-cover" />
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Tacos al Pastor</h3>
              <div className="flex items-center">
                <span className="text-yellow-400">★</span>
                <span className="text-sm ml-1">4.8</span>
              </div>
            </div>
            <p className="text-gray-600 mb-3">Deliciosos tacos con carne al pastor, piña, cebolla y cilantro</p>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-green-600">$120</span>
              <button className="text-sm px-3 py-1 bg-black text-white rounded-md">Agregar</button>
            </div>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
          <img src="/placeholder.svg" alt="Quesadillas de Flor" className="w-full h-48 object-cover" />
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Quesadillas de Flor de Calabaza</h3>
              <div className="flex items-center">
                <span className="text-yellow-400">★</span>
                <span className="text-sm ml-1">4.6</span>
              </div>
            </div>
            <p className="text-gray-600 mb-3">Quesadillas artesanales con flor de calabaza y queso oaxaca</p>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-green-600">$80</span>
              <button className="text-sm px-3 py-1 bg-black text-white rounded-md">Agregar</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Postres Section */}
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Postres</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
          <img src="/placeholder.svg" alt="Flan Napolitano" className="w-full h-48 object-cover" />
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Flan Napolitano</h3>
              <div className="flex items-center">
                <span className="text-yellow-400">★</span>
                <span className="text-sm ml-1">4.9</span>
              </div>
            </div>
            <p className="text-gray-600 mb-3">Flan casero con caramelo natural</p>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-green-600">$45</span>
              <button className="text-sm px-3 py-1 bg-black text-white rounded-md">Agregar</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Bebidas Section */}
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Bebidas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
          <img src="/placeholder.svg" alt="Agua de Horchata" className="w-full h-48 object-cover" />
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Agua de Horchata</h3>
              <div className="flex items-center">
                <span className="text-yellow-400">★</span>
                <span className="text-sm ml-1">4.7</span>
              </div>
            </div>
            <p className="text-gray-600 mb-3">Refrescante agua de horchata natural</p>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-green-600">$35</span>
              <button className="text-sm px-3 py-1 bg-black text-white rounded-md">Agregar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

</div>
);
}
