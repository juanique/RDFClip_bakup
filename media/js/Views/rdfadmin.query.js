jQuery.jqplot.enablePlugins = true;
var data, req = false;
var rdfInteger = "http://www.w3.org/2001/XMLSchema#integer";
var plotable = false;
var chart;
var magic;
var plot;

var recentQueriesList, graphsList, savedQueriesList;

function showTable(){
    jQuery("#table_div").show();
    jQuery("#chart_div").hide();
}

function showChart(){
    jQuery("#table_div").hide();
    jQuery("#chart_div").show();
    plot.replot();
}

function getProxy(){
    return new RDF.SparqlProxy(proxy_url, jQuery('#sparql_endpoint').val());
}

function responseIsPlotable(response){
    var vars = response.head.vars;
    var results = response.results.bindings;
    var plotable =  vars.length == 2 && results.length > 0 && typeof(results[0][vars[1]]) != 'undefined' && results[0][vars[1]].type == 'typed-literal' && results[0][vars[1]].datatype == rdfInteger;
    return plotable;
}

function executeQuery() {
    jQuery("#imgDiv").show();
    jQuery('#table_div').hide();
    jQuery('#messages').hide();

    var proxy = getProxy();
    var query = magic.value();

    if(req)
        req.abort();

    req = proxy.query({
                format : "json",
                query : query,
                context : "userInput",
                callback : function(response){
                    var jDiv = jQuery('#table_div').empty();
                    var jTable = jQuery('#tableTemplate').tmpl().appendTo(jDiv);
                    var jTbody = jTable.find('tbody');
                    var jHeadRow = jTable.find('thead tr');
                    var plotable = responseIsPlotable(response);
                    var chartData = [];
                    var row;

                    //Build header
                    var headers = RDF.getResultHeaders(response);
                    for(var i in headers)
                        jHeadRow.append(jQuery("<th>"+headers[i]+"</th>"));

                    //Add data
                    var resultSet = RDF.getResultSet(response);
                    while(row = resultSet.fetchRow()){
                        var tr = jQuery('<tr>').appendTo(jTbody);
                        for(f in row){
                            var td = jQuery('<td>').appendTo(tr);
                            var value = row[f];
                            if(value.isUri()){
                                var a = jQuery("<a>"+value+"</a>").appendTo(td);
                                a.attr('href',explore_url+"?uri="+escape(value)+"&endpoint="+jQuery('#sparql_endpoint').val()+"&graph=&label=http%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23label");
                            }else{
                                td.html(str(value));
                            }
                        }
                        if(plotable){
                            chartData.push([row[headers[0]].toString(), parseFloat(row[headers[1]].toString())]);
                        }
                    }

                    jTable.dataTable();
                    if(plotable){
                        jQuery('chart_div').empty();
                        plot = jQuery.jqplot('chart_div',[chartData],{ 
                            title : 'Pie Chart',
                            width: 700,
                            height: 500,
                            seriesDefaults : {
                                renderer : jQuery.jqplot.PieRenderer,
                            }, 
                            legend : {show :true}
                        });
                    }

                    loadRecentQueries();
                    jQuery('#imgDiv').hide();
                    showTable();
                },
                error : function(e){
                    jQuery('#messages').html(e.statusText+" : <b>"+e.responseText+"</b>").show();
                    jQuery('#imgDiv').hide();
                }
    });
}

function loadQuery(q){
    if(typeof(q) == 'string')
        return loadQuery( { query : q });
    if(typeof(q.proxy) != "undefined")
        jQuery('#sparql_proxy').val(q.proxy);
    if(typeof(q.endpoint) != "undefined" && q.endpoint != "")
        jQuery('#sparql_endpoint').val(q.endpoint);
    if(typeof(q.query) != "undefined")
        jQuery('#query').val(q.query).trigger('change');
}

jQuery(document).ready(function(){
    jQuery("button").attr("disabled",true);

    // Magic Textarea setup
    magic = new MagicTextArea(jQuery('textarea'));
    pixelIncrement(magic.jMagicDiv,'padding-left',0.5);
    magic.addParser(new SparqlParser());
    magic.addInlineSuggest({
        trigger : '@',
        refreshList : function(word, list){
            getProxy().query({
                format : 'json',
                query  : 'SELECT ?resource, ?label WHERE {?resource <http://www.w3.org/2000/01/rdf-schema#label> ?label FILTER regex(?label, "^'+word.substring(1)+'","i") } GROUP BY ?resource LIMIT 10',
                callback : function(r){
                    if(r.results.bindings){
                        var resultSet = RDF.getResultSet(r);
                        var opts = [];
                        var row;

                        while(row = resultSet.fetchRow()){
                            opts.push({
                                name : str(row.label),
                                value : {label: str(row.label), uri : str(row.resource) }
                            });
                        }
                        list.setOptions(opts);
                    }
                }
            });
        },
        parseCaretWord : function(word,value){
            var span = jQuery('<span>&lt;'+value.label+'&gt;</span>');
            var div = jQuery('<div title="'+value.uri+'">');
            span.css('border-bottom','1px dotted blue');
            span.attr('uri','<'+value.uri+'>');
            return {span : span[0], tag : div[0]};

        },
    });            


    // Recent Queries List
    recentQueriesList = new DropDownList(jQuery("#recentQueriesList"),jQuery("#recentQueriesTemplate"));
    recentQueriesList.addListener({
        optionSelected : function(value){
            loadQuery(value);
        },
        optionAdded : function(jLi){
            jLi.cluetip({
                splitTitle : '|',
                positionBy: 'fixed',
                topOffset : 5,
                dropShadow : false,
                leftOffset : 180,
                cursor: 'pointer',
                onShow : function(e){ 
                    jQuery('#cluetip textarea').fitToContent();
                }
            });
        },
        optionsChanged : function(){
            var option = jQuery(recentQueriesList.jUl.find('li')[0]);
            var jElem = option;
            color = jElem.css('backgroundColor');
            while(color == 'transparent'){
                jElem = jElem.parent()
                color = jElem.css('backgroundColor');
            }
            option.animate(
                {'backgroundColor' : '#FFCCCC' }, 500
            ).animate(
                {'backgroundColor' : color }, 500
            );
        }
    });

    // Graphs List
    graphsList = new DropDownList(jQuery("#graphsList"),jQuery("#graphsTemplate"));
    graphsList.addListener({
        optionSelected : function(value){
            loadQuery('SELECT ?s, ?p, ?o FROM <'+value.graphName+'> WHERE {?s ?p ?o} LIMIT 100');
        }
    });

    // Saved queries list
    savedQueriesList = new DropDownList(jQuery("#savedQueriesList"),jQuery("#savedQueriesTemplate"));
    savedQueriesList.addListener({
        optionSelected : function(query){
            loadQuery(query);
        },
        optionAdded : function(jLi){
            var data = jLi.data('value');
            jLi.attr('title',data['name']+'|<textarea spellcheck="false">'+data['query']+'</textarea>');
            jLi.cluetip({
                splitTitle : '|',
                positionBy: 'fixed',
                dropShadow : false,
                topOffset : 5,
                leftOffset : 180,
                width: 300,
                cursor: 'pointer',
                onShow : function(e){ 
                    jQuery('#cluetip textarea').fitToContent();
                }
            });
        }
    });

    // init lists
    loadRecentQueries();
    loadGraphs();
    loadSavedQueries();

    
    jQuery("button").attr("disabled",false);
    jQuery('#chart_div').hide();
});

function loadRecentQueries(){
    jQuery.ajax({
        url : '/rdfadmin/RecentQuery/',
        dataType : 'json',
        success : function(r){
            for(var i in r){
                var ellipsis = r[i].query.length > 40?  '...':'';
                r[i].querySnip = r[i].query.substring(0,40)+ellipsis;
                r[i].title = 'Click to load query|<textarea spellcheck="false">'+r[i]['query']+'</textarea>';
            }
            recentQueriesList.setOptions(r);
        }
    });
}

function loadGraphs(){
    jQuery('#graphs_list').html('Loading...');
    getProxy().query({
        format : 'json',
        query  : 'SELECT ?g WHERE { GRAPH ?g { ?s ?p ?o } } GROUP BY ?g',
        callback : function(r){
            var graphs = [];
            if(r){
                var results = r.results.bindings;
                for(var i in results){
                    if(results[i].g)
                        graphs.push({graphName : results[i].g.value});
                }
            }
            graphsList.setOptions(graphs);
            magic.adjustMagicDiv();
        }
    });

}

function loadSavedQueries(){
    jQuery.ajax({
        url : '/rdfadmin/SavedQuery/',
        dataType : 'json',
        success : function(r){
            savedQueriesList.setOptions(r);
        }
    });
}
