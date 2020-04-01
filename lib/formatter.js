
class Formatter
{
    stringifyRequest(request)
    {
        var cache = [];
        var o = {};
        o.o = o;
        var s = JSON.stringify(request, (key, value) =>
        {
            if (typeof value === 'object' && value !== null)
            {
                if (cache.indexOf(value) !== -1)
                {
                    return;
                }
                cache.push(value);
            }
            return value;
        });
        cache = null;
        return s;
    }
}
module.exports = Formatter
