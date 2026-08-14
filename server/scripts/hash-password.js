const bcrypt = require("bcryptjs");

const password = process.argv[2];

if(!password){
  console.error('Uso: npm run hash-password -- "tu-contraseña"');
  process.exit(1);
}

bcrypt.hash(password, 10).then(hash => {
  console.log("\nCopia este valor en AUTH_PASSWORD_HASH (variable de entorno):\n");
  console.log(hash);
  console.log("");
});
