$(document).ready(function(){
    //Basic CSS properties
    $("input").bind("blur", function(){ 
            $(this).removeClass("focus");
    });
    $("input").bind("focus", function(){ 
            $(this).addClass("focus");
    });


    //Default empty values
    $("input[emptyValue]").bind("blur",function(){
        if($(this).val() == ""){
            $(this).val($(this).attr("emptyValue"));
            $(this).addClass("empty");
        }

    });

    $("input[emptyValue]").bind("focus",function(){
        if($(this).val() == $(this).attr("emptyValue")){
            $(this).val("");
        }
        $(this).removeClass("empty");
    });

    $("input[emptyValue]").each(function(intIndex){
        if($(this).val() == "" || $(this).val() == $(this).attr("emptyValue")){
            $(this).val($(this).attr("emptyValue"));
            $(this).addClass("empty");
        }
    })

    //hints
    $("input[hintId]").each(
        function(intIndex){
            // Assign hints to inputs
            var hint = $("#"+$(this).attr("hintId"));
            if( typeof hint != "undefined" ){
                hint.append(' <span class="hintPointer">&nbsp;</span>');
                hint.css("display","none");
                $(this).bind(
                    "focus", function(){ hint.css("display","inline"); }
                );
                $(this).bind(
                    "blur", function(){ hint.css("display","none"); }
                );
            }
        }
    ); 

});
