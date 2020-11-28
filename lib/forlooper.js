'use strict'

const interpolate = require('./interpolater');

const processLoop = (str, start, variables) => 
{
    var closeBracket;
    var openBrackets = 0;
    var subVarStart;
    var subVarEnd;
    var loopVarStart;
    var loopVarEnd;
    var firstBracket;
    for(var i = start; i < str.length; i++)
    {
        // process.stdout.write(str[i]);
        if(str[i] == '(' && !subVarStart)subVarStart = i;
        if(subVarStart && !subVarEnd && str[i] == ':'  ) { subVarEnd = i; loopVarStart = i+1 };
        if(loopVarStart && !loopVarEnd && str[i] == ')') { loopVarEnd = i};
        if(!firstBracket && str[i] == '{') { firstBracket = i+1};

        if(str[i] == '{')openBrackets++;
        else if(str[i] == '}')
        {
            openBrackets--;
            if(openBrackets <= 0) {closeBracket = i; break}
        }
    }
    var subVar = str.substring(subVarStart, subVarEnd).trim();
    var loopVar = str.substring(loopVarStart,loopVarEnd).trim();
    var loopCode = str.substring(firstBracket, closeBracket).trim();

    //console.log("SUB AND LOOP VARS",subVar, loopVar);
    //console.log("loop\n",loopCode);

    //console.log("variiables",variables);
    var loopThroughObjString = loopVar.split('.');
    // console.log(loopThroughObjString);
    var loopThroughVars = variables[loopThroughObjString[0]];
    if(loopThroughObjString[1])loopThroughVars = loopThroughVars[loopThroughObjString[1]];
    
    // console.log(loopThroughVars);
    var html = "";
    loopThroughVars.forEach(v => {
        console.log("V:",v);
        html += interpolate(loopCode, {video:v});
    });
    
    console.log(html)
    var htmlStart = str.substring(0,start);
    var htmlEnd = str.substring(closeBracket+1, str.length);

    return htmlStart + html + htmlEnd;
}

const loop = (str, variables) => {
    if(str.indexOf('$for') != -1)
    {
        var loopIndex = str.indexOf('$for');
        console.log("LOOP INDEX", loopIndex);
        str = processLoop(str, loopIndex, variables);
    }
    console.log(str);
    return str;
    // while( (loopIndex = str.indexOf('$for')) != -1){
    // }
    // consstr.replace(/\${([^}]+)}/g,(_, prop) => obj[prop]);
    // return str.replace(/\${([^}]+)}/g, (_, target) => {
    //     let keys = target.split(".");
    //     return keys.reduce((previous, current) => {
    //     //if element/key in target array is array, get the value and return
    //     if (current.search(/\[/g) > -1) 
    //     {
    //         let m_curr = current.replace(/\]/g, "");
    //         let arr = m_curr.split("[");
    //         return arr.reduce((prev, curr) => {
    //         return prev && prev[curr];
    //         }, previous);
    //     } 
    //     else 
    //     {
    //         //else it is an object, get the value and return
    //         return previous && previous[current];
    //     }
    //     }, obj);
    // });
};
module.exports = loop;
