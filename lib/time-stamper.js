class timeStamp
{
    getTimeStamp(request)
    {
        var date = new Date(Date.now());
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hour = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();
        return "" + hour + ":" + minute + ":" + second + " " + day + "/" + month + "/" + year;
    };
}

module.exports = timeStamp;