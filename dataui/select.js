var SORT_VAL = 1;
var SORT_TEXT = 2;
var selectMap = new Map();

/**
 * 创建Select对象，并扩展一些属性和方法
 * @param id      Select的ID属性值
 * @param setting Select的配置信息，包括如下信息
 *                id          Select的ID属性值
 *                superSelect 此Select的上级Select ID值
 *                related     此Select的相关Select ID值
 *                sortType    Select的排序类型：SORT_VAL 按Option的value属性值排序， SORT_TEXT ，按Option的文本值排序
 *                url         填充Select内容的url字符串
 *                urlData     url字符串需要传递的参数值
 *                optionValue 填充Select时，对应的Option Value属性值
 *                optionText  填充Select时，对应的Option 文本值
 *
 */
function Select(id, setting) {
    var obj = document.getElementById(id);
    if(!obj) {
        return null;
    }

    obj.init = function(setting) {
        obj.map = new Map(); //用于存储数据的Map对象
        if(setting) {
            obj.superSelect = setting.superSelect;
            obj.related = setting.related;
            obj.sortType = setting.sortType;
            obj.url = setting.url;
            obj.urlData = setting.urlData;
            obj.optionValue = setting.optionValue;
            obj.optionText = setting.optionText;

            obj.subSelect = setting.subSelect ? $S({
                id : setting.subSelect,
                url : setting.subUrl,
                urlData : setting.subUrlData,
                related : setting.subRelated,
                optionValue : setting.subOptionValue,
                optionText : setting.subOptionText,
                paramName : setting.subParamName,
                superSelect : obj.id,
                sortType : setting.subSortType
            }) : null;  // 此Select的下级Select

            if(obj.subSelect) {
                obj.subMap = obj.subMap ? obj.subMap : new Map();
            }
        }

        if(obj.related) {
            obj.ondblclick = function() {
                leftToRight(id, obj.related, obj.sortType);
            };
            $S(obj.related).ondblclick = function() {
                rightToLeft(obj.related, id, obj.sortType);
            }
        }

        if(obj.url) {
            $.getJSON(obj.url, obj.data, function(data) {
                if(! (data && data.length > 0)) {
                    return null
                }
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

    obj.init(setting);

    obj.values = function(sp) {
        return $A(obj.options).find('value').join(sp || ',');
    };

    obj.texts = function(sp) {
        return $A(obj.options).find('text').join(sp || ',');
    };

    obj.indexOfVal = function(value) {
        var op = $A(obj.options).find('value', value);
        return op ? op.index : -1;
    };

    obj.indexOfText = function(text) {
        var op = $A(obj.options).find('text', text);
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
            $A(obj.options).each(function(option) {
                if(option.selected === true) {
                    option.selected = false;
                }
            });
        } else {
            obj.options[0].selected = true;
        }
    };

    obj.selectedIndexs = function(idx) {
        if(inScope(idx, 0, obj.options.length)) {
            obj.options[idx].selected = true;
        } else if (isArray(idx)) {
            for(var i = 0; i < idx.length; i++) {
                obj.options[idx[i]].selected = true;
            }
        }

        return $A(obj.options).find('selected', true, 'index').join();
    };

    obj.selectedValues = function() {
        return $A(obj.options).find('selected', true, 'value').join();
    };

    obj.selectedTexts = function() {
        return $A(obj.options).find('selected', true, 'text').join();
    };

    obj.selectedOptions = function() {
        return $A(obj.options).find('selected', true, 'all').join();
    };

    obj.val = function() {
        if(arguments.length === 0) {
            return obj.selectedValues();
        } else if (isNumber(arguments[0])) {
            if(inScope(arguments[0], 0, obj.options.length)) {
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
                $A(obj.options).each(function(option) {
                    if(option.value === value && option.text === text) {
                        obj.ondel(option);
                        obj.remove(option.index);
                        return false;
                    }
                });
            } else if(value) {
                $A(obj.options).each(function(option) {
                    if(option.value === value) {
                        obj.ondel(option);
                        obj.remove(option.index);
                        return false;
                    }
                });
            } else if (text) {
                $A(obj.options).each(function(option) {
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
                $A(a_object).each(function(object, i) {
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
            $A(obj.options).each(function(option) {
                map.put(option.value, {value:option.value, text:option.text});
                values.push(option.value);
            });
        } else if (sortType == SORT_TEXT) {
            $A(obj.options).each(function(option) {
                map.put(option.text, {value:option.value, text:option.text});
                values.push(option.text);
            });
        }

        values.sort(function(a, b) {
            return a.localeCompare(b);
        });
        $A(values).each(function(object, i) {
            var option = map.get(values[i]);
            obj.options[i].value = option.value;
            obj.options[i].text = option.text;
        });
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
    $A(array).each(function(value) {
        rightSelect.val(value);
    });
}

function allToLeft(right, left, sortType) {
    allToRight(right, left, sortType);
}

/**
 * 创建Select对象，此对象如果存在，则不会创建
 * @param setting 如果是字符串，则为Select的ID，如果是对象，则为Select的配置信息，应包含id属性
 * @return 返回经过扩展的Select对象
 */
var $S = function(setting) {
    var obj, id;
    if(isString(setting)) {
        id = setting;
        setting = null;
    } else if (haveProperty(setting, 'id')) {
        id = setting.id;
    }
    obj = selectMap.get(id);
    if(obj && isObject(setting)) {
        obj.init(setting);
    } else {
        obj = new Select(id, setting);
        if(obj) {
            selectMap.put(obj.id, obj);
        }
    }
    return obj;
};