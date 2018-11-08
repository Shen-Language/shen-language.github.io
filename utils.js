Array.prototype.sortBy = function (f) {
    return _.sortBy(this, f);
};

Array.prototype.distinct = function () {
    return _.uniq(this);
};

Array.prototype.flatten = function () {
    return _.flatten(this);
};

Array.prototype.partition = function (f) {
	return _.partition(f);
};

String.prototype.contains = function (s) {
    return this.indexOf(s) >= 0;
};

String.prototype.beforeLastSlash = function () {
    const lastSlash = this.lastIndexOf("/");
    return lastSlash < 0 ? this : this.substring(0, lastSlash);
};

String.prototype.afterLastSlash = function () {
    const lastSlash = this.lastIndexOf("/");
    return this.substring(lastSlash + 1);
};

Promise.prototype.concat = function () {
	return this.then(x => Promise.all(x));
};
