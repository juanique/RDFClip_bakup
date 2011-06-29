var newPropertySelector;

function initNewPropertySelector(){
    newPropertySelector = new DropDownList();
    newPropertySelector.jUl.addClass('propertySelectList');
    jQuery(document.body).append(newPropertySelector.jUl);
    jQuery(document).click(function(){
        newPropertySelector.hide();
    });
    newPropertySelector.jUl.hide();
    newPropertySelector.addListener({
        optionSelected : function(value){
            console.debug(value);
            var rendered = jQuery('#newPropertyTemplate').tmpl(value);
            rendered.appendTo(jQuery('#explorerTable tbody'));

            var type= RDF.dataType(value.propertyType);
            console.debug(type);
            var input = RDF.dataType(value.propertyType).selector();
            input.data('propertyUri',value.propertyUri);
            rendered.find('td').empty().append(input);
            
            input.focus();
            newPropertySelector.hide();
        }
    });
}

function getNewTriples(){
    var sparql = 'INSERT INTO <'+insert_graph+'> {\n';
    jQuery('.newPropertyRow input').each(function(i,input){
        var jInput = jQuery(input);
        var type = jInput.data('propertyType');
        if(!jInput.hasClass('empty')){
            sparql += '<'+jQuery("#inputUri").val()+'> <'+jInput.data('propertyUri')+'> '+type.sparqlFormat(jInput.val())+' .\n';
        }

    });
    sparql += "}";
    console.debug(sparql);

    /*
    getProxy().query({
        query : sparql,
        callback : function(r){
            loadUri(jQuery('#inputUri').val());
        }
    });
    */
    return sparql;
}

function newPropertySelected(e){
    var res = jQuery('#inputUri').val();

    var sparql = '';
    sparql += 'define input:inference "http://www.rdfclip.com/schema/rules1" ';
    sparql += 'prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> ';
    sparql += 'prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ';
    sparql += 'SELECT DISTINCT ?label, ?prop, ?range WHERE { ';
    sparql += ' ?prop  rdfs:label ?label .';
    sparql += ' ?prop rdfs:domain ?domain .';
    sparql += ' ?prop rdfs:range ?range .';
    sparql += ' <'+res+'> rdf:type ?domain }';


    getProxy().query({
        format : 'json',
        query : sparql,
        callback : function(r){
            var options = [];
            var resultSet = RDF.getResultSet(r);
            while(row = resultSet.fetchRow()){
                options.push( {
                    name  : str(row.label),
                    value : {propertyName : str(row.label), propertyUri: str(row.prop), propertyType: str(row.range)}
                });
            }

            newPropertySelector.setOptions(options);
            newPropertySelector.show();
            newPropertySelector.jUl.offset(jQuery('#newPropertyButton').offset());

        },
        error : function(e){
            //console.debug(e);
        }
    });
}

function search(term){
    jQuery("#explorerTable").hide();
    jQuery("#imgDiv").show();
    hideFeedback();

    var graph = jQuery("#inputGraph").val();
    var from = "";
    if(graph != "")
        from = "FROM <"+graph+">";
    
    var sparql = "SELECT DISTINCT ?match, ?label "+from+" WHERE {?match <"+labelPredicate+"> ?label FILTER regex(?label, '"+term+"') } LIMIT 10";

    getProxy().query({
        format : "json",
        query  : sparql,
        callback : function(r){
            jQuery("#imgDiv").hide();
            if(typeof(r) != 'object' || r == null){
                this.error("");
            }else if(r.results.bindings.length < 1){
                resultsMsg("No results");
            }else{
                var resultSet = RDF.getResultSet(r);
                var jTbody = jQuery('#searchResultsTable tbody').empty();
                jQuery('#searchResultsTable').show();

                while(row = resultSet.fetchRow()){
                    var templateData = {};
                    templateData.propertyName = formatResource(row,'match','label');
                    jQuery('#searchResultsTemplate').tmpl(templateData).appendTo(jTbody);
                }
            }

        },
        error : function(e){
            resultsMsg("An error ocurred, please check your input parameters... ");
            jQuery("#imgDiv").css("display","none");
        }
    });
}

function getProxy(){
    var endpoint = jQuery("#inputEndpoint").val();
    return new RDF.SparqlProxy(proxyUrl, endpoint);
}

function loadUri(uri){
    jQuery("#searchResultsTable").hide();
    jQuery("#imgDiv").show();
    hideFeedback();

    var graph = jQuery("#inputGraph").val();
    var from = (graph == "")? "": "FROM <"+graph+">";
    var sparql = "SELECT DISTINCT ?p ?pl ?o ?ol "+from+" WHERE {<"+uri+"> ?p ?o . OPTIONAL { ?p <"+labelPredicate+"> ?pl } OPTIONAL { ?o <"+labelPredicate+"> ?ol}} ORDER BY ?p";

    //console.log(sparql);

    getProxy().query({
        format : "json",
        query  : sparql,
        callback : function(r){
            jQuery("#imgDiv").hide();
            if(typeof(r) != 'object' || r == null){
                this.error("");
            }else if(r.results.bindings.length < 1){
                resultsMsg("No results");
            }else{
                jQuery("#explorerTable").show();
                var resultSet = RDF.getResultSet(r);
                var jTbody = jQuery('#explorerTable tbody').empty();
                while(row = resultSet.fetchRow()){
                    var templateData = {};
                    templateData.propertyName = formatResource(row,'p','pl');
                    templateData.propertyValue = formatResource(row,'o','ol');
                    jQuery('#propertiesTemplate').tmpl(templateData).appendTo(jTbody);
                }
            }
        },
        error : function(e){
            resultsMsg("An error ocurred, please check your input parameters... "+e);
        }
    });
}

function resultsMsg(msg){
    jQuery("#resultsMsgDiv").html(msg);
    jQuery("#resultsMsgDiv").show();
}

function hideFeedback(){
    jQuery("#resultsMsgDiv").hide();
}


function getParams(uri){
    return jQuery.param({
            uri : uri,
            endpoint : jQuery("#inputEndpoint").val(),
            graph : jQuery("#inputGraph").val(),
            label : jQuery("#inputLabelUri").val()
    });
}

function formatResource(row, res, resLabel){
    var params = getParams(row[res].value);
    var tag = row[res].isUri()? "A title='"+row[res]+"' href='"+base_url+"?"+params+"'":"SPAN";
    var label = (typeof(row[resLabel]) == "undefined")? str(row[res]):str(row[resLabel]);
    return "<"+tag+">"+label+"</"+tag+">";
}

function init(){
    var uri = jQuery.query.get("uri");
    var endpoint = jQuery.query.get("endpoint");
    var graph = jQuery.query.get("graph");
    if(graph === true){
        graph = "";
    }
    var label = jQuery.query.get("label");
    if(uri && endpoint){
        jQuery("#inputUri").val(uri);
        jQuery("#inputEndpoint").val(endpoint);
        jQuery("#inputGraph").val(graph);
        jQuery("#inputLabelUri").val(label);
        loadUri(uri);
    }

    initNewPropertySelector();
    jQuery('#newPropertyButton').click(newPropertySelected);
    jQuery('#saveChangesButton').click(getNewTriples);
}

jQuery(document).ready(init);
