function Map() {
    var obj = {};
    this.put = function(key, value) {
        obj[key] = value;
    };

    this.get = function(key) {
        return obj[key];
    };

    this.clear = function() {
        obj = {};
    };

    this.keys = function() {
        var keys = [];
        for(var key in obj) {
            keys.push(key);
        }

        return keys;
    };

    this.values = function() {
        var values = [];
        for(var key in obj) {
            if(obj[key]) {
                values.push(obj[key]);
            }
        }

        return values;
    };

    this.remove = function(key) {
        if(key in obj) {
            delete obj[key];
        }
    };

    this.size = function() {
        var count = 0;
        for(var key in obj) {
            count++;
        }
        return count;
    };

    return this;
}