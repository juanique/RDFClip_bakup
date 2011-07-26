//This library uses jQuery for ajax functionality.
var __identity = function(x){return x};
var $_RDFS, $_XMLS, $_CLIPS, $_NFO;

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

    Triple : function(s,p,o,type){
        if(type.baseType == 'Literal'){
            o = type.parse(str(o));
        }else{
            o = str(o);
        }

        return {s: str(s), p: str(p), o:o, object_type: type.baseType};
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
            self.dataType = RDF.dataType(field.type,field.datatype);
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
        },
        each : function(iterator){
            var row;
            while(row = this.fetchRow()){
                iterator(row);
            }
        }

    }),

    hashUri : function(uri){
        return escape(uri);
    },


    _dataTypes : {
    },
    _properties : {
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
        if(dataType == 'literal'){
            dataType = $_RDFS("Literal").uri
        }
        var hashed = RDF.hashUri(dataType);

        if(RDF._dataTypes[hashed]){
            return RDF._dataTypes[hashed];
        }
        return RDF._dataTypes.RDFUri;
    },
    property : function(name){
        var hashed = RDF.hashUri(name);
        if(typeof RDF._properties[hashed] == 'undefined'){
            return RDF._properties[hashed] = new RDF.Property();
        }
        return RDF._properties[hashed];
    },

    addResource : function(type,res,base,props){
        props.uri = res.uri;
        this[type][res.hash] = new (base.extend(props))();
    },

    addType : function(res,base,props){
        this.addResource("_dataTypes",res,base,props);
    },
    addProperty : function(res,props){
        this.addResource("_properties",res,RDF.Property,props);
    },
    state : function(s,p,o){
        if(str(p) ==  $_RDFS('range').uri){
            this.property(str(s)).type = this.dataType(str(o));
        }
    }

}

$_RDFS = RDF.Namespace('http://www.w3.org/2000/01/rdf-schema#');
$_XMLS = RDF.Namespace('http://www.w3.org/2001/XMLSchema#');
$_CLIPS = RDF.Namespace('http://www.rdfclip.com/schema#');
$_NFO = RDF.Namespace('http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#');

RDF.Uri = Class.extend({
    uri : 'RDFUri:generic_uri',
    sparqlFormat : str,
    baseType : "URI",
    parse : __identity,
    userFormat : __identity,
    sparqlFormat : function(x){return '<'+x+'>';},
    validate : function(x){ return true; },
    selector : function(){
        var input = jQuery("<input emptyValue='Click to add' class='newPropertyInput'>");
        input.data('propertyType',RDF.dataType(this.uri));
        input.keyup(function(e) { if(e.keyCode == 13){input.blur();} });
        input.emptyValue();
        return input;
    }
});

RDF.Literal = RDF.Uri.extend({
    baseType : "Literal"
});

RDF._dataTypes.RDFUri = new (RDF.Uri.extend({
    sparqlFormat : function(val){
        return "<"+val+">";
    }
}))();

RDF.Property = Class.extend({
    uri : 'RDFUri:property',
    type : RDF._dataTypes.RDFUri,
    parse : function(x){
        return this.type.parse(x);
    },
    userFormat : function(x){
        return this.type.userFormat(x);
    },
    validate : function(x){
        return this.type.validate(x);
    },
    selector : function(){
        return this.type.selector();
    }
});

RDF._properties.DefaultProperty = new (RDF.Property.extend({
}))();

/***
* Base Types
*/
RDF.addType($_RDFS("Literal"), RDF.Literal,{
    parse : __identity,
    sparqlFormat : function(x){ return '"'+x+'"' }
});

RDF.addType($_XMLS("integer"), RDF.Literal,{
    parse : parseInt,
    sparqlFormat : str
});

RDF.addType($_XMLS("float"), RDF.Literal,{
    parse : parseFloat,
    sparqlFormat : str
});

RDF.addType($_XMLS("string"), RDF.Literal,{
    parse : str,
    sparqlFormat : function(x){return '"'+x+'"';}
});

/***
* Custom Types
*/
RDF.addType($_CLIPS("Movie"), RDF.Uri,{
    selector : function(){
        var input = jQuery("<input emptyValue='Click and paste an IMDB.com link' class='newPropertyInput'>");
        input.data('propertyType',RDF.dataType(this.uri));
        input.keyup(function(e) { if(e.keyCode == 13){input.blur();} });
        input.emptyValue();
        return input;
    },
});

/***
* Custom Properties
*/
RDF.addProperty($_NFO("horizontalResolution"),{
    userFormat : function(x){
        return x+" pixels";
    }
});
RDF.addProperty($_NFO("verticalResolution"),{
    userFormat : function(x){
        return x+" pixels";
    }
});
