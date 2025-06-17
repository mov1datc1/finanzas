import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Ingresos from "./pages/Ingresos";
import Egresos from "./pages/Egresos";
import ResumenFinanciero from "./pages/ResumenFinanciero";
import KPIsFinancieros from "./pages/KPIsFinancieros";
import TareasAdmin from "./pages/TareasAdmin";
import FlujoDeCaja from "./pages/FlujoDeCaja";
import Login from "./pages/Login";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <Router>
      {loggedIn && <Sidebar />}

      <div className={loggedIn ? "ml-60 p-6 w-full bg-gray-100 min-h-screen" : ""}>
        <Routes>
          {/* Login */}
          <Route
            path="/login"
            element={<Login onLogin={() => setLoggedIn(true)} />}
          />

          {/* Root */}
          <Route
            path="/"
            element={
              loggedIn
                ? <Navigate to="/dashboard" replace />
                : <Navigate to="/login" replace />
            }
          />

          {/* Rutas privadas */}
          {loggedIn && (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ingresos" element={<Ingresos />} />
              <Route path="/egresos" element={<Egresos />} />
              <Route path="/resumen" element={<ResumenFinanciero />} />
              <Route path="/flujo" element={<FlujoDeCaja />} />
             
              <Route path="/tareas-admin" element={<TareasAdmin />} />
              <Route path="/kpis" element={<KPIsFinancieros />} />
            </>
          )}

          {/* Catch-all */}
          <Route
            path="*"
            element={
              loggedIn
                ? <Navigate to="/dashboard" replace />
                : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
