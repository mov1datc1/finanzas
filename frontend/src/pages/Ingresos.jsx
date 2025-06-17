import { useState, useEffect } from "react";

export default function Ingresos() {
  const [form, setForm] = useState({
    descripcion: "",
    monto: "",
    fecha: "",
    categoria: "",
    tipoFlujo: "Operativo",
    fuente: "",
    fuenteTexto: ""
  });

  const [mensaje, setMensaje] = useState("");
  const [historial, setHistorial] = useState([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/ingresos")
      .then(res => res.json())
      .then(data => setHistorial(data))
      .catch(() => setHistorial([]));
  }, []);

  const categorias = [
    "Ventas",
    "Aportación de Capital",
    "Intereses",
    "Otros Ingresos",
  ];

  const fuentes = [
    "Bofa JP", "Wellsfargo RZ", "BBVA movida", "BBVA JP", "BBVA RZ",
    "Bofa RZ", "Chase JP", "Paypal Movida", "Paypal JP", "WISE movida", "Otro"
  ];

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { ...form };

    if (payload.fuente && fuentes.includes(payload.fuente)) {
      payload.fuente = fuentes.find((f) => f === payload.fuente);
    }

    if (payload.fuente !== "Otro") {
      delete payload.fuenteTexto;
    }

    try {
      const response = await fetch("http://localhost:5000/api/ingresos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setMensaje("✅ Ingreso registrado correctamente");
        setForm({
          descripcion: "",
          monto: "",
          fecha: "",
          categoria: "",
          tipoFlujo: "Operativo",
          fuente: "",
          fuenteTexto: ""
        });
      } else {
        setMensaje("❌ Error al guardar el ingreso");
      }
    } catch (error) {
      setMensaje("❌ Error al conectar con el servidor");
    }
  };

  const cargarIngreso = (item) => {
    setForm({
      descripcion: item.descripcion,
      monto: item.monto,
      fecha: "",
      categoria: item.categoria,
      tipoFlujo: item.tipoFlujo,
      fuente: fuentes.includes(item.fuente) ? item.fuente : "Otro",
      fuenteTexto: fuentes.includes(item.fuente) ? "" : item.fuente
    });
  };

  const historialFiltrado = historial.filter((item) =>
    item.descripcion.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Registrar Ingreso</h2>

      {mensaje && (
        <div className={`mb-4 p-2 text-center text-sm ${mensaje.includes("✅") ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"} rounded`}>
          {mensaje}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción" className="w-full p-2 border rounded" required />
        <input type="number" name="monto" value={form.monto} onChange={handleChange} placeholder="Monto (MXN)" className="w-full p-2 border rounded" required />
        <input type="date" name="fecha" value={form.fecha} onChange={handleChange} className="w-full p-2 border rounded" required />

        <select name="categoria" value={form.categoria} onChange={handleChange} className="w-full p-2 border rounded" required>
          <option value="">Seleccionar Categoría</option>
          {categorias.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        <select name="tipoFlujo" value={form.tipoFlujo} onChange={handleChange} className="w-full p-2 border rounded" required>
          <option value="">Seleccionar Tipo de Flujo</option>
          {["Operativo", "Inversión", "Financiamiento"].map((tipo) => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}
        </select>

        <select name="fuente" value={form.fuente} onChange={handleChange} className="w-full p-2 border rounded" required>
          <option value="">Seleccionar Fuente</option>
          {fuentes.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>

        {form.fuente === "Otro" && (
          <input
            type="text"
            name="fuenteTexto"
            value={form.fuenteTexto}
            onChange={handleChange}
            placeholder="Especificar fuente"
            className="w-full p-2 border rounded"
            required
          />
        )}

        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Guardar Ingreso
        </button>
      </form>

      {historial.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-4">Plantillas de Ingresos anteriores</h3>
          <input
            type="text"
            placeholder="Buscar por descripción..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
          />
          <ul className="space-y-2">
            {historialFiltrado.map((item) => (
              <li key={item._id} className="flex justify-between items-center p-2 border rounded">
                <span>{item.descripcion} - ${item.monto}</span>
                <button
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  onClick={() => cargarIngreso(item)}
                >
                  Cargar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
