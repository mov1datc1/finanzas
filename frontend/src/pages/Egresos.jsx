import { useState, useEffect } from "react";
import apiClient from "../services/apiClient";

export default function Egresos() {
  const [form, setForm] = useState({
    descripcion: "",
    monto: "",
    fecha: "",
    categoria: "",
    tipoFlujo: "",
    fuente: "",
    otraFuente: ""
  });

  const [mensaje, setMensaje] = useState("");
  const [historial, setHistorial] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        setCargando(true);
        const { data } = await apiClient.get("/egresos");
        setHistorial(data);
      } catch (error) {
        setMensaje(`❌ ${error.message}`);
        setHistorial([]);
      } finally {
        setCargando(false);
      }
    };

    cargarHistorial();
  }, []);

  const categoriasEgresos = ["Nómina", "Renta", "Servicios", "Publicidad", "Materiales", "Impuestos", "Otros"];
  const tiposFlujo = ["Operativo", "Inversión", "Financiamiento"];
  const fuentes = [
    "Bofa JP", "Wellsfargo RZ", "BBVA movida", "BBVA JP", "BBVA RZ",
    "Bofa RZ", "Chase JP", "Paypal Movida", "Paypal JP", "WISE movida", "Otro"
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const datos = {
      ...form,
      fuente: form.fuente === "Otro" ? form.otraFuente : form.fuente,
    };
    delete datos.otraFuente;

    try {
      datos.monto = Number(datos.monto);
      await apiClient.post("/egresos", datos);
      setMensaje("✅ Egreso registrado correctamente");
      setForm({ descripcion: "", monto: "", fecha: "", categoria: "", tipoFlujo: "", fuente: "", otraFuente: "" });
      const { data } = await apiClient.get("/egresos");
      setHistorial(data);
    } catch (error) {
      setMensaje(`❌ ${error.message}`);
    }
  };

  const cargarEgreso = (item) => {
    setForm({
      descripcion: item.descripcion,
      monto: item.monto,
      fecha: "",
      categoria: item.categoria,
      tipoFlujo: item.tipoFlujo,
      fuente: fuentes.includes(item.fuente) ? item.fuente : "Otro",
      otraFuente: fuentes.includes(item.fuente) ? "" : item.fuente
    });
  };

  const historialFiltrado = historial.filter((item) =>
    item.descripcion.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Registrar Egreso</h2>

      {cargando && (
        <div className="mb-4 p-3 text-center text-sm text-blue-700 bg-blue-100 rounded">Cargando historial de egresos...</div>
      )}

      {mensaje && (
        <div
          className={`mb-4 p-3 text-center text-sm rounded ${mensaje.includes('✅') ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'}`}
        >
          {mensaje}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Descripción</label>
          <input type="text" name="descripcion" value={form.descripcion} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>

        <div>
          <label className="block font-medium">Monto (MXN)</label>
          <input type="number" name="monto" value={form.monto} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>

        <div>
          <label className="block font-medium">Fecha</label>
          <input type="date" name="fecha" value={form.fecha} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>

        <div>
          <label className="block font-medium">Categoría</label>
          <select name="categoria" value={form.categoria} onChange={handleChange} className="w-full p-2 border rounded" required>
            <option value="">Seleccionar...</option>
            {categoriasEgresos.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div>
          <label className="block font-medium">Tipo de Flujo</label>
          <select name="tipoFlujo" value={form.tipoFlujo} onChange={handleChange} className="w-full p-2 border rounded" required>
            <option value="">Seleccionar...</option>
            {tiposFlujo.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
          </select>
        </div>

        <div>
          <label className="block font-medium">Fuente</label>
          <select name="fuente" value={form.fuente} onChange={handleChange} className="w-full p-2 border rounded" required>
            <option value="">Seleccionar fuente...</option>
            {fuentes.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        {form.fuente === "Otro" && (
          <div>
            <label className="block font-medium">Otra fuente</label>
            <input type="text" name="otraFuente" value={form.otraFuente} onChange={handleChange} className="w-full p-2 border rounded" required />
          </div>
        )}

        <button type="submit" className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">Guardar Egreso</button>
      </form>

      {historial.length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-4">Plantillas de Egresos anteriores</h3>
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
                  onClick={() => cargarEgreso(item)}
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

