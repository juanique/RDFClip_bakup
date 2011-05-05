function log(msg){
    if(typeof(console) != "undefined")
        if(typeof(console.log) == "function")
            console.log(msg);
}

function debug(msg){
    if(typeof(console) != 'undefined'){
        console.debug(msg);
    }
}

function str(obj){
    return obj.toString();
}


function safe_tags_replace(str) {
    var replaceTags = function(tag) {
        var tagsToReplace = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;'
        };

        return tagsToReplace[tag] || tag;
    }
    return str.replace(/[&<>]/g, replaceTags);
}


RegExp.escape = function(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

String.prototype.repeat = function(l){
    return new Array(1+l).join(this);
};

if(typeof(update) != "function"){
    function update(_1,_2){
        if(_1===null||_1===undefined){
            _1={};
        }
        for(var i=1;i<arguments.length;i++){
            var o=arguments[i];
            if(typeof (o)!="undefined"&&o!==null){
                for(var k in o){
                    _1[k]=o[k];
                }
            }
        }
        return _1;
    };
}


function SCRIPT(attrs){
    return createElement("SCRIPT",attrs);
}
function LINK(attrs){
    return createElement("LINK",attrs);
}
if(typeof(DIV) != "function"){
    function DIV(attrs){
        return createElement("DIV",attrs);
    }
}
if(typeof(SPAN) != "function"){
    function SPAN(attrs){
        return createElement("SPAN",attrs);
    }
}
if(typeof(UL) != "function"){
    function UL(attrs){
        return createElement("UL",attrs);
    }
}
if(typeof(LI) != "function"){
    function LI(attrs){
        return createElement("LI",attrs);
    }
}

if(typeof(INPUT) != "function"){
    function INPUT(attrs){
        return createElement("INPUT",attrs);
    }
}
if(typeof(LABEL) != "function"){
    function LABEL(attrs){
        return createElement("LABEL",attrs);
    }
}
if(typeof(IMG) != "function"){
    function IMG(attrs){
        return createElement("IMG",attrs);
    }
}
if(typeof(P) != "function"){
    function P(attrs){
        return createElement("P",attrs);
    }
}
if(typeof(SELECT) != "function"){
    function SELECT(attrs){
        return createElement("SELECT",attrs);
    }
}
if(typeof(OPTION) != "function"){
    function OPTION(attrs){
        return createElement("OPTION",attrs);
    }
}
if(typeof(A) != "function"){
    function A(attrs){
        return createElement("A",attrs);
    }
}
if(typeof(H3) != "function"){
    function H3(attrs){
        return createElement("H3",attrs);
    }
}
if(typeof(HR) != "function"){
    function HR(attrs){
        return createElement("HR",attrs);
    }
}

function createElement(tag,attrs){
    var out = document.createElement(tag);
    for(a in attrs){
        out[a] = attrs[a];
    }
    return out;
}

function createTextNode(text){
    return document.createTextNode(text);
}
function quicksort(arr, m, n, desc,compare) { 
    if(n <= m+1) 
        return; 
    if((n - m) == 2) { 
        if(compare(arr[n-1], arr[m], desc)) 
            exchange(arr,n-1, m); return; 
        } 
    var i = m + 1; 
    var j = n - 1; 
    if(compare(arr[m], arr[i], desc)) 
        exchange(arr,i, m); 
    if(compare(arr[j], arr[m], desc)) 
        exchange(arr,m, j); 
    if(compare(arr[m], arr[i], desc)) 
        exchange(arr,i, m); 

    var pivot = arr[m];

    while(true) { j--; 
        while(compare(pivot, arr[j], desc)) 
            j--; i++; 
        while(compare(arr[i], pivot, desc)) 
            i++; if(j <= i) 
                break; exchange(arr,i, j); } 
        exchange(arr,m, j); 
        if((j-m) < (n-j)) { 
            quicksort(m, j, desc,compare); 
            quicksort(j+1, n, desc,compare);
        } else { 
            quicksort(j+1, n, desc); quicksort(m, j, desc,compare);
        } 
} 

function exchange(arr,i,j){
    var r = arr[i];
    arr[i] = arr[j];
    arr[j] = r;
}

function toJSON(arg){
    log("1");
    if(typeof $.toJSON == "function"){
    log("2");
        return $.toJSON(arg);
    }else{
        throw new Exception("No supported JSON library installed");
        log("3");
    }
}
function fromJSON(arg){
    if(typeof $.evalJSON == "function"){
        return $.evalJSON(arg);
    }else
        throw new Exception("No supported JSON library installed");
}

function findPos(obj) {
    var curleft = curtop = 0;
    if (obj.offsetParent) {
        do{
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
    }else{
        log("no offsetParent Attribute");
    }
    return [curleft,curtop];
}

function addLoadEvent(func) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
        window.onload = func;
    } else {
        window.onload = function() {
            oldonload();
            func();
        }
    }
}
//You need an anonymous function to wrap around your function to avoid conflict
(function($){
 
    //Attach this new method to jQuery
    $.fn.extend({
         
        //This is where you write your plugin's name
        fitToContent: function() {
            //Iterate over the current set of matched elements
            return this.each(function(i, text) {
                var jTa = jQuery(text)
                var adjustedHeight = Math.max(text.scrollHeight, jTa.height()) + 15;
                if( adjustedHeight > text.clientHeight + 15 )
                    jTa.height(adjustedHeight);
             
            });
        }
    });
     
//pass jQuery to the function,
//So that we will able to use any valid Javascript variable name
//to replace "$" SIGN. But, we'll stick to $ (I like dollar sign: ) )      
})(jQuery);

