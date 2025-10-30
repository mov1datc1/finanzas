import { useEffect, useState } from "react";
import dayjs from "dayjs";
import apiClient from "../services/apiClient";

export default function TareasAdmin() {
  const [tareas, setTareas] = useState([]);
  const [nuevaTarea, setNuevaTarea] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [agrupadas, setAgrupadas] = useState({});
  const [mostrarMeses, setMostrarMeses] = useState({});
  const [contador, setContador] = useState({ total: 0, completadas: 0 });
  const [cargando, setCargando] = useState(false);

  const fetchTareas = async () => {
    try {
      setCargando(true);
      setMensaje("");
      const { data } = await apiClient.get("/tareas");
      setTareas(data);
      agruparPorMes(data);
      contarTareasMes(data);
    } catch (error) {
      setMensaje(error.message || "Error al cargar las tareas");
    } finally {
      setCargando(false);
    }
  };

  const agruparPorMes = (lista) => {
    const completadasAnteriores = lista.filter(
      (t) => t.completada && !(t.mes === dayjs().month() && t.año === dayjs().year())
    );

    const agrupadas = {};
    completadasAnteriores.forEach((t) => {
      const key = `${t.mes + 1}/${t.año}`;
      if (!agrupadas[key]) agrupadas[key] = [];
      agrupadas[key].push(t);
    });
    setAgrupadas(agrupadas);
  };

  const contarTareasMes = (lista) => {
    const actuales = lista.filter(t => t.año === dayjs().year() && t.mes === dayjs().month());
    const total = actuales.length;
    const completadas = actuales.filter(t => t.completada).length;
    setContador({ total, completadas });
  };

  useEffect(() => {
    fetchTareas();
  }, []);

  const agregarTarea = async () => {
    if (!nuevaTarea.trim()) return;
    try {
      await apiClient.post("/tareas", { descripcion: nuevaTarea });
      setNuevaTarea("");
      fetchTareas();
    } catch (error) {
      setMensaje(error.message);
    }
  };

  const actualizarTarea = async (id, actualizaciones) => {
    try {
      await apiClient.put(`/tareas/${id}`, actualizaciones);
      fetchTareas();
    } catch (error) {
      setMensaje(error.message);
    }
  };

  const eliminarTarea = async (id) => {
    try {
      await apiClient.delete(`/tareas/${id}`);
      fetchTareas();
    } catch (error) {
      setMensaje(error.message);
    }
  };

  const duplicarTarea = async (tarea) => {
    const nueva = { ...tarea, fecha: new Date(), completada: false };
    delete nueva._id;
    try {
      await apiClient.post("/tareas", nueva);
      fetchTareas();
    } catch (error) {
      setMensaje(error.message);
    }
  };

  const toggleMostrar = (clave) => {
    setMostrarMeses({ ...mostrarMeses, [clave]: !mostrarMeses[clave] });
  };

  const mesActual = dayjs().format("MMMM").toUpperCase();

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Tareas Administrativas - {mesActual}</h2>

      <div className="flex mb-4 gap-2">
        <input
          type="text"
          value={nuevaTarea}
          onChange={(e) => setNuevaTarea(e.target.value)}
          placeholder="Nueva tarea..."
          className="flex-grow p-2 border rounded"
        />
        <button onClick={agregarTarea} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Agregar
        </button>
      </div>

      <div className="mb-2 text-sm text-gray-600 text-right">
        Tareas del mes: {contador.completadas} completadas de {contador.total}
      </div>

      {cargando && <p className="text-sm text-blue-600 mb-2">Cargando tareas...</p>}

      {mensaje && <p className="text-red-600 text-sm mb-2">{mensaje}</p>}

      <ul className="space-y-2 mb-10">
        {tareas.filter(t => t.año === dayjs().year() && t.mes === dayjs().month()).map((tarea) => (
          <li key={tarea._id} className="flex justify-between items-center p-2 border rounded">
            <span className={`flex-grow ${tarea.completada ? 'line-through text-gray-500' : ''}`}>{tarea.descripcion}</span>
            <div className="flex gap-2">
              <button
                onClick={() => actualizarTarea(tarea._id, { completada: !tarea.completada })}
                className="px-2 py-1 text-xs bg-green-500 text-white rounded"
              >
                {tarea.completada ? 'Desmarcar' : 'Completar'}
              </button>
              <button
                onClick={() => eliminarTarea(tarea._id)}
                className="px-2 py-1 text-xs bg-red-600 text-white rounded"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {Object.keys(agrupadas).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">🕒 Historial de Tareas por Mes</h3>
          {Object.entries(agrupadas).map(([clave, tareasMes]) => (
            <div key={clave} className="mb-4">
              <button
                onClick={() => toggleMostrar(clave)}
                className="text-left w-full font-medium text-blue-600 hover:underline"
              >
                {mostrarMeses[clave] ? '▼' : '▶'} {clave}
              </button>
              {mostrarMeses[clave] && (
                <ul className="mt-2 space-y-1 ml-4">
                  {tareasMes.map((t) => (
                    <li key={t._id} className="text-sm text-gray-600 flex justify-between items-center">
                      <span className="line-through">{t.descripcion}</span>
                      <button
                        onClick={() => duplicarTarea(t)}
                        className="text-blue-500 text-xs hover:underline ml-2"
                      >
                        Copiar a este mes
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
