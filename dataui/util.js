/**
 * 判断值是否为字符串类型
 * @param value 要进行判断的值
 * @return boolean true 字符串类型，false 非字符串类型
 */
var isString = function (value) {
    return typeof value === 'string';
};

/**
 * 判断值是否为类型
 * @param value 要进行判断的值
 * @return boolean true 数字类型，false 非数字类型
 */
var isNumber = function (value) {
    return typeof value === 'number';
};

/**
 * 判断值是否为对象类型
 * @param value 要进行判断的值
 * @return boolean true 对象类型，false 非对象类型
 */
var isObject = function (value) {
    return Boolean(value) && typeof value === 'object' && ! isArray(value);
};

/**
 * 判断值是否为数组类型
 * @param value 要进行判断的值
 * @return boolean true 数组类型，false 非数组类型
 */
var isArray = function (value) {
    return Object.prototype.toString.call(value) === '[object Array]';
};

/**
 * 判断值是否为函数类型
 * @param value 要进行判断的值
 * @return boolean true 函数类型，false 非函数类型
 */
var isFunction = function (value) {
    return Object.prototype.toString.call(value) === '[object Function]';
};

/**
 * 判断值是否为空数组
 * @param value 要进行判断的值
 * @return boolean true 空数组，false 非空数组
 */
var isEmptyArray = function (value) {
    return isArray(value) && value.length === 0;
};

/**
 * 判断某个对象是否拥有某个属性
 * @param obj      要判断的对象
 * @param property 要判断的属性名
 * @return boolean true 拥有此属性，false 没有此属性
 */
var haveProperty = function (obj, property) {
    return Boolean(property) && isObject(obj) && (property in obj);
};

/**
 * 将源对象中的属性复制到目标对象
 * @param source 源对象
 * @param target 目标对象
 */
var copy = function (source, target) {
    if( isObject(source) && isObject(target) ) {
        for(var property in source) {
            target[property] = source[property];
        }
    }
};

/**
 * 判断一个数值是否在一个范围之内
 * @param value 要判断的数组
 * @param start 开始值
 * @param end   结束值
 * @return boolean true 在范围中， false 不在范围中
 */
var inScope = function (value, start, end) {
    if(! isNumber(value)) return false;

    if(start && end) {
        return value >= start && value < end;
    } else if(start) {
        return value >= start;
    } else if(end) {
        return value < end;
    }

    return false;
};


/**
 * 数组或对象操作的扩展
 * @param data 数组或对象
 */
var $A = function ( data ) {
    this.find = function(property, value, prop) {
        if(property && value && prop) {
            return this.each(function(object) {
                if(object[property] === value) {
                    return 'all' === prop ? object : object[prop];
                } else {
                    return null;
                }
            });
        } else if(property && value) {
            var obj;
            this.each(function(object) {
                if(object[property] === value) {
                    obj = object;
                    return false;
                }
            });
            return obj;
        } else {
            return this.each(function(option) {
                return option[property];
            });
        }
    };

    this.each = function(callback) {
        var name, i = 0, array = [], returnValue, args = arguments[2],
                length = data.length,
                isObj = length === undefined;

        if ( args ) {
            if ( isObj ) {
                for ( name in data ) {
                    returnValue = callback.apply( data[ name ], args );
                    if ( returnValue  === false ) {
                        break;
                    } else if (returnValue !== null) {
                        array.push(returnValue);
                    }
                }
            } else {
                for ( ; i < length; i++) {
                    returnValue = callback.apply( data[ i ], args );
                    if (returnValue  === false ) {
                        break;
                    } else if (returnValue !== null) {
                        array.push(returnValue);
                    }
                }
            }
        } else {
            if ( isObj ) {
                for ( name in data ) {
                    returnValue = callback.call( data[ name ], name, data[ name ] );
                    if (returnValue  === false ) {
                        break;
                    } else if (returnValue !== null) {
                        array.push(returnValue);
                    }
                }
            } else {
                for ( ; i < length; i++) {
                    returnValue = callback( data[ i ], i);
                    if (returnValue  === false ) {
                        break;
                    } else if (returnValue !== null) {
                        array.push(returnValue);
                    }
                }
            }
        }

        return array;
    };

    return this;
};