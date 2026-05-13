const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const todoRoutes = require('./routes/todos');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/todos', todoRoutes);

//-----------comment them if we need to use 2 vm
//if only one vm uncomment these (Vite builds to 'dist/', NOT 'build/')

// app.use(express.static(path.join(__dirname, "../frontend/dist")));

// app.use((req, res) => {
//   res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
// });

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
