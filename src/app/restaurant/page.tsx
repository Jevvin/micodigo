"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabaseClient';
import { Menu, User, Phone, Mail, Lock } from 'lucide-react';

export default function RestaurantAuth(): JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    owner_name: '',
    phone: '',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) throw signUpError;
      const userId = data?.user?.id;
      if (!userId) throw new Error('No se obtuvo el ID del usuario creado.');

      const { error: insertError } = await supabase
        .from('restaurants')
        .insert([
          {
            user_id: userId,
            name: formData.name,
            owner_name: formData.owner_name,
            phone: formData.phone,
            email: formData.email,
          },
        ]);

      if (insertError) throw insertError;

      router.push('/dashboard');

    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) throw error;

      router.push('/dashboard');

    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-[#fff7f1] px-4 font-sans">
      <div className="max-w-md mx-auto pt-10 pb-6">
        <button
          onClick={handleGoHome}
          className="w-full flex justify-center items-center space-x-2 text-orange-500 text-3xl md:text-3xl font-bold mb-10 hover:text-orange-600 transition-colors cursor-pointer"
        >
          <Menu className="inline-block" size={25} />
          <span>RestaurantOS</span>
        </button>

        <Card>
          <CardHeader className="text-left">
            <CardTitle className="text-2xl md:text-2xl text-black font-bold">Panel de Restaurante</CardTitle>
            <CardDescription className="text-base text-black">
              Accede a tu panel de control o registra tu restaurante
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs
              defaultValue={activeTab}
              onValueChange={(val) => setActiveTab(val as 'login' | 'register')}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 rounded-md">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-400" size={16} />
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="tu@restaurante.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-black text-sm text-black placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
                      <input
                        type="password"
                        name="password"
                        required
                        placeholder="********"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10 border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-black text-sm text-black placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Nombre del Restaurante</label>
                    <div className="relative">
                      <Menu className="absolute left-3 top-3 text-gray-400" size={16} />
                      <input
                        name="name"
                        required
                        placeholder="Mi Restaurante"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-10 border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-black text-sm text-black placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Nombre del Propietario</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-gray-400" size={16} />
                      <input
                        name="owner_name"
                        required
                        placeholder="Juan Pérez"
                        value={formData.owner_name}
                        onChange={handleChange}
                        className="pl-10 border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-black text-sm text-black placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Teléfono</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 text-gray-400" size={16} />
                      <input
                        name="phone"
                        required
                        placeholder="+52 123 456 7890"
                        value={formData.phone}
                        onChange={handleChange}
                        className="pl-10 border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-black text-sm text-black placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-400" size={16} />
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="tu@restaurante.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-black text-sm text-black placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
                      <input
                        type="password"
                        name="password"
                        required
                        placeholder="********"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10 border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-black text-sm text-black placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Registrando...' : 'Registrar Restaurante'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
