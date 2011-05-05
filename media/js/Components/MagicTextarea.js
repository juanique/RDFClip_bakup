var a = '';

function get_random_color() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

function placeOnTop(under, over){
    over.css('position','absolute');
    over.offset(under.offset());
    over.width(under.width());
    over.height(under.height());
}

function pixelIncrement(element, property, ammount){
    element.css(property, (parseFloat(element.css(property)) + ammount)+"px")
}

var SparqlParser = Notifier.extend({
    init: function(){
        var self = this;
        self._super();

        self.sparql_variables = {};
    },

    /*
    parseCaretWord : function(word){
        if(word == 'fuck')
            return 'f**k';
        if(word == 'Fuck')
            return 'f**k';
        if(word == 'Camilo'){
            var span = jQuery('<span>Camilo Lopez</span>');
            var div = jQuery('<div title="decklord@gmail.com">');
            span.css('border-bottom','1px dotted blue');
            return {span : span[0], tag : div[0]};
        }
        
        return word;
    },
    */

    parseNodeText : function(text){
        var self = this;
        var dedupe = {}
        var nodes = [text];
        var new_nodes = [];
        var variables = text.match(/\?[a-zA-Z0-9]+/g);

        if(!variables){
            return nodes;
        }
        for(var i = 0; i < variables.length; i++){
            dedupe[variables[i]] = 1;
        }
        for(var sparql_var in dedupe){
            for(var i = 0; i < nodes.length; i ++){
                if(typeof(nodes[i]) == 'string'){
                    try { 
                        var colored_nodes = self.colorWord(nodes[i], sparql_var);
                    } catch(e) {
                        console.trace();

                    }
                    new_nodes = new_nodes.concat(colored_nodes);
                }else{
                    new_nodes.push(nodes[i]);
                }
            }
            nodes = new_nodes;
            new_nodes = [];
        }
        return nodes;
    },

    colorWord : function(nodeText,word){
        var self = this;
        
        var out = self.magicEngine.matchWord(nodeText,word,self.magicEngine.word_separators,self);
        return out;
    },

    wordMatch : function(word){
        var self = this;
        var span = jQuery("<span>"+word+"</span>");
        span.css('background', self.getVarColor(word));
        span.css('opacity',0.2);
        var tag = jQuery("<div>");
        span.attr('sparqlVar',word);
        tag.attr('sparqlVar',word);

        var spans = jQuery(document.body).find('span');
        for(var i = 0; i <= spans.length; i++){
            var jSpan = jQuery(spans[i]);
            if(jSpan.attr('sparqlVar') == word){
                jSpan.animate({'opacity' : 1},150, function(){
                    jQuery(this).animate({opacity: 0.2},150,function(){})
                });
            }
        }

        tag.bind({
            'mouseover' : function(e){
                var spans = tag.parent().find('span');
                for(var i = 0; i < spans.length; i++){
                    var jSpan = jQuery(spans[i]);
                    if(jSpan.attr('sparqlVar') == jQuery(this).attr('sparqlVar')){
                        jSpan.animate({'opacity' : 1},100, function(){});
                    }
                }
            },
            'mouseout' : function(e){
                var spans = tag.parent().find('span');
                for(var i = 0; i < spans.length; i++){
                    var jSpan = jQuery(spans[i]);
                    if(jSpan.attr('sparqlVar') == jQuery(this).attr('sparqlVar')){
                        jSpan.animate({'opacity' : 0.2},100, function(){});
                    }
                }
            }
        });

        return {span : span[0], tag : tag[0]};
    },

    getVarColor : function(variable){
        var self = this;
        var color;

        if(self.sparql_variables[variable]){
            color = self.sparql_variables[variable];
        }else{
            color = get_random_color();
            self.sparql_variables[variable] = color;
        }
        return color;
    }
});

var MagicTextArea = Notifier.extend({
    
    init: function(jTa){
        var self = this;
        self._super();

        self.suggestionTriggers = [];
        self.jTa = jTa;
        self.parsers = [];
        self.word_separators = [' ','.','\'',',','{','}','(',')','\n'];
        self.last_value = "";
        self.lastParsed = "";
        self.lastCaretWord = "";

        jTa.attr('spellcheck',false);
        jTa.addClass('magicTextarea');

        self.jTa.bind({
            'keypress' : function(e){
                setTimeout( function(){
                    self.fitToContent();
                    self.updateMagicTextAreaDiv(e)
                },1);
            },
            'keyup' : function(e){
                self.magicTextAreaKeyup(e);
            },
            'change' : function(e){
                self.fitToContent();
                self.updateMagicTextAreaDiv(e)
            }
        });

        if(jQuery.browser.webkit){
            self.jTa.keyup(function(e){
                setTimeout( function(){self.updateMagicTextAreaDiv(e)},1);
            });
        }

        self.jMagicDiv = jQuery("<div>").addClass("textareaMagicDiv");
        var jWrap1 = jQuery("<div>").css('position','absolute');
        var jWrap2 = jQuery("<div>").css('position','relative');

        self.jTa.before(jWrap1);
        self.jTa.before(jWrap2);

        self.jTa.detach();
        jWrap1.append(self.jMagicDiv);
        jWrap2.append(self.jTa);

        pixelIncrement(self.jMagicDiv,'width',-3);
        pixelIncrement(self.jMagicDiv,'height',-1);
        if(jQuery.browser.mozilla){
            pixelIncrement(self.jMagicDiv,'padding-top',1.4);
            pixelIncrement(self.jMagicDiv,'padding-left',1.5);
        } else if(jQuery.browser.webkit){
            pixelIncrement(self.jMagicDiv,'padding-top',1.5);
            pixelIncrement(self.jMagicDiv,'padding-left',2.7);
        }

        self.jWrap = jWrap1;

        placeOnTop(self.jTa,jWrap1);
        self.fitToContent();
        jQuery(window).bind({
            "unload" : function(){
                self.jTa.val(self.value());
            },
            "resize" : function(){
                self.adjustMagicDiv();
            }
        });

    },

    setUseColoredFonts : function(colors){
        if(colors){
            self.jTa.css('opacity',0.2);
            self.textareaMagicDiv.css('color' , 'black');
        }else{
            self.jTa.css('opacity',1);
            self.textareaMagicDiv.css('color' , 'transparent');
        }

    },


    magicTextAreaKeyup : function(e){
        var self = this;
        var caretWord = self.getCaretWord ();
        if(caretWord.word != self.lastCaretWord){
            self.lastCaretWord = caretWord.word;
            self.notifyAll('caretWordChange',caretWord);
        }
        for(var i = 0; i < self.parsers.length; i++){
            if(self.parsers[i].parseCaretWord && self.caretTransform(self.parsers[i])){
                return;
            }
        }
    },

    updateMagicTextAreaDiv : function(e){
        var self = this;


        if(self.jTa.val() == self.last_value)
            return;

        self.last_value  = self.jTa.val();

        var text = self.jTa.val();
        var currentNodes = self.jMagicDiv.contents().toArray();
        var newNodes = [];
        var newTailNodes = [];
        var nodeText;

        //debug("HEAD NODES........................");
        while(currentNodes.length > 0){
            var node = currentNodes[0];
            nodeText = jQuery(node).text();
            if(nodeText.length < 1){
                currentNodes.shift();
                continue;
            }

            if(text.indexOf(nodeText) == 0){
                //debug("Unmodified node "+node.tagName+" - '"+jQuery(node).text()+"'");
                var nNode = currentNodes.shift();
                newNodes.push(nNode);
                text = text.replace(new RegExp("^"+RegExp.escape(nodeText)),"");
            }else{
                //debug("Modified head node : "+node.tagName+" - "+jQuery(node).text());
                break;
            }
        }


        //debug("TAIL NODES........................remaining text: "+text);
        while(currentNodes.length > 0){
            var node = currentNodes[currentNodes.length-1];
            nodeText = jQuery(node).text();
            if(nodeText.length < 1){
                currentNodes.pop();
                continue;
            }
            //debug('Testing /'+jQuery(node).text()+"$/ against "+"'"+text+"'");
            if(text.match(new RegExp(RegExp.escape(nodeText)+"$"))){
                //debug("Unmodified node "+node.tagName+" - '"+jQuery(node).text()+"'");
                newTailNodes.unshift(currentNodes.pop());
                text = text.replace(new RegExp(RegExp.escape(nodeText)+"$"),"");
            }else{
                //debug("Modified tail node : "+node.tagName+" - "+jQuery(node).text());
                break;
            }
        }


        if(text.length > 0){
            if(newNodes.length > 0 && (newNodes[newNodes.length-1].tagName != 'SPAN' || self.word_separators.indexOf(text[0]) == -1) ){
                //debug('Merging back');
                var lastText = jQuery(newNodes[newNodes.length-1]).text();
                currentNodes.push(newNodes.pop());
                text = lastText+text;
            }
            if(newTailNodes.length > 0 && (newTailNodes[0].tagName != 'SPAN' || self.word_separators.indexOf(text[text.length-1]) == -1)){
                debug('Merging front');
                var firstText = jQuery(newTailNodes[0]).text();
                currentNodes.push(newTailNodes.shift());
                text += firstText;
            }
        }
        var generatedNodes = self.parseNodeText(text);
        generatedNodes = generatedNodes.map(function(n){ return (typeof(n) == 'string')? document.createTextNode(n):n;});

        self.jMagicDiv.html("");
        self.jMagicDiv.append(jQuery(newNodes));
        self.jMagicDiv.append(jQuery(generatedNodes));
        self.jMagicDiv.append(jQuery(newTailNodes));

        for(var i = 0; i < currentNodes.length; i++){
            if(currentNodes[i].tagName == 'SPAN'){
                if(currentNodes[i].tag){
                    jQuery(currentNodes[i].tag).remove();
                }
            }
        }

        //debug(newNodes);
        self.refreshTags();
    },


    matchWord : function(text,word,seps,parser){

        var self = this;
        var out = [];
        seps = seps.slice(0);

        if(text.indexOf(word) < 0)
            return [text];

        if(seps.length > 0){
            var sep = seps.pop();
            var tokens = text.split(sep);
            var unmatched = [];

            for(var i in tokens){
                var next_colored = self.matchWord(tokens[i],word, seps, parser);
                for(var j = 0; j < next_colored.length; j++){
                    var next = next_colored[j];
                    if(out.length > 0 && j == 0){
                        var last_out = out[out.length-1];
                        if(typeof(last_out) == 'string'){
                            out[out.length-1] += sep;
                        }else{
                            out.push(sep);
                        }
                        if(typeof(next) == 'string'){
                            out[out.length-1] += next;
                        }else{
                            out.push(next);        
                        }
                    }else{
                        out.push(next);        
                    }
                }
            }
        }else{
            if(text == word){
                var parsed = self.handleMatch(parser.wordMatch(word));
                out.push(parsed.span);
            }else{
                out.push(text);
            }
        }

        return out;
    },

    parseNodeText : function(nodeText){
        //debug('parsing "'+nodeText+'"');
        var self = this;
        self.lastParsed = nodeText;

        var nodes = [nodeText];
        var new_nodes = [];

        for(var i = 0; i < self.parsers.length; i++){
            for(var j = 0; j < nodes.length; j++){
                if(self.parsers[i].parseNodeText){
                    if(typeof(nodes[j]) == 'string'){
                        new_nodes = new_nodes.concat(self.parsers[i].parseNodeText(nodes[j]))
                    }else{
                        new_nodes.push(nodes[j]);
                    }
                }
            }
            nodes = new_nodes;
            new_nodes = [];
        }
        //debug(nodes);
        
        return nodes;
    },

    getCaretWord : function(){
        var self = this;

        var cursorPos = self.jTa.getSelection().start;
        var text = self.jTa.val();
        return self.getWordAtPos(text,cursorPos);

    },

    getCaretNode : function(){
        var self = this;

        var cursorPos = self.jTa.getSelection().start;
        var x = 0;
        var nodes = self.jMagicDiv.contents().toArray();
        
        for(var i = 0; i < nodes.length; i++){
            var node = nodes[i]; 
            var dx = jQuery(node).text().length;
            if( x <= cursorPos && cursorPos < x + dx){
                return node;
            }
            x += dx;
        }
        return null;
    },

    getWordAtPos : function(text, pos){
        var self = this;

        for(var i = pos ; i >= 1 && self.word_separators.indexOf(text[i-1]) == -1; i--){
        }
        for(var j = pos ; j < text.length && self.word_separators.indexOf(text[j]) == -1; j++){
        }
        return { start : i, end : j, word : text.substring(i,j) };
    },

    parseCaretWord : function(parser){
        var self = this;

        var cursorPos = self.jTa.getSelection().start;
        var x = 0;
        var currentNodes = self.jMagicDiv.contents().toArray();
        var newNodes = [];
        var d = self.jTa.val().length == cursorPos? 1:0;
        
        while(currentNodes.length > 0){
            var node = currentNodes.shift();
            var nodeText = jQuery(node).text();
            var dx = nodeText.length;

            if( x <= cursorPos && cursorPos < x + dx +d && node.tagName != 'SPAN'){
                var nodeCursorPos = cursorPos - x;
                var wordData = self.getWordAtPos(nodeText, nodeCursorPos);
                var parsed = parser.parseCaretWord(wordData.word);
                newNodes.push(document.createTextNode(nodeText.substring(0,wordData.start)));
                if(typeof parsed == 'string'){
                   if(parsed == wordData.word){
                        return false; // nothing happened
                   }else{
                        newNodes.push(document.createTextNode(parsed));
                   }
                }else{
                    self.handleMatch(parsed);
                    newNodes.push(parsed.span);
                }
                newNodes.push(document.createTextNode(nodeText.substring(wordData.end)));
                var caret = jQuery(newNodes).text().length;
                newNodes = newNodes.concat(currentNodes);
                return {caret : caret, content : newNodes}
            }
            x += dx;
            newNodes.push(node);
        }
        //debug("x: "+x+", caretPos: "+cursorPos);
            
        return false;
        
    },
    
    caretTransform : function(parser){
        var self = this;

        self.jTa.focus();
        var result = self.parseCaretWord(parser);
        if(result){
            self.jMagicDiv.empty();
            self.jMagicDiv.append(result.content);
            self.refreshTags();
            self.updateMagicTextAreaDiv();
            self.magicTextAreaKeyup();
            setCaretToPos(self.jTa[0],result.caret);
            return true;
        }
        return false;
    },

    handleMatch : function(parsed){
        if(parsed.span){
            if(parsed.tag){
                jQuery(parsed.tag).addClass('magicTag');
                parsed.span.tag = parsed.tag;
                jQuery(parsed.tag).html(jQuery(parsed.span).html());
            }
        }
        return parsed;
    },

    refreshTags : function(){
        var self = this;

        self.jMagicDiv.find('span').each(function(i,span){
            if(span.tag && span.tag.parentNode != document.body ){
                jQuery(document.body).append(span.tag);
                if(jQuery.browser.mozilla){
                    pixelIncrement(jQuery(span.tag),'padding-top',1);
                }
                if(jQuery.browser.webkit){
                    pixelIncrement(jQuery(span.tag),'padding-left',1);
                    pixelIncrement(jQuery(span.tag),'width',-1);
                }
            }
            placeOnTop(jQuery(span),jQuery(span.tag));
        });
        self.jTa.val(self.jMagicDiv.text());
    },

    addParser : function(parser){
        var self = this;

        parser.magicEngine = self;
        self.parsers.push(parser);
        self.updateMagicTextAreaDiv();
    },

    addInlineSuggest : function(options){
        var self = this;

        self.suggestionTriggers[options.trigger] = function(e){
                //38: up -- 40: down
                var keyCode = e.keyCode; 
                if(keyCode == 38 || keyCode == 40 || keyCode == 13){
                    switch(keyCode){
                        case 38 :
                            self.suggestionList.prev();
                            break;
                        case 40 :
                            self.suggestionList.next();
                            break;
                        case 13 :
                            jQuery(self.suggestionList.highlighted).click();
                            break;

                    }
                    e.stopPropagation();
                    return false;
                }
        }

        if(typeof(self.suggestionList) == 'undefined'){
            var jSuggest = jQuery("<ul>");
            jSuggest.css('display','none');
            jSuggest.addClass('magicTextareaSuggestionList');
            self.suggestionList= new DropDownList(jSuggest);
            self.jTa.after(jSuggest);
            jSuggest.width(self.jTa.width());
        }
        
        self.addListener({
            caretWordChange : function(w){ 
                self.jTa.unbind('keydown',self.suggestionTriggers[options.trigger]);
                if( w.word[0] == options.trigger ){
                    options.refreshList(w.word, self.suggestionList);
                    self.suggestionList.show();
                    self.jTa.bind('keydown',self.suggestionTriggers[options.trigger]);
                }else{
                    self.suggestionList.hide();
                }

            }
        });

        self.suggestionList.addListener({
            'optionSelected' : function(value){
                self.caretTransform({
                    parseCaretWord : function(w){
                        return options.parseCaretWord(w,value);
                    }
                });
            }
        });
    },

    fitToContent : function(){
        var self = this;

        self.jTa.fitToContent();
        self.jMagicDiv.height(self.jTa.height());
    },
    adjustMagicDiv : function(){
        var self = this;
        placeOnTop(self.jTa,self.jWrap);
    },

    value : function(){
        var self = this;

        var contents = self.jMagicDiv.contents();
        var out = '';
        for(var i = 0; i < contents.length; i++){
            var node = contents[i];
            var jNode = jQuery(node);
            if(node.tagName == 'SPAN'){
                var spanValue = jNode.attr('uri');
                if(typeof spanValue != 'undefined'){
                    out += spanValue;
                }else{
                    out += jNode.text();
                }
            }else{
                out += jNode.text();
            }
        }
        return out;
   }

});
