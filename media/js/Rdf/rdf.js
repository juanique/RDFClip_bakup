//This library uses jQuery for ajax functionality.
var __identity = function(x){return x};

var RDF = {
    Namespace : function(prefix){
        return function(sufix){
            var uri = prefix+sufix;
            return {
                uri : uri,
                hash : escape(uri),
                toString : function(){ return uri; }
            }
        }
    },

    SparqlProxy : Class.extend({
        init : function(url, endpoint){
            this.ws = url;
            this.endpoint = endpoint;
        },

        getQueryURL : function(params){
            if (typeof(params.endpoint) == "undefined")
                params.endpoint = this.endpoint;
            if (typeof(params.format) == "undefined")
                params.format = "json";
            if (typeof(params.context) == "undefined")
                params.context = "";

            return this.ws+"?query="+escape(params.query)+"&service_uri="+escape(params.endpoint)+"&output="+escape(params.format)+"&context="+escape(params.context);
        },

        query : function(params){
            url = this.getQueryURL(params);

            var r =  jQuery.ajax({
                url: url,
                dataType: params.format,
                method : 'get',
                success : function(r){
                    if(params.format == "gvds")
                        eval("r = "+r);
                    params.callback(r);
                },
                error : function(r){
                    if(typeof(params.error) == 'function')
                        params.error(r);
                }
            });

            return r;
        }
    }),

    ResultSetField : Class.extend({
        init : function(field){
            var self = this;

            self.type = field.type;
            self.dataType = RDF.dataType(field.type,field.dataType);
            self.value = self.dataType.parse(field.value);
        },

        toString : function(){
            var self = this;
            return self.value;
        },


        isUri : function(){
            var self = this;
            return self.type == 'uri'
        }

    }),

    ResultSet : Class.extend({

        init : function(bindings){
            var self = this;
            self.bindings = bindings;
            self.currentIndex = 0;
        },

        fetchRow : function(){
            var self = this;
            if(self.currentIndex >= self.bindings.length)
                return false;

            var row = self.bindings[self.currentIndex++];
            var out = {}
            for(var i in row){
                out[i] = new RDF.ResultSetField(row[i]);
            }
            return out;
        }

    }),

    hashUri : function(uri){
        return escape(uri);
    },


    _dataTypes : {
    },

    getResultHeaders : function(response){
        var out = [];
        var vars = response.head.vars;
        return vars;
    },
    getResultSet : function(response){
        return new RDF.ResultSet(response.results.bindings);
    },
    dataType : function(type, dataType){
        dataType = dataType || type;
        var hashed = RDF.hashUri(dataType);

        if(RDF._dataTypes[hashed]){
            return RDF._dataTypes[hashed];
        }
        return RDF._dataTypes.RDFUri;
    }
}

var $_RDFS = RDF.Namespace('http://www.w3.org/2000/01/rdf-schema#');
var $_XMLS = RDF.Namespace('http://www.w3.org/2001/XMLSchema#');
var $_CLIPS = RDF.Namespace('http://www.rdfclip.com/schema#');


RDF._baseType = Class.extend({
    parse : __identity,
    sparqlFormat : str,
    validate : function(x){ return true; },
    selector : function(){
        var input = jQuery("<input emptyValue='Click to add' class='newPropertyInput'>");
        input.data('propertyType',RDF.dataType(this.uri));
        input.keyup(function(e) { if(e.keyCode == 13){input.blur();} });
        input.emptyValue();
        return input;
    }
});

RDF._dataTypes.RDFUri = new (RDF._baseType.extend({
    uri : 'RDFUri:not_a_valid_uri',
    sparqlFormat : function(val){
        return "<"+val+">";
    }
}))();

RDF._dataTypes[$_RDFS("Literal").hash] = new (RDF._baseType.extend({
    uri : $_RDFS("Literal").uri,
    parse : __identity,
    sparqlFormat : function(x){ return '"'+x+'"' }
}))();

RDF._dataTypes[$_XMLS("integer").hash] = new (RDF._baseType.extend({
    uri : $_XMLS("integer").uri,
    parse : parseInt,
    sparqlFormat : str
}))();

RDF._dataTypes[$_XMLS("string").hash] = new (RDF._baseType.extend({
    uri : $_XMLS("string").uri,
    parse : __identity,
    sparqlFormat : function(x){return '"'+x+'"';}
}))();

RDF._dataTypes[$_CLIPS("IMDBLink").hash] = new (RDF._baseType.extend({
    uri : $_CLIPS("IMDBLink").uri,
    parse : __identity,
    sparqlFormat : function(x){return '<'+x+'>';},
    selector : function(){
        var input = jQuery("<input emptyValue='Click and paste an IMDB.com link' class='newPropertyInput'>");
        input.data('propertyType',RDF.dataType(this.uri));
        input.keyup(function(e) { if(e.keyCode == 13){input.blur();} });
        input.emptyValue();
        return input;
    },
}))();
