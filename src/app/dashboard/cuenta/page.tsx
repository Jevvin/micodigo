"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CuentaPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState({
    email: "",
    name: "",
    phone: "",
  });
  const [password, setPassword] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        setError("No se pudo obtener el usuario.");
        setLoading(false);
        return;
      }

      // Consulta en la tabla restaurants
      const { data, error: fetchError } = await supabase
        .from("restaurants")
        .select("name, phone, email")
        .eq("user_id", user.id)
        .single();

      if (fetchError) {
        setError("No se pudo obtener los datos del restaurante.");
      } else if (data) {
        setUserData({
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
        });
      }

      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado.");

      // Actualiza en la tabla restaurants
      const { error: updateError } = await supabase
        .from("restaurants")
        .update({
          name: userData.name,
          phone: userData.phone,
          email: userData.email,
        })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Actualiza email y contraseña en auth si se cambió
      if (userData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: userData.email });
        if (emailError) throw emailError;
      }

      if (password) {
        const { error: passwordError } = await supabase.auth.updateUser({ password });
        if (passwordError) throw passwordError;
      }

      // Actualiza el localStorage si el nombre cambió
      if (userData.name) {
        localStorage.setItem("restaurantName", userData.name);
      }

      alert("✅ Datos actualizados correctamente.");
      router.refresh();

    } catch (err: any) {
      setError(err.message || "Ocurrió un error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-6 w-6" />
        <span className="ml-2">Cargando...</span>
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Configuración de la Cuenta</CardTitle>
          <p className="text-sm text-muted-foreground">
            Modifica los datos de tu cuenta de administrador.
          </p>
        </CardHeader>
        <Separator />
        <CardContent>
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Nombre del Administrador</label>
              <Input
                type="text"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Teléfono de Contacto</label>
              <Input
                type="tel"
                value={userData.phone}
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Correo Electrónico</label>
              <Input
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Nueva Contraseña</label>
              <Input
                type="password"
                placeholder="Dejar en blanco para no cambiar"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Guardando cambios..." : "Guardar cambios"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
