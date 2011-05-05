function SuggestionInput(inputId, listTemplateId, listDirective, listDataAttribute){
    this.init(inputId, listTemplateId, listDirective, listDataAttribute);
}

SuggestionInput.prototype = update(new Notifier(),{
    hideSuggestionsFunc : null,
    unhideSuggestionsFunc : null,
    mouseOverOptions : false,
    jInput : null,

    init : function(inputId, listTemplateId, listDirective, listDataAttribute){
        this.list = new SelectionList(listTemplateId, listDirective, listDataAttribute);
        this.jInput = $('#'+inputId);
        var self = this;

        this.list.addListener( {
            "itemSelected" : function(e, list){ self.jInput.val(e.data.displayName); self.jInput.focus(); },
            "dataChanged"  : function(e, list){ self.dataChanged(e, list); }
        });
    },

    dataChanged : function(e, list){
            var inputHTML = this.jInput;
            var listHTML = $('#'+list.id);
            var self = this;

            listHTML.css("top" , inputHTML.offset().top + inputHTML.outerHeight());
            listHTML.css("left" , inputHTML.offset().left);
            listHTML.width(inputHTML.outerWidth());

            if(this.unhideSuggestionsFunc = null)
                inputHTML.unbind("focus", this.unhideSuggestionsFunc);
            if(this.hideSuggestionsFunc != null)
                inputHTML.unbind("blur", this.hideSuggestionsFunc);
            

            this.unhideSuggestionsFunc = function(){ self.list.show(); };
            this.hideSuggestionsFunc = function(){ if(!self.mouseOverOptions){self.list.hide()}};
            inputHTML.bind("focus", this.unhideSuggestionsFunc);
            inputHTML.bind("blur",this.hideSuggestionsFunc);

            listHTML.unbind("mouseover");
            listHTML.bind("mouseover", function(){ self.mouseOverOptions = true;});
            listHTML.unbind("mouseout");
            listHTML.bind("mouseout", function(){ self.mouseOverOptions = false;});
        },
        setSuggestions : function(data){
            this.list.setData(data);
        }
});
