'use strict'

const interpolate = (str, obj) => {
    if(   typeof(obj) != 'object'  )return obj;
    return str.replace(/\${([^}]+)}/g, (_, target) => {
        let keys = target.split(".");
        return keys.reduce((previous, current) => {
            //if element/key in target array is array, get the value and return
            if (current.search(/\[/g) > -1) 
            {
                let m_curr = current.replace(/\]/g, "");
                let arr = m_curr.split("[");
                return arr.reduce((prev, curr) => {
                return prev && prev[curr];
                }, previous);
            } 
            else 
            {
                //else it is an object, get the value and return
                return previous && previous[current];
            }
        }, obj);
    });
};
module.exports = interpolate;
