// src/components/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-screen w-60 bg-gray-800 text-white flex flex-col py-6 px-4 fixed">
      <h2 className="text-2xl font-bold mb-6">💼 Finanzas</h2>

      <nav className="flex flex-col gap-2">
        <Link
          to="/dashboard"
          className={`px-3 py-2 rounded ${
            isActive("/dashboard") ? "bg-gray-700 font-semibold" : "hover:bg-gray-700"
          }`}
        >
          🏠 Dashboard
        </Link>

        <Link
          to="/tareas-admin"
          className={`px-3 py-2 rounded ${
            isActive("/tareas-admin") ? "bg-gray-700 font-semibold" : "hover:bg-gray-700"
          }`}
        >
          ✅ Tareas Administrativas
        </Link>

        <Link
          to="/ingresos"
          className={`px-3 py-2 rounded ${
            isActive("/ingresos") ? "bg-gray-700 font-semibold" : "hover:bg-gray-700"
          }`}
        >
          💰 Ingresos
        </Link>

        <Link
          to="/egresos"
          className={`px-3 py-2 rounded ${
            isActive("/egresos") ? "bg-gray-700 font-semibold" : "hover:bg-gray-700"
          }`}
        >
          🧾 Egresos
        </Link>

        <Link
          to="/resumen"
          className={`px-3 py-2 rounded ${
            isActive("/resumen") ? "bg-gray-700 font-semibold" : "hover:bg-gray-700"
          }`}
        >
          🔄 Flujo de Caja
        </Link>

        <Link
          to="/flujo"
          className={`px-3 py-2 rounded ${
            isActive("/flujo") ? "bg-gray-700 font-semibold" : "hover:bg-gray-700"
          }`}
        >
          📊 Resumen Financiero
        </Link>

        <Link
          to="/kpis"
          className={`px-3 py-2 rounded ${
            isActive("/kpis") ? "bg-gray-700 font-semibold" : "hover:bg-gray-700"
          }`}
        >
          📈 KPIs Financieros
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
