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
    var leVariable = '${'+loopVar+'}';
    console.log("leV",leVariable);
    var test = interpolate(leVariable,{variables})
    console.log("TEST", test, "vars", variables)
    var loopThroughObjString = loopVar.split('.');  //this is breaking object with dot.
    // console.log(loopThroughObjString);
    var loopThroughVars = variables[loopThroughObjString[0]];
    if(loopThroughObjString[1])loopThroughVars = loopThroughVars[loopThroughObjString[1]];
    
    // console.log(loopThroughVars);
    var html = "";
    var index = 0;
    loopThroughVars.forEach(v => {
        index++;
        console.log(index)
        //console.log("V:",v);
        // variables[loop] = loopIndex;
        console.log("v",variables)
        v.loop = index;
        html += interpolate(loopCode, {video:v,loop:index});
    });
    
    //console.log(html)
    var htmlStart = str.substring(0,start);
    var htmlEnd = str.substring(closeBracket+1, str.length);

    return htmlStart + html + htmlEnd;
}

const loop = (str, variables) => {
    while(str.indexOf('$for') != -1)
    {
        var loopIndex = str.indexOf('$for');
        console.log("LOOP INDEX", loopIndex);
  
        str = processLoop(str, loopIndex, variables);
    }
    //console.log(str);
    return str;
};
module.exports = loop;
