"use client";

import { useEffect } from 'react';
import { supabase } from './utils/supabaseClient';
import Link from 'next/link';

export default function Home() {

  useEffect(() => {
    async function testConnection() {
      console.log('🌐 Haciendo prueba de conexión con Supabase...');
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .limit(1);

      if (error) {
        console.error('❌ Error al conectar con Supabase:', error.message);
      } else {
        console.log('✅ Conexión exitosa. Datos recibidos:', data);
      }
    }

    testConnection();
  }, []);

  return (
    <main className="min-h-screen bg-[#fff7f1] font-sans">
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-orange-500">RestaurantOS</h1>
        
        <div className="space-x-3">
          <button className="border border-gray-300 text-gray-800 px-4 py-1.5 rounded hover:bg-gray-100">
            Iniciar Sesión
          </button>
          <Link
            href="/restaurant"
            className="bg-orange-500 text-white px-4 py-1.5 rounded hover:bg-orange-600 inline-block text-center"
          >
            Restaurante
          </Link>
        </div>
      </header>

      <section className="flex flex-col items-center mt-12 px-4">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Encuentra restaurantes
        </h2>
        <input
          type="text"
          placeholder="Buscar restaurantes o comida..."
          className="border border-gray-300 p-3 rounded w-full max-w-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </section>
    </main>
  )
}
