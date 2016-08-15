//routeconfig
var routeConfigBase = [];

//config
var trayaConfig = {
    warning : true
};

//start point
var traya = {

    load : function() {
        trayaCore.registerControllers();
        router.routerHandler();
        //za test

    }


};

//prototypes
Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

//global functions
function invoke(controllerName)
{
    trayaCore.callController(trayaData.solveTrayamemory(controllerName));
}

function bindMemory(handler)
{
    trayaData.bindMemory(handler);
}

function transferMemory(sourceHandler, destinationControllerName)
{
    trayaData.transferMemory(sourceHandler, trayaData.solveTrayamemory(destinationControllerName));
}

function transferInvoke(sourceHandler, destinationControllerName)
{
    trayaData.transferMemory(sourceHandler, trayaData.solveTrayamemory(destinationControllerName));
    trayaCore.callController(trayaData.solveTrayamemory(destinationControllerName));
}

function clearMemory(handler)
{
    trayaData.clearMemory(handler);
}

function ajaxNoBinding(handler, callback)
{
    trayaData.ajaxJSON(handler, callback);
}




//global vars
var memory = {};

//
//TRAYA CORE
//
var trayaCore = {

    //for type check
    types : {
        controller : ["default", "load", "click", "invoke"]
    },

    //core globals - track all controllers
    data : {
        controllers : [], //all controllers (divs with functions)
        includes : [] //divs that include html
    },



    mergeRecursive: function(obj1, obj2) {

        for (var p in obj2) {
            try {
                // Property in destination object set; update its value.
                if ( obj2[p].constructor==Object ) {
                    obj1[p] = MergeRecursive(obj1[p], obj2[p]);

                } else {
                    obj1[p] = obj2[p];

                }

            } catch(e) {
                // Property in destination object not set; create it and set its value.
                obj1[p] = obj2[p];

            }
        }

        return obj1;
    },


    //register one controller, add(if it is new) or replace
    registerController : function(controllerDOM)
    {
        var controllerName = controllerDOM.attr("controller");
        var controllerType = controllerDOM.attr("type");
        var controllerQuantity = controllerDOM.attr("quantity");
        var replacement = false;

        if(typeof controllerQuantity === "undefined")
        {
            controllerQuantity = "one";
        }

        if(controllerQuantity != "many" && controllerQuantity != "one")
        {
            trayaCore.throwError("Attribute 'quantity' must be 'many' or 'one'");
        }

        //check if exists
        if(trayaCore.controllerExists(controllerName) && controllerQuantity == "one")
        {
            trayaCore.throwWarning("Controller '" + controllerName + "' exists, replacement will be done!");
            replacement = true;
        }

        //generate custom controllerName if there is more than 1 element with same controller
        if(controllerQuantity == "many")
        {
            controllerName = controllerName + "__traya-custom__" + trayaCore.data.controllers.length;
            controllerDOM.attr("controller", controllerName);
        }


        if(typeof controllerType === "undefined")
        {
            controllerType = "default";
        }

        controllerType = controllerType.toLowerCase();


        if(!trayaCore.types.controller.contains(controllerType))
        {
            trayaCore.throwError("There is no controller with type " + controllerType);
        }

        var controller = {name: controllerName, DOM: controllerDOM, type: controllerType, handler: {}};

        //register template
        trayaData.registerTemplate(controller);



        if(replacement)
        {

            for(var i = 0; i < trayaCore.data.controllers.length; i++)
            {
                if(trayaCore.data.controllers[i].name == controllerName)
                {

                    trayaCore.data.controllers[i] = controller;
                    break;
                }
            }

        }
        else
        {
            trayaCore.data.controllers.push(controller);
        }

        //fillHandlers
        var handler = trayaCore.fillHandler(controller.name);
        controller.handler = handler;

        //inject template
        controller.DOM = trayaData.injectTemplate(controller);

        //initialize controller default memory
        trayaData.initializeMemory(controller);

        trayaCore.controllerAction(controller);


    },


    includeTransform: function(parent, include)
    {

        //check if has @ sign -> only for full paths
        var checkUrl = include.attr("src");

        var route = include.attr("route");



        var url = "";
        var sufix = checkUrl.substring(1);;

        if(!checkUrl.startsWith("@"))
        {


            var splited = parent.split('/');
            splited.pop();
            var url = splited.join("/") + "/";
            sufix = include.attr("src");
        }



            var src =  url  + sufix;



            registeredHtml = include[0].outerHTML;

            //console.log(registeredHtml);


            var display = "block;"
            if(typeof route != "undefined")
            {
                display = "none";
                //routeConfigBase.push({route: route, include: include, src: src, original: registeredHtml});
            }

            include = $("<div style='display: " + display +";' controller='"+ src.replaceAll("/", "_").replaceAll("\\.", "_") +"' type='load' ajax='" + src + "'>" + include.html() +"</div>").replaceAll(include); //ovo je rjesenje
            if(typeof route != "undefined")
            {
                routeConfigBase.push({route: route, include: include, src: src, original: registeredHtml});
            }


    },

    //on page start, register all controllers
    registerControllers : function(){


        $("include").each(function (index) {
            trayaCore.includeTransform( window.location.href.split("#")[0] + "", $(this));
        });



        $("[controller]").each(function (index) {

            var controllerDOM = $(this);

            trayaCore.registerController(controllerDOM);

        });

    },


    //after async call inject html to master html and add controllers
    injectHTML : function(html)
    {
        var htmlData = $(html).each(function (index) {

            var controllerDOM = $(this);

            if(typeof controllerDOM.attr("controller") !== "undefined")
            {
               // var data = controllerDOM.attr("data");
               // controllerDOM.attr("data",  controllerDOM.attr("data") + "_bababababbaba");
                trayaCore.registerController(controllerDOM);
            }


        });

        return htmlData;
    },

    //check if controller exists
    controllerExists : function(controllerName)
    {
        var foundController = $.grep(trayaCore.data.controllers, function(e){ return e.name == controllerName; });
        if(foundController.length == 0)
        {
            return false;
        }
        else
        {
            return true;
        }
    },

    getController : function(controllerName)
    {
        for(var i = 0; i < trayaCore.data.controllers.length; i++)
        {
            if(trayaCore.data.controllers[i].name == controllerName)
            {
                return trayaCore.data.controllers[i];
            }
        }
    },

    //define what to do with each controller
    controllerAction : function(controller){



        if(controller.type == "load")
        {
            //async load

            $.ajax({
                type: "GET",
                url: controller.handler.ajax,
                success: function (result) {
                    result = router.srcHandler(result, controller.handler.ajax);
                    controller.DOM.html(result);


                    //transform includes
                    controller.DOM.find("include").each(function (index) {
                       var includeDOM = $(this);
                        trayaCore.includeTransform(controller.handler.ajax, includeDOM);
                    });


                    //register controllers
                    controller.DOM.find("[controller]").each(function (index) {

                        var controllerDOM = $(this);

                        trayaCore.registerController(controllerDOM);

                    });

                    //this function is like constructor
                    //trayaCore.callController(controller.name);

                    //refresh routes
                    router.routerHandler();
                }
            });

            //END async load
        }
        else if(controller.type == "click")
        {

            $("body").off("click", "[controller='" + controller.name + "']"); //remove if listener exists
            $("body").on("click", "[controller='" + controller.name + "']", function () {

                trayaCore.callController(controller.name);
            });

        }
        else if(controller.type == "default")
        {
            trayaCore.callController(controller.name);
        }
        else if(controller.type == "invoke")
        {
            //nothing, manual launching
        }
        else
        {
            trayaCore.throwError("Unknown controller type " + controller.type);
        }


    },




    //when controller is called fill dom handler
    fillHandler : function(controllerName)
    {
        var handler = {};
        var foundController = $.grep(trayaCore.data.controllers, function(e){ return e.name == controllerName; });
        if(foundController.length == 1)
        {
            //fill handler
            handler.ajax = foundController[0].DOM.attr("ajax");
            handler.method = foundController[0].DOM.attr("method");
            handler.data = foundController[0].DOM.attr("data"); //TODO - parse
            handler.model = foundController[0].DOM.attr("model");



            if(typeof handler.method === "undefined")
            {
                handler.method = "get";
            }


            if(typeof handler.model === "undefined")
            {
                handler.model = controllerName;
            }

            handler.method = handler.method.toUpperCase();

            handler.controller = controllerName;
            return handler;
        }
        else
        {
            trayaCore.throwError("Controller '" + controllerName + "' cannot be found and handler cannot be filled!");
        }
    },


    //call custom made function
    callController : function(controllerName)
    {

        if (!trayaCore.data.controllers.filter(function(e) { return e.name == controllerName; }).length > 0) {

            for(var i = 0; i < trayaCore.data.controllers.length; i++)
            {
                var element = trayaCore.data.controllers[i];
                if(element.name.startsWith(controllerName + "__traya-custom__"))
                {
                    trayaCore.throwError("Controller '" + controllerName + "' cannot be invoked, it is bind to many DOM elements, use controller that is bined to one element!");
                    break;
                }
            }

            trayaCore.throwError("Controller '" + controllerName + "' does not exist!");
        }

        //var handler = trayaCore.fillHandler(controllerName);


        var handler = trayaCore.getController(controllerName).handler;

        //if controller is multiple
        if(controllerName.indexOf("__traya-custom__") > -1)
        {
            controllerName = controllerName.split("__traya-custom__")[0];
        }


        var functionToExecute = window[controllerName];
        if(typeof functionToExecute === "undefined")
        {
            trayaCore.throwWarning("Controller '" + controllerName + "' has no matching js function, it won't be launched!");
        }
        else
        {
            //controller js function exist, launch IT!;

            window[controllerName](handler);
        }

    },





    throwError : function(error)
    {
        console.log("[ERROR] >> " + error);
        throw new Error(error)
    },

    throwWarning : function(warning)
    {
        if(trayaConfig.warning)
        {
            //console.log("[WARNING] >> " + warning);
        }
    }






};



//END TRAYA CORE


//TRAYA DATA

var trayaData = {
    templates: [],

    registerTemplate: function (controller) {
        var matches = [];
        var template = controller.DOM.html();
        var templateRegex = /{{.*?}}/g;
        var index = 0;

        while (match = templateRegex.exec(template)) {
            //matches[match[index]] = match[index]; //display template variables
            matches[match[index]] = "";
        }


        var isTemplate = false;
        if (Object.keys(matches).length > 0) {
            isTemplate = true;
        }


        trayaData.templates[controller.name] = {
            html: controller.DOM.html(),
            isTemplate: isTemplate,
            variables: matches
        };
    },

    injectTemplate: function (controller)
    {
        if(trayaData.templates[controller.name].isTemplate)
        {

            var rawTemplate = trayaData.templates[controller.name].html;

            //ako je array

            //ako nije array
            for(var key in trayaData.templates[controller.name].variables)
            {
                var element = trayaData.templates[controller.name].variables[key];
                if(typeof element !== "function")
                {
                    rawTemplate = rawTemplate.replaceAll(key, element);
                }

            }


            var rv = controller.DOM.html(trayaCore.injectHTML("<div>" + rawTemplate + "</div>" ));
            return rv;
        }
        return controller.DOM;

    },

    initializeMemory: function(controller)
    {
        memory[controller.handler.model] = {};
        window["_" + controller.name] = memory[controller.handler.model];
        window["_" + controller.name]["$traya_name"] = controller.handler.model;
    },

    applyHandler: function(handler)
    {
        var controller = trayaCore.getController(handler.controller);
        controller.handler = handler;
        return controller;
    },

    bindMemory: function(handler)
    {
        var controller = trayaData.applyHandler(handler);

        //transcribe memory to template variables
        for(var key in memory[handler.model])
        {
            trayaData.templates[controller.name].variables["{{" + key + "}}"] = memory[handler.model][key];
        }

        trayaData.injectTemplate(controller);
    },

    transferMemory: function(sourceHandler, destinationControllerName)
    {
        var sourceModel = sourceHandler.model;
        var destinationModel = trayaCore.getController(destinationControllerName).handler.model;

        var bufferName = memory[destinationModel].$traya_name;
        memory[destinationModel] = trayaCore.mergeRecursive(memory[destinationModel], $.extend(true, {}, memory[sourceModel])); //kloniraj objekt
        memory[destinationModel].$traya_name = bufferName;
    },

    clearMemory: function(handler)
    {
        Object.keys(memory[handler.model]).forEach(function(key) {
            if(key !== "$traya_name")
            {
                delete memory[handler.model][key];
            }

        });
    },

    ajaxJSON: function(handler, callback)
    {
        trayaData.applyHandler(handler);
        $.ajax({
            type: handler.method,
            contentType: "application/json",
            url: handler.ajax,
            data: handler.data,
            success: function (result) {

                //handle ako nije array
                for(var element in result)
                {
                    if(element !== "$traya_name")
                    {
                       memory[handler.model][element] = result[element];
                    }

                }


                callback(result);
            }
        });
    },

    solveTrayamemory: function(dashName)
    {
        if(typeof dashName === "string")
        {
            return dashName;
        }
        else
        {
            return dashName.$traya_name;
        }
    }


}

//END TRAYA DATA


var router = {

    srcHandler: function(htmlString, parent)
    {

        var checkUrl = parent;




        var url = "";


            var splited = parent.split('/');
            splited.pop();
            var url = splited.join("/");
        var src =  url;

        var re = /(<script.*? src.*?=.*?)"(.*?)"(.*?<\/script>)/;
        htmlString = htmlString.replaceAll(re, "$1" + url + "/$2$3");
        return htmlString;
    },

    routerHandler: function() {




        var route = window.location.href.split("#")[1];
        routeConfigBase.forEach(function(entry){


        if(route.startsWith(entry.route))
        {
           entry.include.attr("style", "display: block");
        }
        else
        {
            entry.include.attr("style", "display: none");
        }


        });

    }


};


//traya handle routes
$(document).ready(function(e){

    $(window).bind('hashchange', function() {

        router.routerHandler();


    });




});

//problem kod include->include->include : treceg ne vidi :/
// napravi samo display: none na sve elemente i pokaži ih naknadno