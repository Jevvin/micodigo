"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X, MapPin, Banknote, CreditCard, Loader2 } from "lucide-react";

export default function CheckoutModal({
  open,
  onClose,
  cartItems,
  onRemoveItem,
  onConfirm,
  fetchCities,
  cities,
}: {
  open: boolean;
  onClose: () => void;
  cartItems: any[];
  onRemoveItem: (index: number) => void;
  onConfirm: (orderData: any) => void;
  fetchCities: () => Promise<void>;
  cities: { id: number; name: string; state: string }[];
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");

  const [street, setStreet] = useState("");
  const [label, setLabel] = useState("");
  const [selectedCityId, setSelectedCityId] = useState<string>("");
  const [postalCode, setPostalCode] = useState("");
  const [reference, setReference] = useState("");

  const [loadingCities, setLoadingCities] = useState(false);

  // Errores simples
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [streetError, setStreetError] = useState("");
  const [cityError, setCityError] = useState("");

  // Cargar ciudades al abrir
  useEffect(() => {
    if (open && cities.length === 0) {
      setLoadingCities(true);
      fetchCities().finally(() => setLoadingCities(false));
    }
  }, [open]);

  // Calcular costos
  const subtotal = cartItems.reduce((sum, item) => {
    const extrasTotal = (item.extras || []).reduce(
      (acc: number, extra: any) => acc + extra.price * (extra.quantity || 1),
      0
    );
    return sum + ((item.price + extrasTotal) * item.quantity);
  }, 0);

  const envio = 30;
  const total = subtotal + envio;

  const handleConfirm = () => {
    let hasError = false;

    // Validaciones obligatorias
    if (!name.trim()) {
      setNameError("Por favor añade tu nombre");
      hasError = true;
    } else setNameError("");

    if (!phone.trim()) {
      setPhoneError("Por favor añade tu teléfono");
      hasError = true;
    } else setPhoneError("");

    if (!street.trim()) {
      setStreetError("Por favor añade la calle y número");
      hasError = true;
    } else setStreetError("");

    if (!selectedCityId) {
      setCityError("Selecciona una ciudad");
      hasError = true;
    } else setCityError("");

    if (hasError) return;

    const city = cities.find((c) => String(c.id) === selectedCityId);

    if (!city) {
      setCityError("Selecciona una ciudad válida");
      return;
    }

    const addressData = {
      street,
      label,
      city: city.name,
      state: city.state,
      postal_code: postalCode,
      notes: reference,
    };

    const orderData = {
  customer: { id: null, name, phone, email },
  paymentMethod,
  address: addressData,
  items: cartItems,
  subtotal,
  envio,
  total,
};

    onConfirm(orderData);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Finalizar Pedido</CardTitle>
            <CardDescription>Completa tus datos para procesar el pedido</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 p-0">
            <X className="h-5 w-5 text-gray-600" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Información de Contacto */}
          <div className="space-y-4">
            <h3 className="font-medium">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  placeholder="Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={nameError ? "border-red-500 focus:border-red-500" : ""}
                />
                {nameError && <p className="text-sm text-red-500">{nameError}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  placeholder="123-456-7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={phoneError ? "border-red-500 focus:border-red-500" : ""}
                />
                {phoneError && <p className="text-sm text-red-500">{phoneError}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="juan@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Información de Entrega */}
          <div className="space-y-4">
            <h3 className="font-medium">Información de Entrega</h3>
            <div>
              <Label htmlFor="street">Calle y número</Label>
              <Textarea
                id="street"
                placeholder="Ej: Av. Revolución 123"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                rows={2}
                className={streetError ? "border-red-500 focus:border-red-500" : ""}
              />
              {streetError && <p className="text-sm text-red-500">{streetError}</p>}
            </div>
            <div>
              <Label htmlFor="label">Colonia</Label>
              <Input
                id="label"
                placeholder="Colonia Centro"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="city">Ciudad</Label>
              {loadingCities ? (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>Cargando ciudades...</span>
                </div>
              ) : (
                <select
                  id="city"
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(e.target.value)}
                  className={`border rounded-lg w-full p-2 mt-1 ${cityError ? "border-red-500" : ""}`}
                >
                  <option value="">Selecciona tu ciudad</option>
                  {cities.map((city) => (
                    <option key={city.id} value={String(city.id)}>
                      {city.name}
                    </option>
                  ))}
                </select>
              )}
              {cityError && <p className="text-sm text-red-500">{cityError}</p>}
            </div>
            <div>
              <Label htmlFor="postal">Código postal</Label>
              <Input
                id="postal"
                placeholder="Ej: 12345"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="reference">Referencia (opcional)</Label>
              <Textarea
                id="reference"
                placeholder="Referencias del domicilio o detalles extra"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Costo de envío: ${envio}</p>
                <p className="text-sm text-gray-600">Tiempo estimado: 30-45 min</p>
              </div>
            </div>
          </div>

          {/* Método de Pago */}
          <div className="space-y-4">
            <h3 className="font-medium">Método de Pago</h3>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as "cash" | "card")}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex items-center">
                  <Banknote className="h-4 w-4 mr-2" /> Efectivo
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" /> Tarjeta (Terminal en entrega)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Resumen del Pedido */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Resumen del Pedido</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío:</span>
                <span>${envio}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${total}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleConfirm}>
              Confirmar Pedido
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
