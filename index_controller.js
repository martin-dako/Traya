$(document).ready(function (e) {

    //Internet explorer fix
    $.ajaxSetup({
        cache: false
    });

    async.load();
});