var SORT_VAL = 1;
var SORT_TEXT = 2;
var selectMap = new Map();

function Select(id, setting) {
    var obj = document.getElementById(id);
    if(!obj) {
        return null;
    }

    obj.map = new Map(); //用于存储数据的Map对象
    obj.superSelect = setting ? setting.superSelect : null; // 此Select的上级Select
    obj.related = setting ? setting.related : null;
    obj.relatedSelect = (setting && setting.related) ? $S(setting.related) : null;  // 此Select的相关Select
    obj.sortType = (setting && setting.sortType) ? setting.sortType : SORT_TEXT;
    obj.url = setting ? setting.url : null;
    obj.data = setting ? setting.data : null;
    obj.optionValue = setting ? setting.optionValue : 'value';
    obj.optionText = setting ? setting.optionText : 'text';
    obj.subUrl = setting ? setting.subUrl : null;
    obj.subData = setting ? setting.subData : null;
    obj.subRelated = setting ? setting.subRelated : null;
    obj.subParamName = setting ? setting.subParamName : null;
    obj.subOptionValue = setting ? setting.subOptionValue : null;
    obj.subOptionText = setting ? setting.subOptionText : null;
    obj.subMap = obj.subMap ? obj.subMap : new Map();
    obj.subSelect = (setting && setting.subSelect) ? $S(setting.subSelect, {
        url : obj.subUrl,
        data : obj.subData,
        related : obj.subRelated,
        optionValue : obj.subOptionValue,
        optionText : obj.subOptionText,
        paramName : obj.subParamName,
        superSelect : id
    }) : null;  // 此Select的下级Select

    obj.values = function(sp) {
        sp = sp || ',';
        return each(obj.options, function(option) {
            return option.value;
        }).join(sp);
    };

    obj.texts = function(sp) {
        sp = sp || ',';
        return each(obj.options, function(option) {
            return option.text;
        }).join(sp);
    };

    obj.indexOfVal = function(value) {
        var op;
        each(obj.options, function(option) {
            if(option.value === value) {
                op = option;
                return false;
            }
        });

        return op ? op.index : -1;
    };

    obj.indexOfText = function(text) {
        var op;
        each(obj.options, function(option) {
            if(option.text === text) {
                op = option;
                return false;
            }
        });

        return op ? op.index : -1;
    };

    obj.exists = function(value, text) {
        if(value && text) {
           return this.indexOfVal(value) > -1 && this.indexOfText(text) > -1;
        } else if (value) {
            return this.indexOfVal(value) > -1
        } else if (text) {
            return this.indexOfText(text) > -1;
        }
        return false;
    };

    obj.empty = function() {
        obj.options.length = 0;
    };

    obj.clearSelect = function() {
        if(obj.multiple === true) {
            each(obj.options, function(option) {
                if(option.selected === true) {
                    option.selected = false;
                }
            });
        } else {
            obj.options[0].selected = true;
        }
    };

    obj.selectedIndexs = function(idx) {
        if(typeof idx === 'number' && idx >=0 && idx < obj.options.length) {
            obj.options[idx].selected = true;
        } else if (typeof idx === 'object' && idx.splice) {
            for(var i = 0; i < idx.length; i++) {
                obj.options[idx[i]].selected = true;
            }
        }
        return each(obj.options, function(option) {
            if(option.selected === true) {
                return option.index;
            } else {
                return null;
            }
        }).join();
    };

    obj.selectedValues = function(values) {
        return each(obj.options, function(option) {
            if(option.selected === true) {
                return option.value;
            } else {
                return null;
            }
        }).join();
    };

    obj.selectedTexts = function() {
        return each(obj.options, function(option) {
            if(option.selected === true) {
                return option.text;
            } else {
                return null;
            }
        }).join();
    };

    obj.selectedOptions = function() {
        return each(obj.options, function(option) {
            if(option.selected === true) {
                return option;
            } else {
                return null;
            }
        });
    };

    obj.val = function() {
        if(arguments.length === 0) {
            return obj.selectedValues();
        } else if (typeof arguments[0] === 'number') {
            if(arguments[0] >= 0 && arguments[0] < obj.options.length) {
                obj.selectedIndexs(arguments[0]);
            }
        } else {
            var idx = obj.indexOfVal(arguments[0]);
            if(idx > -1) {
                obj.selectedIndexs(idx);
            }
        }
    };

    obj.text = function() {
        if(arguments.length === 0) {
            return obj.selectedTexts();
        } else {
            var idx = obj.indexOfText(arguments[0]);
            if(idx > -1) {
                obj.selectedIndexs(idx);
            }
        }
        return this;
    };

    obj.append = function(value, text, callback) {
        if(obj.exists(value, text)) {
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

        var superValue;
        if(obj.superSelect) {
            var superSelect = $S(obj.superSelect);
            superValue = obj.map.get(option.value);
            if(!superValue) {
                obj.map.put(option.value, superSelect.value);
            }
        }
        if(callback) {
            callback(option, superValue);
        } else {
            obj.options.add(option);
        }

    };

    obj.del = function(value, text) {
        if(typeof value === 'number' && value >= 0 && value < obj.options.length) {
            obj.ondel(obj.options[value]);
            obj.remove(value);
        } else if (obj.exists(value, text)) {
            if(value && text) {
                each(obj.options, function(option) {
                    if(option.value === value && option.text === text) {
                        obj.ondel(option);
                        obj.remove(option.index);
                        return false;
                    }
                });
            } else if(value) {
                each(obj.options, function(option) {
                    if(option.value === value) {
                        obj.ondel(option);
                        obj.remove(option.index);
                        return false;
                    }
                });
            } else if (text) {
                each(obj.options, function(option) {
                    if(option.text === text) {
                        obj.ondel(option);
                        obj.remove(option.index);
                        return false;
                    }
                });
            }
        }
    };

    obj.ondel = function(option) {
        if(obj.superSelect) {
            var superSelect = $S(obj.superSelect);
            var a_object = superSelect.subMap.get(superSelect.value);
            if(a_object) {
                each(a_object, function(object, i) {
                    if(object[obj.optionValue] === option.value && object[obj.optionText] === option.text) {
                        a_object.splice(i, 1);
                        return false;
                    }
                });
            }
        }
    };

    obj.sort = function(sortType) {
        var map = new Map(), values = [];
        if (sortType == SORT_VAL) {
            each(obj.options, function(option) {
                map.put(option.value, {value:option.value, text:option.text});
                values.push(option.value);
            });
        } else if (sortType == SORT_TEXT) {
            each(obj.options, function(option) {
                map.put(option.text, {value:option.value, text:option.text});
                values.push(option.text);
            });
        }

        values.sort(function(a, b) {
            return a.localeCompare(b);
        });
        for (var i = 0; i < values.length; i++) {
            var option = map.get(values[i]);
            obj.options[i].value = option.value;
            obj.options[i].text = option.text;
        }
    };

    obj.load = function(data, value, text) {
        this.empty();
        var i;
        if(data) {
            if(value && text) {
                for(i = 0; i < data.length; i++) {
                    obj.append(data[i][value], data[i][text]);
                }
            } else if (value) {
                for(i = 0; i < data.length; i++) {
                    obj.append(data[i][value], data[i][value]);
                }
            } else if (text) {
                for(i = 0; i < data.length; i++) {
                    obj.append(data[i][text], data[i][text]);
                }
            } else {
                for(i = 0; i < data.length; i++) {
                    obj.append(data[i], data[i]);
                }
            }
        }
    };

    obj.init = function() {
        if(obj.relatedSelect) {
            obj.ondblclick = function() {
                leftToRight(id, obj.related, obj.sortType);
            };
            obj.relatedSelect.ondblclick = function() {
                rightToLeft(obj.related, id, obj.sortType);
            }
        }

        if(obj.url) {
            $.getJSON(obj.url, obj.data, function(data) {
                for(var i = 0; i < data.length; i++) {
                    if(obj.optionValue && obj.optionText) {
                        obj.append(data[i][obj.optionValue], data[i][obj.optionText]);
                    } else if (obj.optionValue) {
                        obj.append(data[i][obj.optionValue], data[i][obj.optionValue]);
                    } else if (obj.optionText) {
                        obj.append(data[i][obj.optionText], data[i][obj.optionText]);
                    } else {
                        obj.append(data[i], data[i]);
                    }
                }
                if(obj.sortType) {
                    obj.sort(obj.sortType);
                }

                if(obj.subSelect) {
                    loadSubSelect(obj.options[0].value);
                }
            });
        }

        if(obj.subSelect) {
            obj.onchange = function() {
                if(obj.subSelect) {
                    var cache = obj.subMap.get(obj.value);
                    if(cache) {
                        obj.subSelect.load(cache, obj.subOptionValue, obj.subOptionText);
                    } else {
                        loadSubSelect(obj.value);
                    }
                }
            }
        }

        function loadSubSelect(para) {
            var param = {};
            if(obj.subParamName) {
                param[obj.subParamName] = encodeURI(para);
            }
            $.getJSON(obj.subUrl, param, function(json) {
                obj.subSelect.load(json, obj.subOptionValue, obj.subOptionText);
                obj.subMap.put(para, json);
            });
        }
    };

    obj.init();

    return obj;
}

function leftToRight(left, right, sortType) {
    var leftSelect = $S(left);
    var rightSelect = $S(right);

    var options = leftSelect.selectedOptions();
    var values = [], i, idx, isSelect = true;
    for(i = 0; i < options.length; i++) {
        rightSelect.append(options[i].value, options[i].text, function(option, superValue) {
            if(rightSelect.superSelect) {
                var superSelect = $S(rightSelect.superSelect);
                if(superValue && superValue === superSelect.value) {
                    rightSelect.options.add(option);
                } else {
                    isSelect = false;
                }

                var a_data = superSelect.subMap.get(superValue || superSelect.value);
                var obj = {};
                obj[rightSelect.optionValue] = option.value;
                obj[rightSelect.optionText] = option.text;

                a_data.push(obj);
            } else {
                rightSelect.options.add(option);
            }
        });
        leftSelect.del(options[i].index);
        values.push(options[i].value);
    }

    if(sortType) {
        rightSelect.sort(sortType);
    }
    if(isSelect) {
        rightSelect.clearSelect();
        for(i = 0; i < values.length; i++) {
            idx = rightSelect.indexOfVal(values[i]);
            rightSelect.selectedIndexs(idx);
        }
    }
}

function rightToLeft(right, left, sortType) {
    leftToRight(right, left, sortType);
}

function allToRight(left, right, sortType) {
    var leftSelect = $S(left);
    var rightSelect = $S(right);

    var options = leftSelect.options, array = [];
    for(var i = 0; i < options.length; i++) {
        rightSelect.append(options[i].value, options[i].text, function(option, superValue) {
            if(rightSelect.superSelect) {
                var superSelect = $S(rightSelect.superSelect);
                if(superValue && superValue === superSelect.value) {
                    rightSelect.options.add(option);
                } else {
                    isSelect = false;
                }

                var a_data = superSelect.subMap.get(superValue || superSelect.value);
                var obj = {};
                obj[rightSelect.optionValue] = option.value;
                obj[rightSelect.optionText] = option.text;

                a_data.push(obj);
            } else {
                rightSelect.options.add(option);
            }
        });
        array.push(options[i].value);
    }
    leftSelect.length = 0;
    if(leftSelect.superSelect) {
        var superSelect = $S(leftSelect.superSelect);
        var data = superSelect.subMap.get(superSelect.value);
        data.splice(0, data.length);
    }

    if(sortType) {
        rightSelect.sort(sortType);
    }
    each(array, function(value) {
        rightSelect.val(value);
    });
}

function allToLeft(right, left, sortType) {
    allToRight(right, left, sortType);
}

var $S = function(id, setting) {
    var obj = selectMap.get(id);
    if(obj) {
        if(setting) {
            for(var property in setting) {
                obj[property] = setting[property];
            }
            obj.init();
        }
        return obj;
    } else {
        obj = new Select(id, setting);
        selectMap.put(id, obj);
    }
    return obj;
};