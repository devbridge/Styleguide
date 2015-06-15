var exports = module.exports = {};

exports.mapCategory = function ( obj ) {
  obj.category = this;
  return obj;
};

exports.filterOutDeleted = function ( obj ) {
  return !obj.isDeleted;
};

exports.duplicateComparator = function ( a, b ) {
  return a.id - b.id;
};

exports.filterOutById = function ( obj ) {
  if ( obj.id === this ) {
    return obj;
  }
};

exports.convertToNumber = function ( obj ) {
	return Number(obj);
};

exports.filterOutNotVars = function ( obj ) {
	return obj.search(/(?=\$)[\d\D]/) === 0;
};