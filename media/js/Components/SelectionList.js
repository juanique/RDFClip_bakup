function SelectionList(id, directive){
    this.id = id;
    var jq = $("#"+id);

    // Add some functional directives for template rendering.
    var att;
    for(a in directive['li']){att = a;}
    directive['li'][att][".@index"] = function(arg){return arg.pos;};
    directive['li'][att][".@class+"] = function(arg){return (arg.pos == 0? "first":"");};
    //directive['li'][att][".@class+"] = function(arg){return (arg.item['startHidden'] != null &&  arg.item['startHidden'])? " hidden":"";}

    // The dataAttribute is the name of the array variable that holds the actual data.
    this.dataAttribute = att.substr(att.indexOf('-')+1);

    //Compile the template using the given directive
    this.template = jq.compile(directive);

    this.listeners = [];
}

SelectionList.prototype = update(new Notifier(),{
    fade: true,
    fadeDuration: 200,

    hide : function(){
        var list = $("#"+this.id);
        if(this.fade){
            list.fadeOut(this.fadeDuration);    
        }else{
            list.hide();
        }
    },

    show : function(){
        var list = $("#"+this.id);
        if(this.fade){
            list.hide();
            list.fadeIn(this.fadeDuration);    
        }else{
            list.show();
        }

    },

    setData : function(data){
        var list = $("#"+this.id);

        /* unsopported
        if(typeof (this.data) == "undefined" || this.data[this.dataAttribute].length > 0 && data[this.dataAttribute].length == 0){
            this.hide();
        }
        */

        list.render(data, this.template);
            
        if(typeof (this.data) != "undefined" && this.data[this.dataAttribute].length == 0 && data[this.dataAttribute].length > 0){
            data['startHidden'] = true;
            this.show();
        }

        this.data = data;

        //Add list functionality
        var listItems = $("#"+this.id).find("li");
        var self = this;
        listItems.bind("mouseover", function(){ $(this).addClass("mouseOver"); });
        listItems.bind("mouseout", function(){ $(this).removeClass("mouseOver"); });
        listItems.bind("click", function(){ self.itemClicked($(this).attr("index")); });


        if(this.toggle || this.select){
            listItems.bind("click", function(){ 
                var me = $(this);
                if(me.hasClass("selected")){
                    if(!self.select){
                        me.removeClass("selected");
                    }
                }else{
                    if(self.select){
                        listItems.removeClass("selected");
                    }
                    me.addClass("selected");
                }
            });
        }

        this.notifyAll("dataChanged",{"data":data});
    },

    itemClicked : function(index){
        this.notifyAll(
            "itemSelected",
            {
                index : index,
                data : this.data[this.dataAttribute][index]
            }
        );
    }
});
