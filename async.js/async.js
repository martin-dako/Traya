if (typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    }
}

if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (fn, scope) {
        for (var i = 0, len = this.length; i < len; ++i) {
            fn.call(scope, this[i], i, this);
        }
    }
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function echo(string)
{
    if(true)
    {
        console.log(string);
    }
}



var memory = [];
var htmlMemory = [];

var async = {

    defaultNoBinding: function (url, div, method, data, model, controllername, callback) {
        $.ajax({ url: url, method: method, dataType: 'json', data: data }).done(function (resultModel) {

            var bufferedName = "";

            if (typeof model !== "undefined") {
                var bufferedName = model;
            }
            else {

                var bufferedName = controllername;

            }
            memory[bufferedName] = resultModel;

            if (typeof callback !== "undefined") {
                callback();
            }
        })
    },

    dflt: function (url, div, method, data, model, controllername, callback) {
        $.ajax({ url: url, method: method, dataType: 'json', data: data }).done(function (resultModel) {

            var bufferedName = "";

            if (typeof model !== "undefined")
            {
                var bufferedName = model;
            }
            else
            {
               
                var bufferedName = controllername;
               
            }
            memory[bufferedName] = resultModel;

            if (typeof callback !== "undefined") {
                callback();
            }

            if ($.isArray(memory[bufferedName])) {
                var divResult = "";
                
                if (memory[bufferedName].length == 0)
                {
                    div.html(htmlMemory[controllername]);
                    return;
                }

                $(memory[bufferedName]).each(function (index, val) {
                   
                    divResult += parser.parse(htmlMemory[controllername], val)
                });
                div.html(divResult);
            }
            else {
                
                div.html(parser.parse(htmlMemory[controllername], memory[bufferedName]));
               
            }
           

        })
    },
    load: function () {
        var controllerType = "";

        controllerType = "controller";
        $("[" + controllerType + "]").each(function (index) {
            controllerType = "controller";
            var mySelf = $(this);
           
            async.encapsulatedCaller(mySelf, controllerType);
        });

        $("body").on("click", "[click-controller]", function () {
            var mySelf = $(this);
            controllerType = "click-controller";
            async.encapsulatedCaller(mySelf, controllerType);
        });



        controllerType = "load-controller";
        $("[" + controllerType + "]").each(function (index) {
            controllerType = "load-controller";
            var mySelf = $(this);
            
            async.encapsulatedCaller(mySelf, controllerType);
        });
        

    }, 
    encapsulatedCaller: function (mySelf, controllerType)
    {
        var html = mySelf.html();

        //mySelf.html("");
        var controllerAttr = mySelf.attr(controllerType);

        if (controllerAttr === "")
        {
            controllerAttr = "empty";
        }

        var url = mySelf.attr("ajax");
        var method = mySelf.attr("method");
        var data = mySelf.attr("data");
        var model = mySelf.attr("model");
       
       

        if (typeof htmlMemory[controllerAttr] === "undefined")
        {
            htmlMemory[controllerAttr] = html;
        }

        var form = mySelf.attr("form-data");
        
        if (typeof data === "undefined")
        {
            data = "";
        }

        if (typeof form !== "undefined")
        {
            data += parser.parseFormData(form);
        }

        data = data.replace(/(^[,\s]+)|([,\s]+$)/g, '');

        var handler = {};

        handler.url = url;

        handler.method = "GET";

        if (typeof method !== "undefined")
        {
            handler.method = method;
        }
        
        if(typeof data !== "undefined" && data !== "")
        {
            handler.data = {};
            handler.data = parser.dataParser(data);


            var bufferedName = "";

            if (typeof model !== "undefined") {
                var bufferedName = model;
            }
            else
            {
                
                var bufferedName = controllerAttr;
            }
            memory["_" + bufferedName] = handler.data;


        }

        handler.element = mySelf;
        handler.controllerType = controllerType;
        handler.controllerName = controllerAttr;
        handler.model = model;

        

        if (controllerType == "load-controller")
        {
            $.ajax(handler.url).done(function (result) {
                mySelf.html(result);
                window[controllerAttr](handler);
            });
        }
        else
        {
            window[controllerAttr](handler);
        }

        
    }
}



function empty(handler)
{

}


function invoke(controllerFunction)
{

    if (controllerFunction == "empty")
    {
        console.log("Unable to call invoke on 'empty' controller!");
        return;
    }

    var controllerType;
  
    controllerType = "controller";
    $("[" + controllerType + "]").each(function (index) {
        controllerType = "controller";
        var mySelf = $(this);
        if($(mySelf).attr(controllerType) == controllerFunction)
        {
            async.encapsulatedCaller(mySelf, controllerType);
        }
    });

    controllerType = "click-controller";
    $("[" + controllerType + "]").each(function (index) {
        controllerType = "click-controller";
        var mySelf = $(this);
        if ($(mySelf).attr(controllerType) == controllerFunction) {
            async.encapsulatedCaller(mySelf, controllerType);
        }
    });

    controllerType = "invoke-controller";
    $("[" + controllerType + "]").each(function (index) {
        controllerType = "invoke-controller";
        var mySelf = $(this);
       
        if ($(mySelf).attr(controllerType) == controllerFunction) {
            async.encapsulatedCaller(mySelf, controllerType);
        }
    });

    controllerType = "load-controller";
    $("[" + controllerType + "]").each(function (index) {
        controllerType = "load-controller";
        var mySelf = $(this);
       
        if ($(mySelf).attr(controllerType) == controllerFunction) {
            async.encapsulatedCaller(mySelf, controllerType);
        }
    });


}


var parser = {
    parse: function (div, model) {
        var parsedModel = [];
        var re = /{{(.*?)}}/g;
        var m;
        var divCopy = div;

        

        while (m = re.exec(div)) {
            parsedModel.push(m[1]);



            if (typeof model[m[1]] !== "undefined")
            {

                divCopy = replaceAll(divCopy, "{{" + m[1] + "}}", model[m[1]]);
            }
            else
            {
                //provjeri možda je s toèkom
                var dotValue = parser.fetchFromObject(model, m[1]);
                
                if (typeof dotValue !== "undefined")
                {
                    divCopy = replaceAll(divCopy, "{{" + m[1] + "}}", dotValue);
                }
                else
                {
                    divCopy = replaceAll(divCopy, "{{" + m[1] + "}}", "");
                }

                
            }
        }
        

        return divCopy;
    },

    parseFormData : function (data)
    {
  
    var paramString = '';
    var splited = data.split(" ");
    for (var i = 0; i < splited.length; i++)
    {
        var formName = splited[i];
        $('form[name="' + formName + '"]').find('input, textarea, select').each(function () {
            paramString += "," + $(this).attr('name') + ':' + $(this).val();
        });
    }

    return paramString;
    },

    dataParser : function(data)
    {
        
        var returnValue = {};
       
        var splited = data.split(",");
        
        for(var i = 0; i < splited.length; i++) {

            var element = splited[i]; 

            var kv = element.split(":");
            var key = kv[0].trim();
            var value = kv[1].trim();

            if (value.substring(0, 1) == "$")
            {
                value = value.slice(1);
                returnValue[key] = memory[value];
            }
            else
            {
                returnValue[key] = value;
            }

           
        }
        
        return returnValue;
    },


    fetchFromObject : function (obj, prop) {

        if(typeof obj === 'undefined') {
            return false;
        }

        var _index = prop.indexOf('.')
        if(_index > -1) {
            return parser.fetchFromObject(obj[prop.substring(0, _index)], prop.substr(_index + 1));
        }

        return obj[prop];
    }
}


function render(handler, data) {
  
    


    if(typeof data == "undefined")
    {
        var divResult = parser.parse(handler.element.html(), handler.data);
        handler.element.html(divResult);
    }
    else
    {
        var divResult = parser.parse(handler.element.html(), data);
        handler.element.html(divResult);
    }
    
   
}

function ajax(handler, callback)
{
    async.dflt(handler.url, handler.element, handler.method, handler.data, handler.model, handler.controllerName, callback);
}

function ajaxNoBinding(handler, callback) {
    async.defaultNoBinding(handler.url, handler.element, handler.method, handler.data, handler.model, handler.controllerName, callback);
}

function bindMemory(handler)
{
    handler.element.html(parser.parse(htmlMemory[handler.controllerName], memory));
}


































