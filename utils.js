Array.prototype.sortBy = function (f) {
  return _.sortBy(this, f);
};

Array.prototype.distinct = function () {
  return _.uniq(this);
};

Array.prototype.sift = function () {
  return this.filter(p => p !== undefined && p !== null);
};

Array.prototype.flatten = function () {
  return _.flatten(this);
};

Array.prototype.partition = function (f) {
  return [this.filter(f), this.filter(x => !f(x))];
};

String.prototype.contains = function (s) {
  return this.indexOf(s) >= 0;
};

Promise.prototype.concat = function () {
  return this.then(xs => Promise.all(xs));
};

function beforeLastSlash(s) {
  const lastSlash = s.lastIndexOf("/");
  return lastSlash < 0 ? s : s.substring(0, lastSlash);
}

function afterLastSlash(s) {
  const lastSlash = s.lastIndexOf("/");
  return s.substring(lastSlash + 1);
}
