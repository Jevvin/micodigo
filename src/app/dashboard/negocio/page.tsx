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
import { Loader2, AlertTriangle, Save, XCircle, CheckCircle, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function NegocioPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [cities, setCities] = useState<{ id: string, name: string, state: string }[]>([]);
  const [slugStatus, setSlugStatus] = useState<null | "available" | "taken" | "checking">(null);

  const router = useRouter();
  const { toast } = useToast();

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
      setUserId(user.id);

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

    const fetchCities = async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name, state')
        .order('name');
      if (!error && data) setCities(data);
    };

    fetchData();
    fetchCities();
  }, [router]);

  const checkSlugAvailability = async (newSlug: string) => {
    if (!newSlug || !newSlug.trim()) {
      setSlugStatus(null);
      return;
    }
    setSlugStatus("checking");
    const { data, error } = await supabase
      .from("restaurants")
      .select("id")
      .eq("slug", newSlug.trim())
      .neq("id", restaurant.id);

    if (error) {
      setSlugStatus(null);
      return;
    }
    setSlugStatus(data && data.length > 0 ? "taken" : "available");
  };

  const handleSave = async () => {
    if (!restaurant) return;
    setSaving(true);
    setError(null);

    try {
      if (!restaurant.id) throw new Error("No se encontró el ID del restaurante.");
      if (!restaurant.slug || !restaurant.slug.trim()) throw new Error("El slug no puede estar vacío.");

      const { data: existingSlug } = await supabase
        .from("restaurants")
        .select("id")
        .eq("slug", restaurant.slug.trim())
        .neq("id", restaurant.id);

      if (existingSlug && existingSlug.length > 0) {
        throw new Error("El slug elegido ya está en uso. Por favor elige otro.");
      }

      const updates = {
        name: restaurant.name,
        description: restaurant.description,
        address: restaurant.address,
        city_id: restaurant.city_id,
        district: restaurant.district,
        phone: restaurant.phone,
        email: restaurant.email,
        cover_image_url: restaurant.cover_image_url,
        logo_image_url: restaurant.logo_image_url,
        delivery_fee: restaurant.delivery_fee,
        min_order_amount: restaurant.min_order_amount,
        delivery_radius: restaurant.delivery_radius,
        slug: restaurant.slug.trim(),
      };

      const { error: restaurantError } = await supabase
        .from("restaurants")
        .update(updates)
        .eq("id", restaurant.id);

      if (restaurantError) throw restaurantError;

      toast({
        title: "Cambios guardados",
        description: "La configuración se actualizó correctamente.",
      });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando configuración...</span>
      </div>
    );
  }

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

  if (!restaurant) {
    return <p className="text-center py-8">No se encontró el restaurante.</p>;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Restaurante</CardTitle>
          <CardDescription>Administra la información de tu negocio</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-6">
          <Tabs defaultValue="general" className="space-y-6">
  <TabsList className="flex overflow-x-auto gap-2 sm:grid sm:grid-cols-4">
    <TabsTrigger value="general">General</TabsTrigger>
    <TabsTrigger value="contact">Contacto</TabsTrigger>
    <TabsTrigger value="hours">Horarios</TabsTrigger>
    <TabsTrigger value="delivery">Delivery</TabsTrigger>
  </TabsList>

  {/* TAB GENERAL */}
  <TabsContent value="general" className="space-y-6">
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
        {slugStatus === "checking" && <span className="text-sm text-gray-500">Verificando...</span>}
        {slugStatus === "available" && <CheckCircle className="text-green-500" size={20} />}
        {slugStatus === "taken" && <XCircle className="text-red-500" size={20} />}
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

    <div>
      <Label>Nombre del Restaurante</Label>
      <Input value={restaurant.name} onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })} />
    </div>
    <div>
      <Label>Descripción</Label>
      <Textarea value={restaurant.description || ""} onChange={(e) => setRestaurant({ ...restaurant, description: e.target.value })} />
    </div>
    <div>
      <Label>Dirección</Label>
      <Textarea value={restaurant.address || ""} onChange={(e) => setRestaurant({ ...restaurant, address: e.target.value })} />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Imagen de Portada</Label>
        {restaurant.cover_image_url && (
          <img src={restaurant.cover_image_url} className="w-full h-32 object-cover rounded" alt="Portada" />
        )}
        <Input type="file" accept="image/*" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUploadImage(file, "cover");
        }} />
      </div>
      <div>
        <Label>Logo / Imagen de Perfil</Label>
        {restaurant.logo_image_url && (
          <img src={restaurant.logo_image_url} className="w-24 h-24 object-cover rounded-full mx-auto" alt="Logo" />
        )}
        <Input type="file" accept="image/*" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUploadImage(file, "profile");
        }} />
      </div>
    </div>
  </TabsContent>

  {/* TAB CONTACT */}
  <TabsContent value="contact" className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Teléfono</Label>
        <Input value={restaurant.phone} onChange={(e) => setRestaurant({ ...restaurant, phone: e.target.value })} />
      </div>
      <div>
        <Label>Email</Label>
        <Input type="email" value={restaurant.email} onChange={(e) => setRestaurant({ ...restaurant, email: e.target.value })} />
      </div>
    </div>
  </TabsContent>

  {/* TAB HORARIOS */}
  <TabsContent value="hours" className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" /> Horarios de Operación
        </CardTitle>
        <CardDescription>Configura los horarios de atención de tu restaurante</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {restaurant.restaurant_hours?.length ? (
          restaurant.restaurant_hours.map((hours: any) => (
            <div
              key={hours.id}
              className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border rounded-lg space-y-3 md:space-y-0"
            >
              <div className="flex items-center space-x-4">
                <span className="w-24 font-medium capitalize">{hours.day_of_week}</span>
                <Switch
                  checked={hours.is_open}
                  onCheckedChange={(checked) => {
                    const updated = restaurant.restaurant_hours.map((h: any) => {
                      if (h.id === hours.id) {
                        if (checked) {
                          const previous = restaurant.restaurant_hours.find(
                            (prev: any) => prev.is_open && prev.open_time && prev.close_time && prev.id !== h.id
                          );
                          return {
                            ...h,
                            is_open: true,
                            open_time: previous ? previous.open_time : "09:00",
                            close_time: previous ? previous.close_time : "18:00",
                          };
                        } else {
                          return { ...h, is_open: false, open_time: "", close_time: "" };
                        }
                      }
                      return h;
                    });
                    setRestaurant({ ...restaurant, restaurant_hours: updated });
                  }}
                />
              </div>
              {hours.is_open && (
                <div className="flex items-center space-x-2 mt-2 md:mt-0">
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
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No se encontraron horarios configurados.</p>
        )}
      </CardContent>
    </Card>
  </TabsContent>

  {/* TAB DELIVERY */}
  <TabsContent value="delivery" className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Costo de Envío</Label>
        <Input type="number" value={restaurant.delivery_fee || ""} onChange={(e) => setRestaurant({ ...restaurant, delivery_fee: Number(e.target.value) })} />
      </div>
      <div>
        <Label>Pedido Mínimo</Label>
        <Input type="number" value={restaurant.min_order_amount || ""} onChange={(e) => setRestaurant({ ...restaurant, min_order_amount: Number(e.target.value) })} />
      </div>
      <div>
        <Label>Radio de Entrega (km)</Label>
        <Input type="number" value={restaurant.delivery_radius || ""} onChange={(e) => setRestaurant({ ...restaurant, delivery_radius: Number(e.target.value) })} />
      </div>
    </div>
  </TabsContent>
</Tabs>

          <Separator className="my-6" />

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
        </CardContent>
      </Card>
    </main>
  );
}
