// Envuelve un handler async para que cualquier rechazo de promesa caiga
// en next(err) y llegue al errorHandler central, en vez de quedar como
// una "unhandled promise rejection" silenciosa.
module.exports = function asyncHandler(fn){
  return function(req, res, next){
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
