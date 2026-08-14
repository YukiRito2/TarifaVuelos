require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

async function main(){
  const databaseUrl = process.env.DATABASE_URL;
  if(!databaseUrl){
    console.error("Falta la variable de entorno DATABASE_URL");
    process.exit(1);
  }

  const schemaPath = path.join(__dirname, "..", "db", "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes("localhost") ? false : { rejectUnauthorized: false }
  });

  try{
    await pool.query(sql);
    console.log("Esquema aplicado correctamente.");
  }finally{
    await pool.end();
  }
}

main().catch(err => {
  console.error("Error aplicando el esquema:", err);
  process.exit(1);
});
