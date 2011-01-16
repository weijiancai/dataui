var SORT_VAL = 1;
var SORT_TEXT = 2;
function Select(id, setting) {
    var obj = document.getElementById(id);
    if(!obj) {
        alert('select id is not correct');
    }
    var options = obj.options;
    var relatedObj;
    this.obj = obj;

    function each(callback) {
        var array = [], returnValue;
        for(var i = 0; i < options.length; i++) {
            returnValue = callback(options[i], i);
            if(returnValue === false) {
                break;
            } else if (returnValue !== null) {
                array.push(returnValue);
            }
        }
        return array;
    }

    this.each = each;

    this.size = function() {
        return options.length;
    };

    this.values = function(sp) {
        sp = sp || ',';
        return each(function(option) {
            return option.value;
        }).join(sp);
    };

    this.texts = function(sp) {
        sp = sp || ',';
        return each(function(option) {
            return option.text;
        }).join(sp);
    };

    this.indexOfVal = function(value) {
        var op;
        each(function(option) {
            if(option.value === value) {
                op = option;
                return false;
            }
        });

        return op ? op.index : -1;
    };

    this.indexOfText = function(text) {
        var op;
        each(function(option) {
            if(option.text === text) {
                op = option;
                return false;
            }
        });

        return op ? op.index : -1;
    };

    this.exists = function(value, text) {
        if(value && text) {
           return this.indexOfVal(value) > -1 && this.indexOfText(text) > -1;
        } else if (value) {
            return this.indexOfVal(value) > -1
        } else if (text) {
            return this.indexOfText(text) > -1;
        }
        return false;
    };

    this.empty = function() {
        options.length = 0;
    };

    this.clearSelect = function() {
        if(obj.multiple === true) {
            each(function(option) {
                if(option.selected === true) {
                    option.selected = false;
                }
            });
        } else {
            options[0].selected = true;
        }
    };

    this.selectedIndex = function(idx) {
        if(typeof idx === 'number' && idx >=0 && idx < options.length) {
            options[idx].selected = true;
        } else if (typeof idx === 'object' && idx.splice) {
            for(var i = 0; i < idx.length; i++) {
                options[idx[i]].selected = true;
            }
        }
        return each(function(option) {
            if(option.selected === true) {
                return option.index;
            } else {
                return null;
            }
        }).join();
    };

    this.selectedValues = function(values) {
        return each(function(option) {
            if(option.selected === true) {
                return option.value;
            } else {
                return null;
            }
        }).join();
    };

    this.selectedTexts = function() {
        return each(function(option) {
            if(option.selected === true) {
                return option.text;
            } else {
                return null;
            }
        }).join();
    };

    this.selectedOptions = function() {
        return each(function(option) {
            if(option.selected === true) {
                return option;
            } else {
                return null;
            }
        });
    };

    this.val = function() {
        if(arguments.length === 0) {
            return this.selectedValues();
        } else if (typeof arguments[0] === 'number') {
            if(arguments[0] >= 0 && arguments[0] < options.length) {
                this.selectedIndex(arguments[0]);
            }
        } else {
            var idx = this.indexOfVal(arguments[0]);
            if(idx > -1) {
                this.selectedIndex(idx);
            }
        }
    };

    this.text = function() {
        if(arguments.length === 0) {
            return this.selectedTexts();
        } else {
            var idx = this.indexOfText(arguments[0]);
            if(idx > -1) {
                this.selectedIndex(idx)
            }
        }
        return this;
    };

    this.append = function(value, text) {
        if(this.exists(value, text)) {
            return;
        }
        var option;
        if(value && text) {
            option = new Option(text, value);
        } else if (value) {
            option = new Option(value, value);
        } else if (text) {
            option = new Option(text, text);
        }
        options.add(option);
    };

    this.remove = function(value, text) {
        if(typeof value === 'number' && value >= 0 && value < options.length) {
            obj.remove(value);
        } else if (this.exists(value, text)) {
            if(value && text) {
                each(function(option) {
                    if(option.value === value && option.text === text) {
                        obj.remove(option.index);
                        return false;
                    }
                });
            } else if(value) {
                each(function(option) {
                    if(option.value === value) {
                        obj.remove(option.index);
                        return false;
                    }
                });
            } else if (text) {
                each(function(option) {
                    if(option.text === text) {
                        obj.remove(option.index);
                        return false;
                    }
                });
            }
        }
    };

    this.sort = function(sort) {
        var map = new Map(), values = [];
        if (sort == SORT_VAL) {
            each(function(option) {
                map.put(option.value, {value:option.value, text:option.text});
                values.push(option.value);
            });
        } else if (sort == SORT_TEXT) {
            each(function(option) {
                map.put(option.text, {value:option.value, text:option.text});
                values.push(option.text);
            });
        }

        values.sort(function(a, b) {
            return a.localeCompare(b);
        });
        for (var i = 0; i < values.length; i++) {
            var option = map.get(values[i]);
            options[i].value = option.value;
            options[i].text = option.text;
        }
    };

    this.load = function(data, value, text) {
        this.empty();
        var i;
        if(data) {
            if(value && text) {
                for(i = 0; i < data.length; i++) {
                    this.append(data[i][value], data[i][text]);
                }
            } else if (value) {
                for(i = 0; i < data.length; i++) {
                    this.append(data[i][value], data[i][value]);
                }
            } else if (text) {
                for(i = 0; i < data.length; i++) {
                    this.append(data[i][text], data[i][text]);
                }
            } else {
                for(i = 0; i < data.length; i++) {
                    this.append(data[i], data[i]);
                }
            }
        }
    };

    if(setting) {
        if(setting.related) {
            relatedObj = document.getElementById(setting.related);
            var sort = setting.sort ? settings.sort : SORT_TEXT;
            obj.ondblclick = function() {
                leftToRight(id, setting.related, sort);
            };
            relatedObj.ondblclick = function() {
                rightToLeft(setting.related, id, sort);
            }
        }
        if(setting.url) {
            var parent = this;
            if(setting.data) {
                $.getJSON(setting.url, setting.data, function(data) {
                    callback(data, parent);
                });
            } else {
                $.getJSON(setting.url, function(data) {
                    callback(data, parent);
                });
            }
        }
    }

    function callback(data, parent) {
        for(var i = 0; i < data.length; i++) {
            if(setting.optionValue && setting.optionText) {
                parent.append(data[i][setting.optionValue], data[i][setting.optionText]);
            } else if (setting.optionValue) {
                parent.append(data[i][setting.optionValue], data[i][setting.optionValue]);
            } else if (setting.optionText) {
                parent.append(data[i][setting.optionText], data[i][setting.optionText]);
            } else {
                parent.append(data[i], data[i]);
            }
        }
        if(setting.sort) {
            parent.sort(setting.sort);
        }
    }

    return this;
}

function leftToRight(left, right, sort) {
    var leftSelect = $S(left);
    var rightSelect = $S(right);

    var options = leftSelect.selectedOptions();
    var values = [], i, idx;
    for(i = 0; i < options.length; i++) {
        rightSelect.append(options[i].value, options[i].text);
        leftSelect.remove(options[i].index);
        values.push(options[i].value);
    }

    if(sort) {
        rightSelect.sort(sort);
    }
    rightSelect.clearSelect();
    for(i = 0; i < values.length; i++) {
        idx = rightSelect.indexOfVal(values[i]);
        rightSelect.selectedIndex(idx);
    }
}

function rightToLeft(right, left, sort) {
    leftToRight(right, left, sort);
}

function allToRight(left, right, sort) {
    var leftSelect = document.getElementById(left);
    var rightSelect = $S(right);

    var options = leftSelect.options;
    for(var i = 0; i < options.length; i++) {
        rightSelect.append(options[i].value, options[i].text);
    }
    leftSelect.length = 0;
    if(sort) {
        rightSelect.sort(sort);
    }
    rightSelect.each(function(option) {
        option.selected = true;
    });
}

function allToLeft(right, left, sort) {
    allToRight(right, left, sort);
}

var $S = function(id, setting) {
    return new Select(id, setting);
};