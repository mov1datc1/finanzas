import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const formatoMXN = (valor) =>
  valor.toLocaleString('es-MX', { minimumFractionDigits: 2 });

export default function ResumenFinanciero() {
  const [mes, setMes] = useState(6);
  const [anio, setAnio] = useState(2025);
  const [saldoAnterior, setSaldoAnterior] = useState(0);
  const [ingresos, setIngresos] = useState([]);
  const [egresos, setEgresos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [formEdit, setFormEdit] = useState({ descripcion: '', monto: 0, fecha: '', categoria: '', tipoFlujo: '' });
  const [confirmacion, setConfirmacion] = useState({ id: null, tipo: '' });

  const fetchResumen = async () => {
    try {
      const [resI, resE] = await Promise.all([
        axios.get('http://localhost:5000/api/ingresos'),
        axios.get('http://localhost:5000/api/egresos'),
      ]);
      const allI = resI.data;
      const allE = resE.data;

      let acumulado = 0;
      for (let m = 1; m < mes; m++) {
        const sumI = allI
          .filter(i => {
            const d = new Date(i.fecha);
            return d.getMonth() + 1 === m && d.getFullYear() === anio;
          })
          .reduce((a, c) => a + c.monto, 0);
        const sumE = allE
          .filter(e => {
            const d = new Date(e.fecha);
            return d.getMonth() + 1 === m && d.getFullYear() === anio;
          })
          .reduce((a, c) => a + c.monto, 0);
        acumulado += sumI - sumE;
      }
      setSaldoAnterior(acumulado);

      const fechaInicio = new Date(anio, mes - 1, 1).toISOString();
      const registroSaldo = {
        _id: 'saldo-anterior',
        descripcion: 'Saldo mes anterior',
        monto: acumulado,
        fecha: fechaInicio,
        categoria: 'Saldo',
        tipoFlujo: 'Financiero',
        isSaldo: true,
      };

      const ingresosActual = allI.filter(i => {
        const d = new Date(i.fecha);
        return d.getMonth() + 1 === mes && d.getFullYear() === anio;
      });
      const egresosActual = allE.filter(e => {
        const d = new Date(e.fecha);
        return d.getMonth() + 1 === mes && d.getFullYear() === anio;
      });

      setIngresos([registroSaldo, ...ingresosActual]);
      setEgresos(egresosActual);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  useEffect(() => {
    fetchResumen();
  }, [mes, anio]);

  const iniciarEdicion = (reg, tipo) => {
    if (reg.isSaldo) return;
    setEditando({ id: reg._id, tipo });
    setFormEdit({ ...reg });
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setFormEdit({ descripcion: '', monto: 0, fecha: '', categoria: '', tipoFlujo: '' });
  };

  const guardarEdicion = async () => {
    await axios.put(
      `http://localhost:5000/api/${editando.tipo}/${editando.id}`,
      formEdit
    );
    cancelarEdicion();
    fetchResumen();
  };

  const confirmarElim = (id, tipo) => setConfirmacion({ id, tipo });
  const ejecutarElim = async () => {
    await axios.delete(
      `http://localhost:5000/api/${confirmacion.tipo}/${confirmacion.id}`
    );
    setConfirmacion({ id: null, tipo: '' });
    fetchResumen();
  };

  const exportarPDF = async () => {
    const input = document.getElementById('resumen-financiero');
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('Resumen_Financiero.pdf');
  };

  const ingFil = ingresos;
  const egFil = egresos;
  const totIng = ingFil.reduce((a, c) => a + c.monto, 0);
  const totEg = egFil.reduce((a, c) => a + c.monto, 0);
  const balance = totIng - totEg;

  return (
    <div className="p-6" id="resumen-financiero">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Resumen Financiero</h1>
        <button onClick={exportarPDF} className="bg-blue-600 text-white px-4 py-2 rounded">
          Exportar PDF
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <select
          value={mes}
          onChange={e => setMes(parseInt(e.target.value))}
          className="border rounded px-3 py-2"
        >
          {['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map((mName, idx) => (
            <option key={idx+1} value={idx+1}>{mName}</option>
          ))}
        </select>
        <select
          value={anio}
          onChange={e => setAnio(parseInt(e.target.value))}
          className="border rounded px-3 py-2"
        >
          {[2022,2023,2024,2025].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="bg-yellow-100 text-yellow-800 p-3 rounded mb-6">
        Saldo mes anterior: ${formatoMXN(saldoAnterior)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-100 p-4 rounded">
          <p>Ingresos</p>
          <p className="text-xl font-bold">${formatoMXN(totIng)}</p>
        </div>
        <div className="bg-red-100 p-4 rounded">
          <p>Egresos</p>
          <p className="text-xl font-bold">${formatoMXN(totEg)}</p>
        </div>
        <div className={`p-4 rounded shadow ${balance >= 0 ? 'bg-green-200 text-green-900' : 'bg-orange-200 text-orange-900'}`}> 
          <p>Balance</p>
          <p className="text-xl font-bold">${formatoMXN(balance)}</p>
        </div>
      </div>

      {editando && (
        <div className="bg-yellow-50 p-4 rounded mb-6">
          <h2 className="font-semibold mb-2">Editando {editando.tipo}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <input type="date" value={formEdit.fecha.split('T')[0]} onChange={e => setFormEdit({ ...formEdit, fecha: e.target.value })} className="border rounded px-2 py-1" />
            <input type="text" value={formEdit.descripcion} onChange={e => setFormEdit({ ...formEdit, descripcion: e.target.value })} placeholder="Descripción" className="border rounded px-2 py-1" />
            <input type="number" value={formEdit.monto} onChange={e => setFormEdit({ ...formEdit, monto: parseFloat(e.target.value) })} className="border rounded px-2 py-1" />
            <input type="text" value={formEdit.categoria} onChange={e => setFormEdit({ ...formEdit, categoria: e.target.value })} placeholder="Categoría" className="border rounded px-2 py-1" />
            <input type="text" value={formEdit.tipoFlujo} onChange={e => setFormEdit({ ...formEdit, tipoFlujo: e.target.value })} placeholder="Tipo Flujo" className="border rounded px-2 py-1" />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={guardarEdicion} className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
            <button onClick={cancelarEdicion} className="bg-gray-300 px-4 py-2 rounded">Cancelar</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[{ titulo: 'Ingresos', data: ingFil, tipo: 'ingresos' }, { titulo: 'Egresos', data: egFil, tipo: 'egresos' }].map(({ titulo, data, tipo }) => (
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
                {data.map(r => (
                  <tr key={r._id} className="border-b">
                    <td className="px-3 py-2">{format(new Date(r.fecha), 'dd/MM/yyyy')}</td>
                    <td className="px-3 py-2">{r.descripcion}</td>
                    <td className="px-3 py-2">{r.categoria}</td>
                    <td className="px-3 py-2">{r.tipoFlujo}</td>
                    <td className="px-3 py-2">${formatoMXN(r.monto)}</td>
                    <td className="px-3 py-2 flex gap-2">
                      {!r.isSaldo && (
                        <>
                          <button onClick={() => iniciarEdicion(r, tipo)} className="text-blue-600 hover:underline">
                            <PencilIcon className="h-4 w-4 inline" />
                          </button>
                          <button onClick={() => confirmarElim(r._id, tipo)} className="text-red-600 hover:underline">
                            <TrashIcon className="h-4 w-4 inline" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {confirmacion.id && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md max-w-sm w-full">
            <div className="flex items-center gap-2 mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold">¿Estás seguro?</h3>
            </div>
            <p className="mb-4">Esta acción no se puede deshacer.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmacion({ id: null, tipo: '' })} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
              <button onClick={ejecutarElim} className="px-4 py-2 bg-red-600 text-white rounded">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
