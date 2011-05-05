//This library uses jQuery for ajax functionality.
var __identity = function(x){return x};

var RDF = {
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


    _dataTypes : {
        RDFLiteral : {
            uri : 'http://www.w3.org/2000/01/rdf-schema#Literal',
            parse : __identity,
            sparqlFormat : function(x){ return '"'+x+'"' }
        },

        RDFUri : {
            uri : 'RDFUri:not_a_valid_uri',
            parse : __identity,
            sparqlFormat : function(val){
                return "<"+val+">";
            }
        },

        RDFInteger : {
            uri : "http://www.w3.org/2001/XMLSchema#integer",
            parse : parseInt,
            sparqlFormat : str
        },

        RDFString : {
            uri : "http://www.w3.org/2001/XMLSchema#string",
            parse : __identity,
            sparqlFormat : function(x){return '"'+x+'"';}
        }
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
        if(type == 'literal')
            return RDF._dataTypes.RDFLiteral;
        if(type == 'uri')
            return RDF._dataTypes.RDFUri;

        dataType = type;
        for(var i in RDF._dataTypes){
            if(RDF._dataTypes[i].uri == dataType){
                return RDF._dataTypes[i];
            }
        }
        return RDF._dataTypes.RDFUri;
    }
}

