const validator = require('validator');


//this is used to prevent hack attacks and data security


function sanitizeObject(obj) {
    const sanitizedObj = {};

    for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
            let sanitizedValue = obj[key];
            if (typeof sanitizedValue === 'string') {
                sanitizedValue = validator.escape(validator.trim(sanitizedValue));
            }
            sanitizedObj[key] = sanitizedValue;
        }
    }

    return sanitizedObj;
}

module.exports = { sanitizeObject }