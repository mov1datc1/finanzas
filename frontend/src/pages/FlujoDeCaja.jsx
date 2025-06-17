import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";

const formatoMXN = (valor) =>
  valor.toLocaleString("es-MX", { minimumFractionDigits: 2 });

const EstadoResultados = () => {
  const [anio, setAnio] = useState(2025);
  const [resumen, setResumen] = useState(null);
  const [anterior, setAnterior] = useState(null);
  const [mensual, setMensual] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resActual, resAnterior, resMensual] = await Promise.all([
          axios.get(`http://localhost:5000/api/estado-resultados/${anio}`),
          axios.get(`http://localhost:5000/api/estado-resultados/${anio - 1}`),
          axios.get(`http://localhost:5000/api/estado-resultados/mensual/${anio}`)
        ]);

        // Llevar saldo de EBITDA mes a mes
        const mensualData = resMensual.data;
        let carry = 0;
        const mensualConCarry = mensualData.map((mesObj, idx) => {
          const ingresosConCarry = mesObj.ingresos + carry;
          const ebitda = ingresosConCarry - mesObj.egresos;
          carry = ebitda;
          return {
            ...mesObj,
            ingresos: ingresosConCarry,
            ebitda,
          };
        });

        setResumen(resActual.data);
        setAnterior(resAnterior.data);
        setMensual(mensualConCarry);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        setResumen(null);
        setAnterior(null);
        setMensual([]);
      }
    };
    fetchData();
  }, [anio]);

  const calcularVariacion = (actual, previo) => {
    if (previo === 0) return "n.d.";
    const variacion = ((actual - previo) / previo) * 100;
    return `${variacion.toFixed(1)}%`;
  };

  const años = [2022, 2023, 2024, 2025, 2026];
  const mesesNombres = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">📄 Estado de Resultados</h1>

      <div className="mb-6">
        <label className="mr-2 font-medium">Seleccionar año:</label>
        <select
          className="border rounded px-3 py-2"
          value={anio}
          onChange={(e) => setAnio(parseInt(e.target.value))}
        >
          {años.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {resumen && anterior && (
        <div className="overflow-auto mb-10">
          <h2 className="text-lg font-semibold mb-2">Resumen Anual Comparativo</h2>
          <table className="min-w-full bg-white border rounded shadow text-sm">
            <thead className="bg-green-100 text-gray-800">
              <tr>
                <th className="px-4 py-2 text-left">Concepto</th>
                <th className="px-4 py-2 text-right">{anio}</th>
                <th className="px-4 py-2 text-right">{anio - 1}</th>
                <th className="px-4 py-2 text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(resumen).map(([key, value]) => (
                <tr key={key} className={key === 'ebitda' || key === 'beneficioNeto' ? 'bg-green-50 font-semibold' : 'border-t'}>
                  <td className="px-4 py-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</td>
                  <td className="px-4 py-2 text-right">${formatoMXN(value)}</td>
                  <td className="px-4 py-2 text-right">${formatoMXN(anterior[key])}</td>
                  <td className="px-4 py-2 text-right">{calcularVariacion(value, anterior[key])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mensual.length > 0 && (
        <div className="overflow-auto">
          <h2 className="text-lg font-semibold mb-2">Desglose Mensual {anio}</h2>
          <table className="min-w-full bg-white border rounded shadow text-sm">
            <thead className="bg-gray-100 text-gray-800">
              <tr>
                <th className="px-4 py-2 text-left">Mes</th>
                <th className="px-4 py-2 text-right">Ingresos</th>
                <th className="px-4 py-2 text-right">Egresos</th>
                <th className="px-4 py-2 text-right">EBITDA</th>
                <th className="px-4 py-2 text-right">Beneficio Neto</th>
                <th className="px-4 py-2 text-right">Flujo Caja</th>
              </tr>
            </thead>
            <tbody>
              {mensual.map((mesData, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{mesesNombres[idx]}</td>
                  <td className="px-4 py-2 text-right">${formatoMXN(mesData.ingresos)}</td>
                  <td className="px-4 py-2 text-right">${formatoMXN(mesData.egresos)}</td>
                  <td className="px-4 py-2 text-right text-green-700">${formatoMXN(mesData.ebitda)}</td>
                  <td className="px-4 py-2 text-right">${formatoMXN(mesData.beneficioNeto || 0)}</td>
                  <td className="px-4 py-2 text-right">${formatoMXN(mesData.flujoCaja || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EstadoResultados;
