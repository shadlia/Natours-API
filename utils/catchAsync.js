module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); //(err) => next(err) will throw an err and then express will handle that error by using the global error handler we has in app.js
  };
};
