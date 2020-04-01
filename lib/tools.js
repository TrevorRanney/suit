
class Tools
{
    getIp(request)
    {
        return request.headers['x-forwarded-for'] ||
        request.connection.remoteAddress ||
        request.socket.remoteAddress ||
        (request.connection.socket ? request.connection.socket.remoteAddress : null);
    }

}

module.exports = new Tools();