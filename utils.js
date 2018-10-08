Array.prototype.sortBy = function (f) {
    return _.sortBy(this, f);
};

Array.prototype.distinctBy = function (f) {
    const seen = {};
    return this.filter(x => {
        const k = f(x);
        return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    });
};

String.prototype.contains = function (s) {
    return this.indexOf(s) >= 0;
};
