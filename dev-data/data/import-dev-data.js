const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Tour = require('./../../Models/tourModel');

dotenv.config({ path: './../../config.env' });
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
  })
  .catch((err) => console.log(err));
//READ JSON FILE
const tours = JSON.parse(fs.readFileSync('tours.json', 'utf-8'));

//import data into db

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data Loded');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

//Delete all data from collection
const deletedata = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data Deleted');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
console.log(process.argv);

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deletedata();
}
