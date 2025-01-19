//order is impoportant
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Should be the first thing in our application

////Handle uncaught exception Promises in the whole application ex:variables not defined
process.on('uncaughtException', (err) => {
  console.log('uncaughtException : Shuting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1); //shut down application
  });
});

const app = require('./app');
dotenv.config({ path: './config.env' });

//1)DataBase
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((conn) => {
    //console.log(conn.connections);
    console.log('Connected to database');
  });

//2)Server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App listening on port ${port}...`);
});
//Handle unhandled Rejection Promises in the whole application Ex:DB connection errors
process.on('unhandledRejection', (err) => {
  console.log('UhandledRejection : Shuting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1); //shut down application
  });
});
