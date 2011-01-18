function each( object, callback) {
    var name, i = 0, array = [], returnValue, args = arguments[2],
            length = object.length,
            isObj = length === undefined;

    if ( args ) {
        if ( isObj ) {
            for ( name in object ) {
                returnValue = callback.apply( object[ name ], args );
                if ( returnValue  === false ) {
                    break;
                } else if (returnValue !== null) {
                    array.push(returnValue);
                }
            }
        } else {
            for ( ; i < length; i++) {
                returnValue = callback.apply( object[ i ], args );
                if (returnValue  === false ) {
                    break;
                } else if (returnValue !== null) {
                    array.push(returnValue);
                }
            }
        }
    } else {
        if ( isObj ) {
            for ( name in object ) {
                returnValue = callback.call( object[ name ], name, object[ name ] );
                if (returnValue  === false ) {
                    break;
                } else if (returnValue !== null) {
                    array.push(returnValue);
                }
            }
        } else {
            for ( ; i < length; i++) {
                returnValue = callback( object[ i ], i);
                if (returnValue  === false ) {
                    break;
                } else if (returnValue !== null) {
                    array.push(returnValue);
                }
            }
        }
    }

    return array;
}