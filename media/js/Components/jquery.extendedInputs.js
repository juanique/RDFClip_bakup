(function($){
    $.fn.extend({
        focusClass : function(){
            return this.each(function(i,input){
                jInput = $(input);
                jInput.bind("blur", function(){ 
                        $(this).removeClass("focus");
                });
                jInput.bind("focus", function(){ 
                        $(this).addClass("focus");
                });
            });
        },

        emptyValue : function(emptyValue){
            this.focusClass();
            return this.each(function(i,input){
                jInput = $(input);
                emptyValue = emptyValue || jInput.attr('emptyValue');
                jInput.bind("blur",function(){
                    if($(this).val() == ""){
                        console.debug('is empty!');
                        $(this).val(emptyValue);
                        $(this).addClass("empty");
                    }

                });

                jInput.bind("focus",function(){
                    if($(this).val() == emptyValue){
                        $(this).val("");
                    }
                    $(this).removeClass("empty");
                });

                if(jInput.val() == "" || jInput.val() == jInput.attr("emptyValue")){
                    jInput.val(emptyValue);
                    jInput.addClass("empty");
                }
            });
        }

    });
})(jQuery);
