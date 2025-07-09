"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, User, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function CuentaPage() {
  // 🟣 ESTADO Y HOOKS ===============================================
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
  const { toast } = useToast();  // ✅ Para mostrar notificaciones

  // 🟣 CARGAR DATOS DE USUARIO ======================================
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        setError("No se pudo obtener el usuario.");
        setLoading(false);
        return;
      }

      setUserData({
        name: user.user_metadata?.full_name ?? "",
        phone: user.user_metadata?.phone ?? "",
        email: user.email ?? "",
      });

      setLoading(false);
    };

    fetchUserData();
  }, []);

  // 🟣 GUARDAR CAMBIOS ==============================================
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado.");

      // ✅ Actualizar email
      if (userData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: userData.email
        });
        if (emailError) throw emailError;
      }

      // ✅ Actualizar password
      if (password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password
        });
        if (passwordError) throw passwordError;
      }

      // ✅ Actualizar metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: userData.name,
          phone: userData.phone,
        },
      });
      if (metadataError) throw metadataError;

      // ✅ Mostrar TOAST de éxito
      toast({
        title: "Cambios guardados",
        description: "La configuración se actualizó correctamente.",
      });

      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error al guardar.");
      }
    } finally {
      setSaving(false);
    }
  };

  // 🟣 ESTADO DE CARGA ==============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-6 w-6" />
        <span className="ml-2">Cargando configuración...</span>
      </div>
    );
  }

  // 🟣 RETURN PRINCIPAL ==============================================
  return (
    <div className="space-y-6">
      {/* 🟢 ENCABEZADO DE LA PÁGINA */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center">
            Configuración de la Cuenta
          </h2>
          <p className="text-gray-600">Administra los datos de tu cuenta de administrador</p>
        </div>
      </div>

      {/* 🟢 TABS DE SECCIONES (para escalar en el futuro) */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="general">Datos de la Cuenta</TabsTrigger>
        </TabsList>

        {/* TAB GENERAL */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" /> Información General
              </CardTitle>
              <CardDescription>Datos básicos de tu cuenta de administrador</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                {/* Nombre */}
                <div>
                  <Label>Nombre del Administrador</Label>
                  <Input
                    type="text"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    required
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <Label>Teléfono de Contacto</Label>
                  <Input
                    type="tel"
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <Label>Correo Electrónico</Label>
                  <Input
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    required
                  />
                </div>

                {/* Contraseña */}
                <div>
                  <Label>Nueva Contraseña</Label>
                  <Input
                    type="password"
                    placeholder="Dejar en blanco para no cambiar"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {/* Botón */}
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando cambios...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" /> Guardar Cambios
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
