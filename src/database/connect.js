const mongoose = require('mongoose');

// Credenciais
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

mongoose.set('strictQuery', true);

const mongooseConnection = () => {
  mongoose
    .connect(
      `mongodb+srv://${dbUser}:${dbPassword}@authnodejs.jqkt1tj.mongodb.net/database?retryWrites=true&w=majority`,
    )
    .then(() => {
      console.log('Conexão efetuada com sucesso!');
    })
    .catch((err) => console.log(err));
};

module.exports = mongooseConnection;
