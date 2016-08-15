# Idea #

* have components with HTML[skeleton] and JS[what to do]
* include html in other html

lets say we have component:


```
#!html

<!-- ./plugins/test/echo_test.html -->

<!-- We include script with JS contollers (same folder as this HTML) -->
<!-- On button click fill html with async call -->
<script src="./plugins/test/echo_test.js"></script>

<!-- we put our HTML skeleton -->
<div controller="echo" type="invoke">
    {{name}} - {{surname}}
</div>
<button controller="loadEcho" type="click">Click me</button>
```


```
#!javascript
// ./plugins/test/echo_test.js

function echo(handler)
{
    bindMemory(handler);
}

function loadEcho(handler)
{
    handler.type="click";
    handler.ajax = "./test.json";
    handler.method= "GET";

    ajaxNoBinding(handler, function(){
        transferInvoke(handler, _echo);
    });
}
```

```
#!html

<!-- ./index.html -->

<!-- We include component in our index.html-->
<include src="./plugins/test/echo_test.html"></include>
```


# Basics #
* If div has attribute controller that div is controller
* Every controller must have defined javascript function with same name as controller and handler argument eg. 


```
#!html

<div controller="echo"></div>
```

must have function


```
#!javascript

function echo(handler)
{
   //function body goes here
}
```

### There are 4 controller types ###
* default - controller js function will be launched when html is loaded
* click   - controller js function will be launched on element click
* invoke  - controller js function will be launched on invoke(_controller); function call from js
* load    - ajax html will be embedded in this place, it is depricated to use this controller from html, <include src="path"></include> will be translated to this in runtime


```
#!html

<div controller="echo" type="click"></div>
```

If no type attribute is provided, "default" value will be provided in handler

* There is rule: one html -> one controller
* If you would like to use more HTML for same js use html attribute quantity="many" (default is quantity="one")

```
#!html

<div controller="echo" quantity="many"></div>
```

# Handler argument #

### Handlers hold information that is injected in controller function. Information is generated when controller's html is loaded. It contains: ###
* ajax - url to load [default: -undefined-], 
* method - ajax call method [default: "GET"], 
* data - data for ajax call [default: -undefined-], 
* model - [default: -controllerName-], 
* controller - controller name

### Handler can be filled directly in html: ###

```
#!html
<div controller="echo" data="" method="post" model="user" ajax="http://apiexample.com/v1/1"></div>

```

# Templates #

* Template is HTML body that will be filled with some variable data
* Variable data is set like this {{variable}}
* Every controller has own memory
* memory is global, anyone can read/write in controller memory
* Memory is stored in _controllerName
* Steps: *define template in HTML* -> *fill controller memory* -> *bind controller memory to template*


```
#!html
<!-- define template -->
<div controller="echo">My id: {{id}} and my name is {{name}}</div>
```


```
#!javascript

function echo(handler)
{
  //fill memory
  _echo.id = "12";
  _echo.name = "Ricky";

  //bind to template
  bindMemory(handler);
}
```

Rendered html will be:
```
#!html
My id: 12 and my name is Ricky
```


# AJAX call #
```
#!javascript

//auto handle ajax call
function echo(handler)
{

  handler.ajax = "http://....";
  handler.method = "PUT";

  //call ajax and bind memory
  ajax(handler);
}
```

```
#!javascript

//manual handle ajax call
function echo(handler)
{

  handler.ajax = "http://....";
  handler.method = "PUT";

  //call ajax and do custom stuff with result (result is stored in _echo)
   ajaxNoBinding(handler, function(){
        
        //manipulate _echo memory
        _echo.id = _echo.id + "_aaa";

        //just bind memory
        bindMemory(handler);
    });
}
```

```
#!javascript

//async call from one controller (clickController) and display result in other controller (echoController)

//display result
function echoController(handler)
{
   bindMemory(handler);
}

//handle async request and pass clickController memory to echoController memory
function clickController(handler)
{
  handler.ajax = "http://....";
  handler.method = "GET";

  //call ajax and do custom stuff with result (result is stored in _echo)
   ajaxNoBinding(handler, function(){
        
        //manipulate _echo memory
        

        //just transfer memory to clickController and invoke echoController
        transferInvoke(handler, _echoController);
       

       //this is transferInvoke manualy
       transferMemory(handler, _echoController);
       invoke(_echoController);

    });
}
```


# HTML Include #




```
#!html
<include src="path"></include>

```