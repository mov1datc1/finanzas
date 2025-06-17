// backend/routes/estadoResultados.route.js (fragmento a añadir)
const { getEstadoMensual } = require("../controllers/estadoResultadosMensual.controller");
router.get("/estado-resultados/mensual/:anio", getEstadoMensual);