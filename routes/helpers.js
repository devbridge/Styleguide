var exports = module.exports = {};

var isNumeric = function(num) {
	return !isNaN(num);
};

exports.mapCategory = function(obj) {
	obj.category = this;
	return obj;
};

exports.filterOutDeleted = function(obj) {
	return !obj.isDeleted;
};

exports.duplicateComparator = function(a, b) {
	return a.id - b.id;
};

exports.filterOutById = function(obj) {
	if (obj.id == this) {
		return obj;
	}
};

exports.convertToWeightObject = function(obj) {
	if (isNumeric(obj)) {
		return {
			weight: Number(obj),
			italic: false
		};
	}

	return {
		weight: parseInt(obj),
		italic: true
	};
};

exports.filterOutNotVars = function(obj) {
	return obj.search(/(?=\$)[\d\D]/) === 0;
};