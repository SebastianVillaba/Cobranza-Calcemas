// dbHandler.js
import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const config = {
  server: process.env.DB_IP_INTERNA,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  requestTimeout: 300000, // Timeout de 60 segundos para requests
  options: {
    encrypt: false,
    trustServerCertificate: true,
    dateFormat: 'dmy'
  },
};


let poolPromise;

function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config)
      .connect()
      .then((pool) => {
        console.log("Conectado a la base de datos");
        return pool;
      })
      .catch((err) => {
        console.error("Error al conectar a la base de datos:", err);
        throw err;
      });
  }
  return poolPromise;
}

export async function executeRequest({
  query,
  inputs = [],
  outputs = [],
  isStoredProcedure = false,
  timeout = 120000, // Timeout por defecto de 120 segundos
}) {
  //console.log("Parámetros enviados al SP:", inputs); <--  PARA VER QUE INPUTS ESTOY ENVIANDO
  try {
    const pool = await getPool();
    const request = pool.request();
    request.timeout = timeout; // Aplicar timeout configurado

    // Agregar parámetros de entrada
    inputs.forEach(({ name, type, value }) => {
      request.input(name, type, value);
    });

    // Agregar parámetros de salida
    outputs.forEach(({ name, type }) => {
      request.output(name, type);
    });

    const result = isStoredProcedure
      ? await request.execute(query)
      : await request.query(query);


    return result;
  } catch (error) {
    console.error("Error en executeRequest:", error);
    throw error;
  }
}
