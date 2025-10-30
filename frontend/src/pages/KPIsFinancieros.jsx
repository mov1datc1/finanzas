import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import apiClient from "../services/apiClient";

const KPIsFinancieros = () => {
  const [datos, setDatos] = useState([]);
  const [anio, setAnio] = useState(2025);
  const [tiposFlujo, setTiposFlujo] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError("");
        const [kpiRes, tiposRes] = await Promise.all([
          apiClient.get(`/kpis`, { params: { year: anio } }),
          apiClient.get(`/flujo-tipos`, { params: { year: anio } })
        ]);
        setDatos(kpiRes.data);
        setTiposFlujo(tiposRes.data);
      } catch (err) {
        console.error("Error al cargar KPIs:", err);
        setError(err.message);
        setDatos([]);
        setTiposFlujo([]);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [anio]);

  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const colors = ["#60a5fa", "#f87171"];

  const formatoMXN = (valor) => `$${valor.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">📈 KPIs Financieros - {anio}</h1>
      <select
        value={anio}
        onChange={(e) => setAnio(e.target.value)}
        className="mb-6 border rounded px-3 py-2"
      >
        {[2022, 2023, 2024, 2025].map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      {cargando && (
        <div className="mb-4 rounded bg-blue-50 p-3 text-blue-700">
          Cargando métricas financieras...
        </div>
      )}

      {error && (
        <div className="mb-4 rounded bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Ingresos vs Egresos Mensuales</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datos}>
              <XAxis dataKey="mes" tickFormatter={(i) => meses[i - 1]} />
              <YAxis />
              <Tooltip formatter={(value) => formatoMXN(value)} />
              <Legend />
              <Bar dataKey="ingresos" fill="#60a5fa" name="Ingresos" />
              <Bar dataKey="egresos" fill="#f87171" name="Egresos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Distribución Anual</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Ingresos", value: datos.reduce((a, b) => a + b.ingresos, 0) },
                  { name: "Egresos", value: datos.reduce((a, b) => a + b.egresos, 0) }
                ]}
                dataKey="value"
                outerRadius={100}
                label
              >
                <Cell fill="#60a5fa" />
                <Cell fill="#f87171" />
              </Pie>
              <Tooltip formatter={(value) => formatoMXN(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">EBITDA Mensual Histórico</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={datos}>
              <XAxis dataKey="mes" tickFormatter={(i) => meses[i - 1]} />
              <YAxis />
              <Tooltip formatter={(value) => formatoMXN(value)} />
              <Legend />
              <Line type="monotone" dataKey="ebitda" stroke="#10b981" name="EBITDA" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Tipos de Flujo (%)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tiposFlujo}
                dataKey="valor"
                nameKey="tipo"
                outerRadius={100}
                label={(entry) => `${entry.tipo} (${entry.porcentaje.toFixed(1)}%)`}
              >
                {tiposFlujo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={["#3b82f6", "#8b5cf6", "#f59e0b"][index % 3]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatoMXN(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default KPIsFinancieros;
