jQuery.ajaxSetup({contentType: 'application/json'});
var newPropertySelector;
var triplesRemoved = [];

function getNewPropertyRow(templateData, uri,range){
    var jNewRow = jQuery("#newPropertyTemplate").tmpl(templateData);
    var jInput = RDF.dataType(range).selector();
    jInput.data('propertyUri',uri);
    jNewRow.find('td').empty().append(jInput);
    return jNewRow;
}

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
            var rendered = getNewPropertyRow(value,value.propertyUri,value.propertyType);
            rendered.appendTo(jQuery('#explorerTable tbody'));
            rendered.find("input").focus();
            newPropertySelector.hide();
        }
    });
}

function getCurrentUri(){
    return jQuery("#inputUri").val();
}

function getNewTriples(){
    var obj = {'insert':[],'delete' : triplesRemoved};

    jQuery(".newPropertyRow").each(function(i,row){
        jInput = jQuery(row).find('input');
        var type = jInput.data('propertyType');
        obj.insert.push(RDF.Triple(getCurrentUri(),jInput.data('propertyUri'), jInput.val(),type))

    });

    console.debug(obj);

    //jQuery.post('/api/insert/',JSON.stringify(obj), function(r){ window.location.reload() }, "json");
}

function newPropertySelected(e){
    var res = getCurrentUri();

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
                    value : {propertyName : formatResource(row,'prop','label') , propertyUri: str(row.prop), propertyType: str(row.range)}
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
    var sparql, graph, from;

    jQuery("#searchResultsTable").hide();
    jQuery("#imgDiv").show();
    hideFeedback();

    graph = jQuery("#inputGraph").val();
    from = (graph == "")? "": "FROM <"+graph+">";

    sparql  = 'prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> ';
    sparql += "SELECT DISTINCT ?p ?pl ?o ?ol ?range "+from+" WHERE {";
    sparql += " <"+uri+"> ?p ?o . ";
    sparql += " ?p rdfs:range ?range . ";
    sparql += " OPTIONAL { ?p <"+labelPredicate+"> ?pl }";
    sparql += " OPTIONAL { ?o <"+labelPredicate+"> ?ol}}";
    sparql += " ORDER BY ?p";

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

                resultSet.each(function(row){
                    RDF.state(row.p, $_RDFS('range'), row.range);
                    var templateData = {};
                    templateData.propertyName = formatResource(row,'p','pl');
                    templateData.propertyValue = formatResource(row,'o','ol','p');
                    var jRow = jQuery('#propertiesTemplate').tmpl(templateData);
                    jRow.find("td").dblclick(function(){
                        triplesRemoved.push(RDF.Triple(getCurrentUri(), row.p, row.o, RDF.dataType(row.range)));

                        var jNewRow = getNewPropertyRow(templateData,row.p,row.range);
                        jRow.replaceWith(jNewRow);
                        jNewRow.find('input').val(row.o).focus();
                    });
                    jRow.appendTo(jTbody);

                });
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

function formatResource(row, res, resLabel, prop){
    var userLabel = row[res].value;
    if(prop != undefined){
        prop = RDF.property(row[prop].value);
        userLabel = prop.userFormat(userLabel);
    }
    var params = getParams(row[res].value);
    var tag = row[res].isUri()? "A title='"+row[res]+"' href='"+base_url+"?"+params+"'":"SPAN";

    var label = (typeof(row[resLabel]) == "undefined")? userLabel:str(row[resLabel]);
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
