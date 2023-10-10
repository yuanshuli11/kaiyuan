// config.js

var utils = {

    timeToStr(num){
        var h = parseInt(num / 3600);
        var m = parseInt(num % 3600 / 60);
        var s = parseInt(num % 3600 % 60);
        var str = ""
        if (h>0){
        	str = h+"h"
        }
        if (h =0 && m == 0){
        	str = s+"s"
        }else{
        	str = str+m+"m"+s+"s"
        }
        
        return str
    },
    add0(m){return m<10?'0'+m:m },
    formatUnix(unixTime)
    {
    var shijianchuo = unixTime*1000
    //shijianchuo是整数，否则要parseInt转换
    var time = new Date(shijianchuo);
    var y = time.getFullYear();
    var m = time.getMonth()+1;
    var d = time.getDate();
    var h = time.getHours();
    var mm = time.getMinutes();
    var s = time.getSeconds();
    return y+'-'+this.add0(m)+'-'+this.add0(d)+' '+this.add0(h)+':'+this.add0(mm)+':'+this.add0(s);
    }
    
};


module.exports = utils;