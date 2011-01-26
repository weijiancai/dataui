(function(window) {
    /**
     * 创建Select对象，并扩展一些属性和方法
     * @param id      Select的ID属性值
     * @param setting Select的配置信息，包括如下信息
     *                id          Select的ID属性值
     *                related     此Select的相关Select ID值
     *                sortType    Select的排序类型：SORT_VAL 按Option的value属性值排序， SORT_TEXT ，按Option的文本值排序
     *                url         填充Select内容的url字符串
     *                urlData     url字符串需要传递的参数值
     *                optionValue 填充Select时，对应的Option Value属性值
     *                optionText  填充Select时，对应的Option 文本值
     *                onSuccess   当url请求成功后调用此函数
     *                onChange    当Select下拉框值改变时调用此函数
     */
    function Select(id, setting) {
        var obj = document.getElementById(id);
        if(!obj) {
            return null;
        }

        var S = {
            init : function (setting) {
                if(setting) {
                    this.related = setting.related || this.related;
                    this.sortType = setting.sortType || this.sortType;
                    this.url = setting.url || this.url;
                    this.urlData = setting.urlData || this.urlData;
                    this.optionValue = setting.optionValue || this.optionValue;
                    this.optionText = setting.optionText || this.optionText;
                    this.onSuccess = setting.onSuccess || this.onSuccess;

                    if(setting.onChange) {
                        this.onchange = function() {
                            setting.onChange(thisObj.value);
                        };
                    }
                }

                var thisObj = this;

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
                    var mapKey = this.getMapKey(this.url, this.urlData);  // 记录本次的url key值
                    var cacheObj = this.map.get(mapKey);
                    if(cacheObj) {
                        if(upKey) {
                            this.save(upKey);
                        }
                        this.load(cacheObj);
                        this.mapKey = mapKey;
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
            },
            values : function (sp) {
                return $A(this.options).find('value').join(sp || ',');
            },
            texts : function (sp) {
                return $A(this.options).find('text').join(sp || ',');
            },
            indexOfVal : function (value) {
                var op = $A(this.options).find('value', value);
                return op ? op.index : -1;
            },
            indexOfText : function (text) {
                var op = $A(this.options).find('text', text);
                return op ? op.index : -1;
            },
            exists : function (value, text) {
                if(value && text) {
                    return this.indexOfVal(value) > -1 && this.indexOfText(text) > -1;
                } else if (value) {
                    return this.indexOfVal(value) > -1
                } else if (text) {
                    return this.indexOfText(text) > -1;
                }
                return false;
            },
            empty : function () {
                this.options.length = 0;
                this.map.clear();
            },
            clearSelect : function () {
                if(this.multiple === true) {
                    $A(this.options).each(function() {
                        if(this.selected === true) {
                            this.selected = false;
                        }
                    });
                } else if(this.options[0]) {
                    this.options[0].selected = true;
                }
            },
            selectedIndexs : function (idx) {
                if(inScope(idx, 0, this.options.length)) {
                    this.options[idx].selected = true;
                } else if (isArray(idx)) {
                    for(var i = 0; i < idx.length; i++) {
                        this.options[idx[i]].selected = true;
                    }
                }

                return $A(this.options).find('selected', true, 'index').join();
            },
            selectedValues : function () {
                return $A(this.options).find('selected', true, 'value').join();
            },
            selectedTexts : function () {
                return $A(this.options).find('selected', true, 'text').join();
            },
            selectedOptions : function () {
                return $A(this.options).find('selected', true, 'all');
            },
            val : function () {
                if(arguments.length === 0) {
                    return this.selectedValues();
                } else if (isNumber(arguments[0])) {
                    if(inScope(arguments[0], 0, this.options.length)) {
                        this.selectedIndexs(arguments[0]);
                    }
                } else {
                    var idx = this.indexOfVal(arguments[0]);
                    if(idx > -1) {
                        this.selectedIndexs(idx);
                    }
                }
            },
            text : function () {
                if(arguments.length === 0) {
                    return this.selectedTexts();
                } else {
                    var idx = this.indexOfText(arguments[0]);
                    if(idx > -1) {
                        this.selectedIndexs(idx);
                    }
                }
            },
            genOption : function (value, text) {
                var object = value, option;
                if(isObject(object)) {
                    if(object.value && object.text) {  // Option 对象
                        value = object.value;
                        text = object.text;
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
                            return null;
                        }
                    }
                }
                if(this.exists(value, text))  return null;

                if(value && text) {
                    option = new Option(text, value);
                } else if (value) {
                    option = new Option(value, value);
                } else if (text) {
                    option = new Option(text, text);
                } else {
                    return null;
                }

                return option;
            },
            append : function (value, text) {
                var option = this.genOption(value, text);
                if(option) {
                    this.options.add(option);
                }
            },
            del : function (value, text) {
                if(typeof value === 'number' && value >= 0 && value < this.options.length) {
                    this.remove(value);
                } else if (this.exists(value, text)) {
                    if(value && text) {
                        $A(this.options).each(function(select) {
                            if(this.value === value && this.text === text) {
                                select.remove(this.index);
                                return false;
                            }
                        }, [this]);
                    } else if(value) {
                        $A(this.options).each(function(select) {
                            if(this.value === value) {
                                select.remove(this.index);
                                return false;
                            }
                        }, [this]);
                    } else if (text) {
                        $A(this.options).each(function(select) {
                            if(this.text === text) {
                                select.remove(this.index);
                                return false;
                            }
                        }, [this]);
                    }
                }
            },
            sort : function (sortType) {
                var map = new Map(), values = [];
                if (sortType == SORT_VAL) {
                    $A(obj.options).each(function() {
                        map.put(this.value, {value:this.value, text:this.text, selected : this.selected});
                        values.push(this.value);
                    });
                } else if (sortType == SORT_TEXT) {
                    $A(obj.options).each(function() {
                        map.put(this.text, {value:this.value, text:this.text, selected : this.selected});
                        values.push(this.text);
                    });
                }

                values.sort(function(a, b) {
                    return a.localeCompare(b);
                });

                for(var i = 0; i < values.length; i++) {
                    var option = map.get(values[i]);
                    this.options[i].value = option.value;
                    this.options[i].text = option.text;
                    this.options[i].selected = option.selected;
                }
            },
            load : function (data) {
                if(data) {
                    this.empty();
                    if(isArray(data)) {
                        if(isEmptyArray(data)) return;
                    } else {
                        data = this.map.get(data);
                    }

                    for(var i = 0; i < data.length; i++) {
                        var option = this.genOption(data[i]);
                        if(option) {
                            if(this.related) {
                                var relatedSelect = $S(this.related);

                                if(relatedSelect.exists(option.value, option.text)) {
                                    relatedSelect.map.put(option.value, this.getMapKey(this.url, this.urlData));
                                } else {
                                    this.append(data[i]);
                                }
                            } else {
                                this.append(data[i]);
                            }
                        }
                    }

                    if(this.sortType) {
                        this.sort(this.sortType);
                    }
                }
            },
            save : function (key) {
                var array = [];
                $A(obj.options).each(function() {
                    array.push(new Option(this.text, this.value));
                });
                obj.map.put(key, array);
            },
            getMapKey : function (url, urlData) {
                var mapKey = url;  // 记录本次的url key值
                if(urlData) {
                    $A(urlData).each(function(name, value) {
                        mapKey += value;
                    });
                }

                return mapKey;
            }
        };

        obj.map = new Map(); //用于存储数据的Map对象
        obj.init = S.init;
        obj.values = S.values;
        obj.texts = S.texts;
        obj.indexOfVal = S.indexOfVal;
        obj.indexOfText = S.indexOfText;
        obj.exists = S.exists;
        obj.empty = S.empty;
        obj.clearSelect = S.clearSelect;
        obj.selectedIndexs = S.selectedIndexs;
        obj.selectedValues = S.selectedValues;
        obj.selectedTexts = S.selectedTexts;
        obj.selectedOptions = S.selectedOptions;
        obj.val = S.val;
        obj.text = S.text;
        obj.genOption = S.genOption;
        obj.append = S.append;
        obj.del = S.del;
        obj.sort = S.sort;
        obj.load = S.load;
        obj.save = S.save;
        obj.getMapKey = S.getMapKey;

        obj.init(setting);

        return obj;
    }

    function leftToRight(left, right, sortType, isAll) {
        var leftSelect = $S(left);
        var rightSelect = $S(right);

        var options = leftSelect.selectedOptions();
        var values = [], i, idx, isSelect = true;
        for(i = 0; i < options.length; i++) {
            rightSelect.append(options[i]);
            rightSelect.map.put(options[i].value, leftSelect.mapKey);
            leftSelect.del(options[i].index);
            values.push(options[i].value);
        }

        if(sortType) {
            rightSelect.sort(sortType);
        }
        if(isSelect) {
            if(!isAll) rightSelect.clearSelect();
            for(i = 0; i < values.length; i++) {
                idx = rightSelect.indexOfVal(values[i]);
                rightSelect.selectedIndexs(idx);
            }
        }
    }

    function rightToLeft(right, left, sortType, isAll) {
        var leftSelect = $S(left);
        var rightSelect = $S(right);

        var options = rightSelect.selectedOptions();
        var values = [], i, idx, isSelect = true;
        for(i = 0; i < options.length; i++) {
            var mapKey = rightSelect.map.get(options[i].value);
            if(mapKey === leftSelect.mapKey) {
                leftSelect.append(options[i]);
                values.push(options[i].value);
            } else {
                var cacheObject = leftSelect.map.get(mapKey);
                if(cacheObject) {
                    cacheObject.push(new Option(options[i].text, options[i].value));
                }
            }

            rightSelect.del(options[i].index);
        }

        if(sortType) {
            leftSelect.sort(sortType);
        }
        if(isSelect) {
            if(!isAll) leftSelect.clearSelect();
            for(i = 0; i < values.length; i++) {
                idx = leftSelect.indexOfVal(values[i]);
                leftSelect.selectedIndexs(idx);
            }
        }
    }

    function allToRight(left, right, sortType) {
        var leftSelect = $S(left);
        var values = $S(left).values().split(',');
        leftSelect.clearSelect();

        for(var i = 0; i < values.length; i++) {
            leftSelect.val(values[i]);
            leftToRight(left, right, sortType, true);
        }
    }

    function allToLeft(right, left, sortType) {
        var rightSelect = $S(right);
        var values = $S(right).values().split(',');
        rightSelect.clearSelect();

        for(var i = 0; i < values.length; i++) {
            rightSelect.val(values[i]);
            rightToLeft(right, left, sortType, true);
        }
    }

    window.SORT_VAL = 1;
    window.SORT_TEXT = 2;
    window.leftToRight = leftToRight;
    window.rightToLeft = rightToLeft;
    window.allToRight = allToRight;
    window.allToLeft = allToLeft;
    var selectMap = new Map();

    /**
     * 创建Select对象，此对象如果存在，则不会创建
     * @param setting 如果是字符串，则为Select的ID，如果是对象，则为Select的配置信息，应包含id属性
     * @return 返回经过扩展的Select对象
     */
    window.$S = function(setting) {
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
})(window);