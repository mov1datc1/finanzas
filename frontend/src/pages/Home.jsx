import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 px-4">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">
        Bienvenido a Movida Finanzas 2025
      </h1>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-4 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          📊 Ver Dashboard
        </button>

        <button
          onClick={() => navigate("/ingresos")}
          className="px-6 py-4 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
        >
          ➕ Registrar Ingreso
        </button>

        <button
          onClick={() => navigate("/egresos")}
          className="px-6 py-4 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
        >
          ➖ Registrar Egreso
        </button>
      </div>
    </div>
  );
}
