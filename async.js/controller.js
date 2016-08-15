//var prefixRoute = "/campaignmailer"; //production

var prefixRoute = ""; //test


include(prefixRoute + "/Scripts/jsModels/campaign.js")



var currentCampaign = "0";
var ckeditor = {};
var currentTestEmail = {};
var totalTestEmail = 0;
var currentNumberEmail = 0;
var currentStatus = "1";

//ne controller funkcije
function arrayToString(array)
{
    var returnString = "";
    for (var key in array)
    {
        var bufferedArray = array[key];
        for(var j in bufferedArray)
        {
            returnString += bufferedArray[j] + ";";
        }
        returnString = returnString.substring(0, returnString.length - 1);
        returnString += "|";
    }
    returnString = returnString.substring(0, returnString.length - 1);
    return returnString;
}

function beautifyEmail(emailInput)
{

    try
    {

    
        totalTestEmail = 0;
        var emailInputSplited = emailInput.split("|||||~~|||||");


        var returnString = "";

        returnString += '<div class="testMessage">Prvih nekoliko testnih poruka</div>';

        returnString += '<div class="previousNextTestEmailNumber">';
        returnString += '<a class="previousNext" href="javascript: void(0);" click-controller="clickPrevEmail">Prethodna</a> ';
        returnString += '<a class="previousNext" href="javascript: void(0);" click-controller="clickNextEmail">Sljedeæa</a>';
        returnString += '<div class="testEmailNumberOf" invoke-controller="pagerEmailTest">{{binded.pageNumber}}</div>';
        returnString += '</div>';
        returnString += '<div>'

        for (var j = 0; j < emailInputSplited.length; j++)
        {
            if (emailInputSplited[j] == "")
            {
                continue;
            }
            totalTestEmail += 1;

            var email = emailInputSplited[j].split("~~~~12xx12~~~~");
       
            returnString += '<div class="email"'

            if (j == 0)
            {
                returnString += 'style="display: block;"'
            }
            else
            {
                returnString += 'style="display: none;"'
            }

            returnString += '>';
           // console.log(email);
            returnString += '<div class="from emailAttribute"><div class="mailTitle">Od:</div>' + email[0].split(':')[1] + '</div>';
            returnString += '<div class="to emailAttribute"><div class="mailTitle">Za:</div>' + email[1].split(':')[1] + '</div>';
            returnString += '<div class="cc emailAttribute"><div class="mailTitle">Kopija:</div>' + email[2].split(':')[1] + '</div>';
            returnString += '<div class="subject emailAttribute"><div class="mailTitle">Predmet:</div>' + email[3].split(':')[1] + '</div>';

            returnString += '<div class="body">';
            for (var i = 4; i < email.length; i++) {
                returnString += email[i] + "<br />";
            }

            returnString = returnString.trim('<br />');
            returnString += '</div>';

            returnString += '</div>';
        
        }
        returnString += '</div>';
        returnString += '<div class="alert alert-success">Testiranje je uspješno izvršeno! Ukoliko testne poruke odgovaraju, poruke su spremne na slanje.</div>';

        returnString += '<button id="button2id" class="btn btn-primary" name="button2id">Pošalji</button>';
        currentNumberEmail = 1;




        return returnString;
    }
    catch(error)
    {
        $("#test_response").html("");
        alert("POGREŠKA: " + emailInput);
    }
}


var croatianLetters = {};

croatianLetters["&~X~&c~"] = "æ";
croatianLetters["&~X~&cc~~"] = "è";
croatianLetters["&~X~&z~"] = "ž";
croatianLetters["&~X~&d~"] = "ð";

croatianLetters["&~X~&C~"] = "Æ";
croatianLetters["&~X~&CC~~"] = "È";
croatianLetters["&~X~&Z~"] = "Ž";
croatianLetters["&~X~&D~"] = "Ð";


function encodeCroatian(stringCroatian)
{
    if (stringCroatian != null)
    {
        $.each(croatianLetters, function (key, value) {
            stringCroatian = replaceAll(stringCroatian, value, key);
        });
    }


    return stringCroatian;
}


function decodeCroatian(stringCroatian) {
   
    if (stringCroatian != null) {
        $.each(croatianLetters, function (key, value) {
            stringCroatian = replaceAll(stringCroatian, key, value);
        });
    }
    

    return stringCroatian;
}

//END ne controller funkcije

function viewStatistics(handler)
{
    $("#test_response").html("");
    handler.url = prefixRoute + "/Campaign/stats";
    handler.data = {};
    handler.model = "stats";
    handler.data.campaignId = currentCampaign;

    ajaxNoBinding(handler, function () {
        var htmlResponse = "";

        if (memory.stats.length == 0)
        {
            $("#view_statistics").html("Nema podataka");
            return;
        }

        memory.stats.forEach(function (value) {
            htmlResponse += '<div class="statEmail">' + value.EMAIL + ' - ' + value.VRIJEME + '</div>';
        });

        $("#view_statistics").html(htmlResponse);
    });


    
}

function status(handler)
{
    handler.url = prefixRoute +  "/Campaign/status";
    handler.method = "GET";

    ajax(handler, function () { });
}

function pagerEmailTest(handler)
{
    memory.binded = {};
    memory.binded.pageNumber = currentNumberEmail+"/" + totalTestEmail;

    bindMemory(handler);
}


function clickNextEmail(handler)
{
   
    if (currentTestEmail.next().length) {
      
        currentTestEmail.hide();
        currentTestEmail = currentTestEmail.next();
        currentTestEmail.show();
        currentNumberEmail += 1;
        invoke("pagerEmailTest");
       
    }
}

function clickPrevEmail(handler)
{
   
    if (currentTestEmail.prev().length) {
        currentTestEmail.hide();
        currentTestEmail = currentTestEmail.prev();
        currentTestEmail.show();
        currentNumberEmail -= 1;
        invoke("pagerEmailTest");
    }
}


function campaignList(handler)
{
    handler.url = prefixRoute +  "/Campaign/List";
    ajax(handler, function () {
        //console.log(memory.campaignList);
    });
}

function campaignDelete(handler) {
    handler.url = prefixRoute + "/Campaign/Delete";

    if (confirm('Želite li obrisati kampanju: ' + handler.data.name + "?")) {

        ajax(handler, function () {
            invoke("campaignList");
        });
    }

}

function clickTag(handler)
{
    CKEDITOR.instances['editor'].insertText("##" + handler.data.tagName);
}

function invokeTags(handler)
{
    handler.url = prefixRoute + "/Campaign/excelTags";
    handler.model = "tags";
    handler.method = "POST";

    handler.data = {};
    handler.data.excelFileName = temporaryExcelName;
    handler.data.excelFile = temporaryExcel;
   
    ajaxNoBinding(handler, function () {
        
        var tagString = "";

        if (typeof memory.tags.error === "undefined")
        {
            memory.tags.forEach(function (entry) {
                tagString += '<div click-controller="clickTag" data="tagName:' + entry + '" class="tag">' + entry + '</div>';
            });

            memory.binded = {};
            memory.binded.tags = tagString;
            bindMemory(handler);
        }
        else
        {
            //console.log(memory.tags.error);
            
            $("#excelResponse").html($("#excelResponse").html() + '<div class="alert alert-danger">' + memory.tags.error + '</div>');

        }




    });

    //
}

function newCampaign(handler)
{

    handler.data.excelFileName = temporaryExcelName;
    handler.data.excelFile = temporaryExcel;

    handler.data.wordFilename = "ckeditor.txt";


    handler.data.wordFile = encodeURIComponent(encodeCroatian(ckeditor.getData()));




//    console.log(temporaryWordName);

    handler.data.attachs = arrayToString(attachments);

    $("#mainEditorErrors").hide();
    var value = ckeditor.getData();


    if (value == "") {

        $("#mainEditorErrors").show().html("Nema poruke");
    }
    else
    {
        if (jvalValidate()) {

            if (currentCampaign == "0")
            {
                handler.url = prefixRoute + "/Campaign/AddNew";
                handler.method = "POST"
        
                ajax(handler, function () {
                    currentCampaign = memory.newCampaign.SIF_KAMPANJA;
                    $("#button1id").show();
                });
  
            }
            else
            {
                handler.url = prefixRoute + "/Campaign/updateCapaign";
                handler.method = "POST"
                handler.data.campaignId = currentCampaign;

                ajax(handler, function () {
                    $("#button1id").show();
                });

        
            }
        }
    }
   
}

function invokeText(handler)
{

    temporaryWord = decodeCroatian(temporaryWord);

    CKEDITOR.instances['editor'].setData(temporaryWord, function () {



        CKEDITOR.instances['editor'].setData(temporaryWord, function () {
            CKEDITOR.instances['editor'].setData(temporaryWord, function () {
                
            });
        });
    });

}

function invokeExcel(handler)
{
    $("#excelResponse").html(memory.campaign.EXCEL_NAME);
}

function invokeWord(handler)
{
    $("#wordResponse").html(memory.campaign.WORD_NAME);
}

function invokeSubject(handler)
{
    bindMemory(handler);
}

function invokeEmail(handler)
{
    $('.emailSelect option[value="' + memory.campaign.EMAIL + '"]').attr("selected", "selected");
}

function invokeStatus(handler) {
  //  console.log("Pozvan");
    $('.statusSelect option[value="' + memory.campaign.STATUS + '"]').attr("selected", "selected");
}

function initCampaign(handler)
{
    handler.url = prefixRoute + "/Campaign/GetCampaign";
    handler.model = "campaign"

    if (handler.data.id != "")
    {
        //kampanja je dohvacena
        currentCampaign = handler.data.id;

        ajax(handler, function () {
            

            temporaryExcel = memory.campaign.EXCEL_DATA;
            temporaryExcelName = memory.campaign.EXCEL_NAME;

            temporaryWord = memory.campaign.WORD_DATA;
            temporaryWordName = memory.campaign.WORD_NAME;
           
            
            invoke("invokeName");
            invoke("invokeExcel");
            invoke("invokeWord");
            invoke("invokeAttachs");
            invoke("invokeSubject");
            invoke("invokeEmail");
            invoke("invokeStatus");
            invoke("invokeText");

            invoke("invokeTags");
        });
    }
    else
    {
        memory.campaign = campaignModel;
        invoke("invokeName");
        invoke("invokeExcel");
        invoke("invokeWord");
        invoke("invokeAttachs");
        invoke("invokeSubject");
       // invoke("invokeEmail");
        invoke("invokeText");
        
        
    }
   

}


function invokeName(handler)
{
    bindMemory(handler);
}

function invokeAttachs(handler)
{
    handler.url = prefixRoute + "/Campaign/GetCampaignAttachs";
    handler.model = "attachs";
    handler.data = {};
    handler.data.id = currentCampaign;

    ajax(handler, function () {
       //console.log(memory.attachs);
        attachments = memory.attachs;

        renderAttachments();
    });
}



$(document).ready(function (e) {

    //Internet explorer fix
    $.ajaxSetup({
        cache: false
    });

    
    var ckconfig = {
        language: 'hr',
        height: '700px',
        entities_latin: true
    }   
   

    try {
        ckeditor = CKEDITOR.replace('editor', ckconfig);
    }
    catch (err) {
        
    }

    async.load();
});







