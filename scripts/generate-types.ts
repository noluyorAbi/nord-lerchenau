/**
 * Typen aus der Payload-Konfiguration erzeugen.
 *
 * `payload generate:types` laeuft in diesem Projekt nicht: die CLI startet
 * einen Node-Worker, und der loest die erweiterungslosen Importe der
 * Konfiguration nicht auf (ERR_MODULE_NOT_FOUND auf payload/collections/Events).
 * Bun loest sie auf, deshalb wird die Erzeugung hier direkt aufgerufen.
 *
 *   bun run payload:generate-types
 */
// Tiefer Pfad statt Paketimport: payload exportiert seine bin-Dateien nicht.
import { generateTypes } from "../node_modules/payload/dist/bin/generateTypes.js";

import config from "../payload.config";

await generateTypes(await config);
process.exit(0);
