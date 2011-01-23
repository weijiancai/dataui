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

    obj.map = new Map(); //用于存储数据的Map对象

    obj.init = function(setting) {
        var thisObj = this;

        if(setting) {
            this.superSelect = setting.superSelect || this.superSelect;
            this.related = setting.related || this.related;
            this.sortType = setting.sortType || this.sortType;
            this.url = setting.url || this.url;
            this.urlData = setting.urlData || this.urlData;
            this.optionValue = setting.optionValue || this.optionValue;
            this.optionText = setting.optionText || this.optionText;
            this.onSuccess = setting.onSuccess || this.onSuccess;

            if(setting.onchange) {
                this.onchange = function() {
                    setting.onchange(thisObj.value);
                };
            }
        }

        if(this.related) {
            this.ondblclick = function() {
                leftToRight(thisObj.id, thisObj.related, thisObj.sortType);
            };
            $S(this.related).ondblclick = function() {
                rightToLeft(thisObj.related, thisObj.id, thisObj.sortType);
            }
        }

        if(this.url) {
            var upKey = this.mapKey; // 记录上一次的url key值
            var mapKey = this.url;  // 记录本次的url key值
            if(this.urlData) {
                $A(this.urlData).each(function(name, value) {
                    mapKey += value;
                });
            }
            var cacheObj = this.map.get(mapKey);
            if(cacheObj) {
                if(upKey) {
                    thisObj.save(upKey);
                }
                thisObj.load(cacheObj);
                thisObj.mapKey = mapKey;
            } else {
                $.post(this.url, this.urlData, function(data) {
                    if(upKey) {
                        thisObj.save(upKey);
                    }
                    thisObj.load(data);
                    thisObj.mapKey = mapKey;

                    if(thisObj.onSuccess) {
                        thisObj.onSuccess(data);
                    }
                }, "json");
            }
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
        this.options.length = 0;
    };

    obj.clearSelect = function() {
        if(this.multiple === true) {
            $A(this.options).each(function(option) {
                if(option.selected === true) {
                    option.selected = false;
                }
            });
        } else if(this.options[0]) {
            this.options[0].selected = true;
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
        return $A(obj.options).find('selected', true, 'all');
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
        var object = value, option, isOption;
        if(isObject(object)) {
            if(object.value && object.text) {  // Option 对象
                value = object.value;
                text = object.text;
                isOption = true;
                //data = object.data;
                //alert("option: " + data);
            } else {
                var ov = this.optionValue, ot = this.optionText;
                var hov = haveProperty(object, this.optionValue);
                var hot = haveProperty(object, this.optionText);
                if(ov && ot && hov && hot) {
                    value = object[ov];
                    text = object[ot];
                } else if(ov && hov) {
                    value = object[ov];
                } else if(ot && hot) {
                    text = object[ot];
                } else {
                    return;
                }
            }
        }
        if(this.exists(value, text))  return;

        if(isOption) {
            this.options.add(object);
        } else {
            if(value && text) {
                option = new Option(text, value);
            } else if (value) {
                option = new Option(value, value);
            } else if (text) {
                option = new Option(text, text);
            } else {
                return;
            }
            copy(object, option);
            this.options.add(option);
        }

        /*if(!isOption) {
          copy(object, option);
        }*/


        /*var superValue;
        if(this.superSelect) {
            var superSelect = $S(obj.superSelect);
            superValue = obj.map.get(option.value);
            if(!superValue) {
                obj.map.put(option.value, superSelect.value);
            }
        }*/
        /*if(callback) {
            callback(option, superValue);
        } else {
            this.options.add(option);
        }*/
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

    obj.load = function (data) {
        var thisObj = this;
        if(data) {
            this.empty();
            if(isArray(data)) {
                if(isEmptyArray(data)) return;
            } else {
                data = this.map.get(data);
            }

            $A(data).each(function(object) {
                thisObj.append(object);
            });

            if(this.sortType) {
                this.sort(this.sortType);
            }
        }
    };

    obj.save = function (key) {
        var array = [];
        $A(obj.options).each(function(option) {
            //array.push(new Option(option.text, option.value));
            array.push(option.cloneNode(true));
        });
        obj.map.put(key, array);
    };

    return obj;
}

function leftToRight(left, right, sortType) {
    var leftSelect = $S(left);
    var rightSelect = $S(right);

    var options = leftSelect.selectedOptions();
    var values = [], i, idx, isSelect = true;
    for(i = 0; i < options.length; i++) {
        /*rightSelect.append(options[i].value, options[i].text, function(option, superValue) {
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
        });*/
        var option = options[i];
        option.mapKey = leftSelect.mapKey;
        rightSelect.append(option);
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
    //leftToRight(right, left, sortType);
    var leftSelect = $S(left);
    var rightSelect = $S(right);

    var options = rightSelect.selectedOptions();
    var values = [], i, idx, isSelect = true;
    for(i = 0; i < options.length; i++) {
        var mapKey = options[i].mapKey;
        if(mapKey === leftSelect.mapKey) {
           leftSelect.append(options[i]);
        } else {
            var cacheObject = leftSelect.map.get(mapKey);
            if(cacheObject) {
                cacheObject.push(options[i]);
            }
        }

        rightSelect.del(options[i].index);
        values.push(options[i].value);
    }

    if(sortType) {
        leftSelect.sort(sortType);
    }
    if(isSelect) {
        leftSelect.clearSelect();
        for(i = 0; i < values.length; i++) {
            idx = leftSelect.indexOfVal(values[i]);
            leftSelect.selectedIndexs(idx);
        }
    }
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
    if(obj) {
        if(isObject(setting)) {
            obj.init(setting);
        }
    } else {
        obj = new Select(id, setting);
        if(obj) {
            selectMap.put(obj.id, obj);
        }
    }
    return obj;
};