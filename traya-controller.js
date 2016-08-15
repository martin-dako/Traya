//traya controller

/*
var count = 0;

function nested(handler)
{

    count++;

    var x = trayaCore.injectHTML('' +

        '<button controller="xyz" quantity="one" type="click" data="ragnar' + count + '">eo me :)</button>' +

            '<span>aaaaaaaaaaaaaaaaaaaaaaa</span>');


    $("#result").html(x);

}




function xyz(handler)
{
    console.log(handler.data);
}

*/

function printText(handler)
{
    bindMemory(handler);
}

function handleText(handler)
{

    memory.handleText.id = "Braca";
    memory.handleText.title = "domanyyyyy";
    memory.handleText.nomen = "buuuuu";


    bindMemory(handler);
    transferMemory(handler, "printText");
    clearMemory(handler);

    invoke("printText");

}

function handleText2(handler)
{

    handler.method = "get";
    handler.ajax = "http://jsonplaceholder.typicode.com/posts/1";

    ajaxNoBinding(handler, function(data){

        transferMemory(handler, "printText");
        invoke("printText");
    });

}



$(document).ready(function(){
    traya.load();
});