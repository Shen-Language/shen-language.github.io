Array.prototype.sortBy = function (f) {
	return _.sortBy(this, f);
};

String.prototype.contains = function (s) {
	return this.indexOf(s) >= 0;
};
