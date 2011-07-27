var default_endpoint = "http://192.168.1.131:8890/sparql";

var saved_queries = { 'queries' : [
    {
        'title'     : 'Missing Labels',
        'description' : "Lorem ipsum...",
        'query'     : 'SELECT DISTINCT ?uri FROM <http://vota-inteligente.cl/graph>\n WHERE{\n  {\n   ?s ?p ?uri\n   OPTIONAL { ?y <http://vota-inteligente.cl/props/label> ?l . FILTER (?uri = ?y) . }\n   FILTER ( !BOUND(?y) AND !isLiteral(?uri) )\n  } UNION {\n   ?uri ?p ?o\n   OPTIONAL { ?y <http://vota-inteligente.cl/props/label> ?l . FILTER (?uri = ?y) . }\n   FILTER ( !BOUND(?y) )\n  } UNION {\n   ?s ?uri ?o\n   OPTIONAL { ?y <http://vota-inteligente.cl/props/label> ?l . FILTER (?uri = ?y) . }\n   FILTER ( !BOUND(?y) )\n  }\n} LIMIT 10',
        'endpoint'  : default_endpoint
   },
   {
        'title' : "Pepinos",
        "description" : "Cultivo de pepinos en La Reina.",
        "query" : "SELECT DISTINCT * FROM <http://vota-inteligente.cl/graph> WHERE {?s ?p ?o} LIMIT 10",
        'endpoint'  : default_endpoint
    }

]};
