// src/components/IndicadoresFinancieros.jsx
import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import apiClient from '../services/apiClient';

const IndicadoresFinancieros = () => {
  const [data, setData] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarIndicadores = async () => {
      try {
        setCargando(true);
        setError('');
        const respuesta = await apiClient.get('/resumen-financiero/ebitda');
        setData(respuesta.data);
      } catch (err) {
        console.error("Error cargando datos de EBITDA:", err);
        setError(err.message);
        setData([]);
      } finally {
        setCargando(false);
      }
    };

    cargarIndicadores();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md mt-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Indicadores Financieros</h2>

      {cargando && (
        <div className="mb-4 rounded bg-blue-50 p-3 text-blue-700">
          Cargando indicadores...
        </div>
      )}

      {error && (
        <div className="mb-4 rounded bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      {/* Tarjeta resumen de EBITDA del mes actual */}
      {data.length > 0 && (
        <div className={`p-4 rounded-xl mb-6 text-white ${data[data.length - 1].ebitda >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
          <h3 className="text-xl font-medium">EBITDA ({data[data.length - 1].mes})</h3>
          <p className="text-2xl">$ {data[data.length - 1].ebitda.toLocaleString()}</p>
        </div>
      )}

      {/* Tabla comparativa */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Mes</th>
              <th className="border px-4 py-2">Ingresos</th>
              <th className="border px-4 py-2">Egresos</th>
              <th className="border px-4 py-2">EBITDA</th>
              <th className="border px-4 py-2">Margen (%)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx}>
                <td className="border px-4 py-2">{item.mes}</td>
                <td className="border px-4 py-2">$ {item.ingresos.toLocaleString()}</td>
                <td className="border px-4 py-2">$ {item.egresos.toLocaleString()}</td>
                <td className="border px-4 py-2">$ {item.ebitda.toLocaleString()}</td>
                <td className="border px-4 py-2">{item.margen.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Gráficos */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-80">
          <h3 className="text-lg font-medium mb-2">Ingresos / Egresos / EBITDA</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ingresos" fill="#3B82F6" name="Ingresos" />
              <Bar dataKey="egresos" fill="#EF4444" name="Egresos" />
              <Bar dataKey="ebitda" fill="#10B981" name="EBITDA" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="h-80">
          <h3 className="text-lg font-medium mb-2">Tendencia EBITDA</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ebitda" stroke="#10B981" name="EBITDA" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default IndicadoresFinancieros;
