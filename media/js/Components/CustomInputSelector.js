function CustomInputSelector(selector, inputId, autoResize){
    this.selector = selector;
    this.selectorId = selector.id;
    this.inputId = inputId;
    if(typeof(autoRezise) == "undefined")
        autoRezise = false
    this.autoResize = autoResize

    var self = this;
    this.selector.addListener(
        {"dataChanged" : function(e){ self.init() } }
    );

    this.init();
}

CustomInputSelector.prototype = update(new Notifier(),{
    mouseOverSelector : false,
    focusOnInput: false,

    fade: true,
    fadeDuration: 100,

    init: function(){
        var self = this;

        jSelector = $("#"+this.selectorId);
        jInput = $("#"+this.inputId);

        if(this.autoResize){
            jSelector.css("position","absolute");
            jSelector.css("top" , jInput.offset().top + jInput.outerHeight());
            jSelector.css("left" , jInput.offset().left);
            jSelector.width(jInput.outerWidth());
        }

        jInput.bind("focus", function(){ 
            self.showSelector();
            self.focusOnInput = true; 
        });
        jInput.bind("blur", function(){ 
            if(!self.mouseOverSelector){
                self.hideSelector();
            }
            self.focusOnInput = false;
        });

        jSelector.bind("mouseover", function(e){
            self.mouseOverSelector = true;
       });

        var mouseOut = function(e){
            var y0 = jInput.offset().top;
            var y1 = y0 + jInput.outerHeight() + jSelector.outerHeight();
            var x0 = jInput.offset().left;
            var x1 = x0 + jInput.outerWidth();

            var inside = e.pageX > x0 && e.pageX < x1 && e.pageY > y0 && e.pageY < y1;

            self.mouseOverSelector = inside;

            if(!self.focusOnInput && !self.mouseOverSelector)
                self.hideSelector();
        };

        jSelector.bind("mouseout", mouseOut);
        jInput.bind("mouseout", mouseOut);

    },

    hideSelector : function(jSelector){
        if(typeof(jSelector) == "undefined")
            jSelector = $("#"+this.selectorId);
        if(this.fade){
            jSelector.fadeOut(this.fadeDuration);
        }else{
            jSelector.hide();
        }
    },
    showSelector : function(jSelector){
        if(typeof(jSelector) == "undefined")
            jSelector = $("#"+this.selectorId);

        if(this.fade){
            jSelector.fadeIn(this.fadeDuration);
        }else{
            jSelector.show();
        }
    }
});
