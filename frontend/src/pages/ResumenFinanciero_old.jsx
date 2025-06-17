import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ExclamationTriangleIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const categoriasIngreso = ["Ventas", "Inversión externa", "Cobro de servicios", "Préstamo", "Pago proyecto", "Anticipo proyecto"];
const categoriasEgreso = ["Herramientas", "Salario", "Renta", "Marketing", "Préstamo", "Bono"];
const tiposFlujo = ["Operativo", "Financiero", "Inversión"];

const ResumenFinanciero = () => {
  const [ingresos, setIngresos] = useState([]);
  const [egresos, setEgresos] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [anioSeleccionado, setAnioSeleccionado] = useState("");
  const [mostrarDetalles, setMostrarDetalles] = useState(true);
  const [editando, setEditando] = useState(null);
  const [formEdit, setFormEdit] = useState({ descripcion: "", monto: 0, fecha: "", categoria: "", tipoFlujo: "" });
  const [confirmacion, setConfirmacion] = useState({ id: null, tipo: "" });

  const fetchData = () => {
    axios.get("http://localhost:5000/api/ingresos").then((res) => setIngresos(res.data));
    axios.get("http://localhost:5000/api/egresos").then((res) => setEgresos(res.data));
  };

  useEffect(() => {
    fetchData();
  }, []); 

  const confirmarEliminacion = (id, tipo) => setConfirmacion({ id, tipo });
  const cancelarConfirmacion = () => setConfirmacion({ id: null, tipo: "" });
  const ejecutarEliminacion = async () => {
    const url = `http://localhost:5000/api/${confirmacion.tipo}/${confirmacion.id}`;
    await axios.delete(url);
    cancelarConfirmacion();
    fetchData();
  };

  const iniciarEdicion = (registro, tipo) => {
    setEditando({ id: registro._id, tipo });
    setFormEdit({ ...registro });
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setFormEdit({ descripcion: "", monto: 0, fecha: "", categoria: "", tipoFlujo: "" });
  };

  const guardarEdicion = async () => {
    const url = `http://localhost:5000/api/${editando.tipo}/${editando.id}`;
    await axios.put(url, formEdit);
    cancelarEdicion();
    fetchData();
  };

  const filtrarRegistros = (data) => {
    return data.filter((r) => {
      const fecha = new Date(r.fecha);
      const mes = fecha.getMonth() + 1;
      const anio = fecha.getFullYear();
      return (
        (!mesSeleccionado || mes === parseInt(mesSeleccionado)) &&
        (!anioSeleccionado || anio === parseInt(anioSeleccionado))
      );
    });
  };

  const ingresosFiltrados = filtrarRegistros(ingresos);
  const egresosFiltrados = filtrarRegistros(egresos);
  const totalIngresos = ingresosFiltrados.reduce((acc, cur) => acc + cur.monto, 0);
  const totalEgresos = egresosFiltrados.reduce((acc, cur) => acc + cur.monto, 0);
  const balance = totalIngresos - totalEgresos;

  const exportarPDF = async () => {
    const input = document.getElementById("resumen-financiero");
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("Resumen_Financiero.pdf");
  };

  return (
    <div className="p-6" id="resumen-financiero">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Resumen Financiero</h1>
        <button onClick={exportarPDF} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Exportar PDF
        </button>
      </div>

       <div className="flex gap-4 mb-6">
        <select className="border rounded px-3 py-2" value={mesSeleccionado} onChange={(e) => setMesSeleccionado(e.target.value)}>
          <option value="">Todos los meses</option>
          {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((nombreMes, index) => (
            <option key={index + 1} value={index + 1}>{nombreMes}</option>
          ))}
        </select>

        <select className="border rounded px-3 py-2" value={anioSeleccionado} onChange={(e) => setAnioSeleccionado(e.target.value)}>
          <option value="">Todos los años</option>
          {[2022, 2023, 2024, 2025].map((anio) => (
            <option key={anio} value={anio}>{anio}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-100 text-green-800 p-4 rounded-xl shadow">
          <p className="text-lg font-semibold">Ingresos</p>
          <p className="text-xl font-bold">${totalIngresos.toFixed(2)}</p>
        </div>
        <div className="bg-red-100 text-red-800 p-4 rounded-xl shadow">
          <p className="text-lg font-semibold">Egresos</p>
          <p className="text-xl font-bold">${totalEgresos.toFixed(2)}</p>
        </div>
        <div className={`p-4 rounded-xl shadow ${balance >= 0 ? "bg-green-200 text-green-900" : "bg-orange-200 text-orange-900"}`}>
          <p className="text-lg font-semibold">Balance</p>
          <p className="text-xl font-bold">${balance.toFixed(2)}</p>
        </div>
      
      </div>

      <button onClick={() => setMostrarDetalles(!mostrarDetalles)} className="mb-4 text-blue-600 hover:underline">
        {mostrarDetalles ? "Ocultar detalles" : "Mostrar detalles"}
      </button>

      {mostrarDetalles && (
        <>
          {editando && (
            <div className="bg-yellow-50 p-4 rounded mb-4">
              <h2 className="font-semibold mb-2">Editando {editando.tipo}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <input type="date" value={formEdit.fecha} onChange={(e) => setFormEdit({ ...formEdit, fecha: e.target.value })} className="border rounded px-2 py-1" />
                <input type="text" value={formEdit.descripcion} onChange={(e) => setFormEdit({ ...formEdit, descripcion: e.target.value })} placeholder="Descripción" className="border rounded px-2 py-1" />
                <select value={formEdit.categoria} onChange={(e) => setFormEdit({ ...formEdit, categoria: e.target.value })} className="border rounded px-2 py-1">
                  {(editando.tipo === "ingresos" ? categoriasIngreso : categoriasEgreso).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <select value={formEdit.tipoFlujo} onChange={(e) => setFormEdit({ ...formEdit, tipoFlujo: e.target.value })} className="border rounded px-2 py-1">
                  {tiposFlujo.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
                <input type="number" value={formEdit.monto} onChange={(e) => setFormEdit({ ...formEdit, monto: parseFloat(e.target.value) })} className="border rounded px-2 py-1 col-span-2" />
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={guardarEdicion} className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
                <button onClick={cancelarEdicion} className="bg-gray-300 px-4 py-2 rounded">Cancelar</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[{ titulo: "Ingresos", data: ingresosFiltrados, tipo: "ingresos" }, { titulo: "Egresos", data: egresosFiltrados, tipo: "egresos" }].map(({ titulo, data, tipo }) => (
              <div key={tipo}>
                <h2 className="text-xl font-semibold mb-2">{titulo}</h2>
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2">Fecha</th>
                      <th className="px-3 py-2">Descripción</th>
                      <th className="px-3 py-2">Categoría</th>
                      <th className="px-3 py-2">Tipo de Flujo</th>
                      <th className="px-3 py-2">Monto</th>
                      <th className="px-3 py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((r) => (
                      <tr key={r._id} className="border-b">
                        <td className="px-3 py-2">{format(new Date(r.fecha), "dd/MM/yyyy")}</td>
                        <td className="px-3 py-2">{r.descripcion}</td>
                        <td className="px-3 py-2">{r.categoria}</td>
                        <td className="px-3 py-2">{r.tipoFlujo}</td>
                        <td className="px-3 py-2">${r.monto.toFixed(2)}</td>
                        <td className="px-3 py-2 flex gap-2">
                          <button onClick={() => iniciarEdicion(r, tipo)} className="text-blue-600 hover:underline"><PencilIcon className="h-4 w-4 inline" /></button>
                          <button onClick={() => confirmarEliminacion(r._id, tipo)} className="text-red-600 hover:underline"><TrashIcon className="h-4 w-4 inline" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </>
      )}

      {confirmacion.id && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md max-w-sm w-full">
            <div className="flex items-center gap-2 mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold">¿Estás seguro?</h3>
            </div>
            <p className="mb-4">Esta acción no se puede deshacer.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={cancelarConfirmacion} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
              <button onClick={ejecutarEliminacion} className="px-4 py-2 bg-red-600 text-white rounded">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumenFinanciero;
