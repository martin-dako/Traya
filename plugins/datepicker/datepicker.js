function echo(handler)
{
   bindMemory(handler);
    console.log(handler);

}

function loadEcho(handler)
{
    handler.type="click";
    handler.ajax = "./test.json";


     ajaxNoBinding(handler, function(){
        transferInvoke(handler, _echo);


    });

}