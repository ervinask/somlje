const express = require('express');
const cors = require('cors');

const usersRoutes = require('./routes/v1/users');
const wineRoutes = require('./routes/v1/wines');
const collectionRoutes = require('./routes/v1/collection');

const { serverPort } = require('./config');

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', async (req, res) => res.send({ msg: 'Server is running' }));

app.use('/v1/users', usersRoutes);
app.use('/v1/wines', wineRoutes);
app.use('/v1/my-wines', collectionRoutes);

app.listen(serverPort, () => {
  console.log(`Server is running on port ${serverPort}`);
});
