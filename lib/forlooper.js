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
        if(str[i] == '(' && !subVarStart)subVarStart = i+1;
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
    var loopVar = str.substring(loopVarStart, loopVarEnd).trim();
    var loopCode = str.substring(firstBracket, closeBracket).trim();

    var html = "";
    var index = 0;

    if(typeof(variables) == 'object' && variables.constructor !== Array)
    {
        var splits = loopVar.split('.');
        var index = splits[0];
        var complex = splits[1];
        var arr;
        if(complex)arr = variables[index][complex];
        else arr = variables[index];
        arr.forEach((v,i) => {
            var decodedVar = interpolate(loopCode, {[subVar]:v,loop:i, ...variables});
            html += decodedVar ? decodedVar : '';
        });
    }
    else
    {
        variables.forEach( (v,i) => {
            //replacedParts = target.split(search).join(replacement);
            html += loopCode.split('${'+subVar+'}').join(v).split('${index}').join(i);
        });
    }

    var htmlStart = str.substring(0,start);
    var htmlEnd = str.substring(closeBracket+1, str.length);

    return htmlStart + html + htmlEnd;
}

const loop = (str, variables) => {
    while(str.indexOf('$for') != -1)
    {
        var loopIndex = str.indexOf('$for');
        // console.log("LOOP INDEX", loopIndex);
  
        str = processLoop(str, loopIndex, variables);
    }
    return str;
};
module.exports = loop;
