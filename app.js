require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
// Banco de dados
const mongooseConnection = require('./src/database/connect');
// Models
const User = require('./src/database/models/User.model');
// Middleware
const checkToken = require('./src/middleware/Users');

const app = express();
const port = 3000;

// Config JSON response
app.use(express.json());

// Public route
app.get('/', (req, res) => {
  res.status(200).json({ msg: 'Bem vindo a nossa API!' });
});

// Private route
app.get('/users/:id', checkToken, async (req, res) => {
  const id = req.params.id;

  // check if user exists
  const user = await User.findById(id, '-password');

  if (!user) {
    return res.status(404).json({ msg: 'Usuário não encontrado!' });
  }

  res.status(200).json({ user });
});

// Busca todos os usuários cadastrados
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({
      msg: 'Usuários buscados com sucesso!',
      users,
    });
  } catch (error) {}
});

// Register User
app.post('/auth/register', async (req, res) => {
  const { name, email, password, confirmpassword } = req.body;

  // Validations
  if (!name) {
    return res.status(422).json({ msg: 'Error, o nome é obrigatório!' });
  }
  if (!email) {
    return res.status(422).json({ msg: 'Error, o email é obrigatório!' });
  }
  if (!password) {
    return res.status(422).json({ msg: 'Error, a senha é obrigatória!' });
  }
  if (password !== confirmpassword) {
    return res.status(422).json({
      msg: 'Error, a senha e a confirmação da senha não estão iguais!',
    });
  }

  // Check if user Exist
  const userExist = await User.findOne({ email: email });

  if (userExist) {
    return res.status(422).json({ msg: 'Error, email já cadastrado!' });
  }

  // Create password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create User
  const user = new User({
    name,
    email,
    password: passwordHash,
  });

  try {
    await user.save();
    res.status(201).json({
      msg: 'Usuário criado com sucesso!',
      user,
    });
  } catch (error) {
    console.log('Error => ', error);
    res.status(500).json({
      msg: 'Aconteceu um erro no servidor, tente novamente mais tarde!',
    });
  }
});

// Login User
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Validations
  if (!email) {
    return res.status(422).json({ msg: 'O email é obrigatório!' });
  }

  if (!password) {
    return res.status(422).json({ msg: 'A senha é obrigatória!' });
  }

  // Check if user exist
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(422).json({ msg: 'Usuário não encontrado!' });
  }

  // Check if password match
  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(422).json({ msg: 'Senha inválida!' });
  }

  // Validação do Token Secret
  try {
    const secret = process.env.SECRET;

    const token = jwt.sign(
      {
        id: user._id,
      },
      secret,
    );

    res.status(200).json({
      msg: 'Autenticação realizada com sucesso!',
      token,
    });
  } catch (err) {
    console.log('Error => ', err);
    res.status(500).json({
      msg: 'Aconteceu algum erro no servidor, tente novamente mais tarde!',
    });
  }
});

// Altera um determinado usuário
app.patch('/users/:id', checkToken, async (req, res) => {
  try {
    const id = req.params.id;

    // check if user exists
    const user = await User.findByIdAndUpdate(id, req.body, { new: true });

    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado!' });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.log('Error => ', err);
    res.status(500).json({
      msg: 'Aconteceu algum erro no servidor, tente novamente mais tarde!',
    });
  }
});

// Deleta um determinado usuário
app.delete('/users/:id', checkToken, async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado!' });
    }

    res.status(200).json({
      msg: 'Usuário deletado com sucesso!',
      user,
    });
  } catch (err) {
    console.log('Error => ', err);
    res.status(500).json({
      msg: 'Aconteceu algum erro no servidor, tente novamente mais tarde!',
    });
  }
});

// Conectando ao banco de dados
mongooseConnection();

// Rodar o servidor
app.listen(port, () => {
  console.log('Servidor rodando!');
  console.log('Acesse => http://localhost:3000/');
});
