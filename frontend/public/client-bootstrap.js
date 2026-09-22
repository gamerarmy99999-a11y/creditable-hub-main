const devPorts = new Set(["3000", "3001", "3002", "4173", "5173", "5174"]);
const clientEntry = devPorts.has(String(window.location.port))
  ? "/src/client.js"
  : "/assets/index.js";
import(clientEntry);
