var DropDownList = Notifier.extend({

    init : function(jUl,jTemplate){
        var self = this;
        self._super();

        self.jTemplate = jTemplate || false;
        self.jUl = jUl || jQuery("<ul>");
        self.jUl.addClass('DropDownList');
        self.initOptions();
    },

    initOptions : function(){
        var self = this;

        self.jUl.find('li').bind({
            'mouseover' : function(e){
                self.jUl.find('li').removeClass('highlighted');
                jQuery(this).addClass('highlighted');
                self.highlighted  = this;
            },
            'mouseout'  : function(e){
                jQuery(this).removeClass('highlighted');
                self.highlighted = null;
            },
            'click' : function(e){
                self.notifyAll('optionSelected',jQuery(this).data('value'));
            }
        });
    },

    next : function(){
        var self = this;
        var next, current;

        if(self.highlighted != null){
            current = jQuery(self.highlighted);
        }
        if(current){
            current.removeClass('highlighted');
            next = current.next();
        }
        if(!current || next.length == 0){
            next = jQuery(self.jUl.children()[0]);
        }

        next.addClass('highlighted');
        self.highlighted = next[0];
    },

    prev : function(){
        var self = this;
        var prev, current;

        if(self.highlighted != null){
            current = jQuery(self.highlighted);
        }
        if(current){
            current.removeClass('highlighted');
            prev = current.prev();
        }
        if(!current || prev.length == 0){
            var children = self.jUl.children();
            prev = jQuery(children[children.length - 1]);
        }

        self.jUl.find('li').removeClass('highlighted');
        prev.addClass('highlighted');
        self.highlighted = prev[0];
    },

    setOptions : function(opts){
        var self = this;
        if(opts.length == 0){
            self.hide();
        }
        self.jUl.empty();


        for(var i = 0; i < opts.length; i++){
            var opt = opts[i];
            var jLi;

            if(self.jTemplate){
                jLi = self.jTemplate.tmpl(opts[i]);
                jLi.data('value',opts[i]);
            }else{
                if(typeof(opt) == 'string'){
                    jLi = jQuery('<li>');
                    jLi.html(opt);
                    jLi.data('value',opt);
                }else{
                    if(opt.tagName && opt.tagName == 'LI'){
                        jLi = opt;
                    }else{
                        jLi = jQuery('<li>');
                        if(opt.value){
                            jLi.data('value',opt.value);
                        }
                        jLi.html(opt.name);
                    }
                }
            }

            self.notifyAll('optionAdded',jLi);
            self.jUl.append(jLi);
        }
        self.initOptions();
        self.notifyAll('optionsChanged');
    },

    hide : function(){
       var self = this;
       self.jUl.hide();
    },
    show : function(){
       var self = this;
       self.jUl.show();
    },

});
