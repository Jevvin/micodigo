"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/utils/supabaseClient";
import { uploadImageToStorage } from "@/app/utils/storageUpload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertTriangle, Save, Upload, Clock, Store, Phone, MapPin } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function NegocioPage() {
  // 🟣 STATE & HOOKS ================================================
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [slugStatus, setSlugStatus] = useState<null | "available" | "taken" | "checking">(null);
  const router = useRouter();
  const { toast } = useToast();

  const dayTranslations: Record<string, string> = {
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo",
  };

  // 🟣 FETCH DATA ON LOAD ============================================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        setError("Usuario no autenticado.");
        setLoading(false);
        router.push("/restaurant");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("restaurants")
        .select("*, restaurant_hours(*)")
        .eq("user_id", user.id)
        .single();

      if (fetchError || !data) {
        setError("No se encontró el restaurante.");
      } else {
        let hours = data.restaurant_hours;
        if (!hours || hours.length === 0) {
          hours = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => ({
            id: `new-${day}`,
            day_of_week: day,
            is_open: false,
            open_time: "",
            close_time: "",
          }));
        }
        setRestaurant({ ...data, restaurant_hours: hours });
      }
      setLoading(false);
    };

    fetchData();
  }, [router]);

  // 🟣 HANDLE IMAGE UPLOAD ===========================================
  const handleUploadImage = async (file: File, type: "cover" | "profile") => {
    if (!restaurant || !restaurant.id) return;
    const result = await uploadImageToStorage(restaurant.id.toString(), type, file);
    if (result.success && result.url) {
      setRestaurant({ ...restaurant, [type === "cover" ? "cover_image_url" : "logo_image_url"]: result.url });
      toast({
        title: "Imagen subida",
        description: "La imagen se subió correctamente. No olvides guardar.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error al subir",
        description: result.error || "Ocurrió un error desconocido.",
      });
    }
  };

  // 🟣 HANDLE SLUG CHECK =============================================
  const checkSlugAvailability = async (newSlug: string) => {
    if (!newSlug || !newSlug.trim()) {
      setSlugStatus(null);
      return;
    }
    setSlugStatus("checking");
    const { data } = await supabase
      .from("restaurants")
      .select("id")
      .eq("slug", newSlug.trim())
      .neq("id", restaurant.id);

    setSlugStatus(data && data.length > 0 ? "taken" : "available");
  };

  // 🟣 HANDLE SAVE ===================================================
  const handleSave = async () => {
    if (!restaurant) return;
    setSaving(true);
    setError(null);
    try {
      const updates = {
        name: restaurant.name,
        description: restaurant.description,
        address: restaurant.address,
        phone: restaurant.phone,
        email: restaurant.email,
        cover_image_url: restaurant.cover_image_url,
        logo_image_url: restaurant.logo_image_url,
        delivery_fee: restaurant.delivery_fee,
        min_order_amount: restaurant.min_order_amount,
        delivery_radius: restaurant.delivery_radius,
        slug: restaurant.slug.trim(),
      };

      const { error } = await supabase
        .from("restaurants")
        .update(updates)
        .eq("id", restaurant.id);

      if (error) throw error;

      toast({ title: "Cambios guardados", description: "La configuración se actualizó correctamente." });
      router.refresh();
    } catch (err: any) {
      console.error("❌ Error en handleSave:", err);
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: err?.message || "Error desconocido.",
      });
      setError(err?.message || "Error desconocido.");
    } finally {
      setSaving(false);
    }
  };

  // 🟣 LOADING STATE =================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando configuración...</span>
      </div>
    );
  }

  // 🟣 ERROR STATE ===================================================
  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => router.refresh()}>Reintentar</Button>
      </div>
    );
  }

  // 🟣 MAIN RETURN ===================================================
  if (!restaurant) {
    return <p className="text-center py-8">No se encontró el restaurante.</p>;
  }

  return (
    <div className="space-y-6">
      {/* 🟢 PAGE HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center">
            Configuración del Restaurante
          </h2>
          <p className="text-gray-600">Administra la información y configuración de tu negocio</p>
        </div>
      </div>

      {/* 🟢 TABS & FORMS */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="contact">Contacto</TabsTrigger>
          <TabsTrigger value="hours">Horarios</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>

        {/* GENERAL TAB */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="h-5 w-5 mr-2" /> Información General
              </CardTitle>
              <CardDescription>Datos básicos de tu restaurante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* SLUG */}
              <div>
                <Label>URL Personalizada (slug)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="mi-restaurante-unico"
                    value={restaurant.slug || ""}
                    onChange={(e) => {
                      const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
                      setRestaurant({ ...restaurant, slug: newSlug });
                      checkSlugAvailability(newSlug);
                    }}
                  />
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      const url = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/${restaurant.slug}`;
                      window.open(url, "_blank");
                    }}
                    disabled={!restaurant.slug}
                  >
                    Ver Menú
                  </Button>
                </div>
                <p className="text-sm text-gray-500">Tus clientes podrán verla y ordenarte aquí.</p>
              </div>

              {/* Nombre del restaurante y descripción */}
              <div className="space-y-4">
                <div>
                  <Label>Nombre del Restaurante</Label>
                  <Input value={restaurant.name} onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })} />
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Textarea value={restaurant.description || ""} onChange={(e) => setRestaurant({ ...restaurant, description: e.target.value })} />
                </div>
              </div>

              {/* ADDRESS */}
              <div>
                <Label>Dirección Completa</Label>
                <Textarea value={restaurant.address || ""} onChange={(e) => setRestaurant({ ...restaurant, address: e.target.value })} />
              </div>

              {/* IMAGES */}
              <div className="space-y-4 pt-4">
                <h4 className="font-medium">Imágenes del Restaurante</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cover */}
                  <div>
                    <Label>Imagen de Portada</Label>
                    <div className="mt-2">
                      <div className="w-full h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                        {restaurant.cover_image_url ? (
                          <img src={restaurant.cover_image_url} alt="Portada" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Subir imagen de portada</p>
                          </div>
                        )}
                      </div>
                      <Input type="file" accept="image/*" className="mt-2" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadImage(file, "cover");
                      }} />
                    </div>
                  </div>

                  {/* Profile */}
                  <div>
                    <Label>Logo / Imagen de Perfil</Label>
                    <div className="mt-2">
                      <div className="w-24 h-24 bg-gray-100 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto overflow-hidden">
                        {restaurant.logo_image_url ? (
                          <img src={restaurant.logo_image_url} alt="Logo" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <div className="text-center">
                            <Upload className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-600">Logo</p>
                          </div>
                        )}
                      </div>
                      <Input type="file" accept="image/*" className="mt-2" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadImage(file, "profile");
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* CONTACTO */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2" /> Información de Contacto
              </CardTitle>
              <CardDescription>Datos de contacto públicos del restaurante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Teléfono Principal</Label>
                  <Input
                    value={restaurant.phone}
                    onChange={(e) => setRestaurant({ ...restaurant, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email de Contacto</Label>
                  <Input
                    type="email"
                    value={restaurant.email}
                    onChange={(e) => setRestaurant({ ...restaurant, email: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HORARIOS */}
        <TabsContent value="hours" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" /> Horarios de Operación
              </CardTitle>
              <CardDescription>Configura los horarios de atención de tu restaurante</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {restaurant.restaurant_hours?.length ? (
                  restaurant.restaurant_hours.map((hours: any) => (
                    <div
                      key={hours.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="w-20 font-medium">{dayTranslations[hours.day_of_week]}</span>
                        <Switch
                          checked={hours.is_open}
                          onCheckedChange={(checked) => {
                            const updated = restaurant.restaurant_hours.map((h: any) =>
                              h.id === hours.id ? { ...h, is_open: checked } : h
                            );
                            setRestaurant({ ...restaurant, restaurant_hours: updated });
                          }}
                        />
                      </div>
                      {hours.is_open ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="time"
                            value={hours.open_time || ""}
                            onChange={(e) => {
                              const updated = restaurant.restaurant_hours.map((h: any) =>
                                h.id === hours.id ? { ...h, open_time: e.target.value } : h
                              );
                              setRestaurant({ ...restaurant, restaurant_hours: updated });
                            }}
                            className="w-32"
                          />
                          <span>a</span>
                          <Input
                            type="time"
                            value={hours.close_time || ""}
                            onChange={(e) => {
                              const updated = restaurant.restaurant_hours.map((h: any) =>
                                h.id === hours.id ? { ...h, close_time: e.target.value } : h
                              );
                              setRestaurant({ ...restaurant, restaurant_hours: updated });
                            }}
                            className="w-32"
                          />
                        </div>
                      ) : (
                        <Badge variant="secondary">Cerrado</Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No se encontraron horarios configurados.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DELIVERY */}
        <TabsContent value="delivery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" /> Configuración de Delivery
              </CardTitle>
              <CardDescription>Ajusta los parámetros de entrega a domicilio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Costo de Envío ($)</Label>
                  <Input
                    type="number"
                    value={restaurant.delivery_fee || ""}
                    onChange={(e) => setRestaurant({ ...restaurant, delivery_fee: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Pedido Mínimo ($)</Label>
                  <Input
                    type="number"
                    value={restaurant.min_order_amount || ""}
                    onChange={(e) => setRestaurant({ ...restaurant, min_order_amount: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Radio de Entrega (km)</Label>
                  <Input
                    type="number"
                    value={restaurant.delivery_radius || ""}
                    onChange={(e) => setRestaurant({ ...restaurant, delivery_radius: Number(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 🟢 BOTÓN GUARDAR */}
      <div className="pt-4">
        <Button onClick={handleSave} disabled={saving || slugStatus === "taken"} className="w-full">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" /> Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
