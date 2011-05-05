default_endpoint = 'http://192.168.1.131:8890/sparql';

saved_queries = [
    {
        'title'     : 'Missing Labels',
        'query'     : 'SELECT DISTINCT ?uri FROM <http://vota-inteligente.cl/graph>\n WHERE{\n  {\n   ?s ?p ?uri\n   OPTIONAL { ?y <http://www.w3.org/2000/01/rdf-schema#label> ?l . FILTER (?uri = ?y) . }\n   FILTER ( !BOUND(?y) AND !isLiteral(?uri) )\n  } UNION {\n   ?uri ?p ?o\n   OPTIONAL { ?y <http://www.w3.org/2000/01/rdf-schema#label> ?l . FILTER (?uri = ?y) . }\n   FILTER ( !BOUND(?y) )\n  } UNION {\n   ?s ?uri ?o\n   OPTIONAL { ?y <http://www.w3.org/2000/01/rdf-schema#label> ?l . FILTER (?uri = ?y) . }\n   FILTER ( !BOUND(?y) )\n  }\n} LIMIT 10',
        'endpoint'  : default_endpoint
    },
    {
        'title'     : 'Missing Class',
        'query'     : 'SELECT DISTINCT ?uri FROM <http://vota-inteligente.cl/graph>\n WHERE{\n  {\n   ?s ?p ?uri\n   OPTIONAL { ?y <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?l . FILTER (?uri = ?y) . }\n   FILTER ( !BOUND(?y) AND !isLiteral(?uri) )\n  } UNION {\n   ?uri ?p ?o\n   OPTIONAL { ?y <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?l . FILTER (?uri = ?y) . }\n   FILTER ( !BOUND(?y) )\n  } UNION {\n   ?s ?uri ?o\n   OPTIONAL { ?y <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?l . FILTER (?uri = ?y) . }\n   FILTER ( !BOUND(?y) )\n  }\n} LIMIT 10',
        'endpoint'  : default_endpoint
    },
    {
        'title'     : 'Inconsistent Class',
        'query'     : 'SELECT DISTINCT ?type FROM <http://vota-inteligente.cl/graph>\nWHERE{\n  ?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type\n  OPTIONAL { ?y <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?l . FILTER (?type = ?y) . }\n FILTER ( !BOUND(?y) )\n} LIMIT 10',
        'endpoint'  : default_endpoint
    },
    {
        'title'     : 'Repeated Labels',
        'query'     : 'SELECT DISTINCT ?s1, ?s2, ?l1 FROM <http://vota-inteligente.cl/graph>\nWHERE{\n ?s1 <http://www.w3.org/2000/01/rdf-schema#label> ?l1 .\n  ?s2 <http://www.w3.org/2000/01/rdf-schema#label> ?l2 .\n  FILTER(?l1 = ?l2 AND ?s1 != ?s2)\n}',
        'endpoint'  : default_endpoint
    },
    {
        'title'     : 'All Class',
        'query'     : 'SELECT DISTINCT ?type, ?label FROM <http://vota-inteligente.cl/graph>\nWHERE{\n ?type <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class>\nOPTIONAL { ?type <http://www.w3.org/2000/01/rdf-schema#label> ?label}\n }',
        'endpoint'  : default_endpoint
    },
    {
        'title'     : 'All Properties',
        'query'     : 'SELECT DISTINCT ?label ?prop FROM <http://vota-inteligente.cl/graph>\nWHERE{\n ?prop <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .\n ?prop <http://www.w3.org/2000/01/rdf-schema#label> ?label\n}',
        'endpoint'  : default_endpoint
    },

    {
        'title'     : 'Proyectos/Partido',
        'endpoint'  : 'http://192.168.1.131:8890/sparql',
        'query'     : 'SELECT ?Partido, COUNT(DISTINCT ?Proyecto) FROM <http://vota-inteligente.cl/graph>\nWHERE {\n ?Proyecto <http://vota-inteligente.cl/props/Legislativo/ProyectoDeLey/autor> ?Autor .\n ?Autor <http://vota-inteligente.cl/props/Persona/militaEn> ?P.\n ?P <http://www.w3.org/2000/01/rdf-schema#label> ?Partido\n} GROUP BY ?Partido',
        'endpoint'  : default_endpoint
    },

    {
        'title'     : "Surnames",
        'endpoint'  : "http://dbpedia.org/sparql",
        'query'     : "SELECT ?n, COUNT(DISTINCT ?p) from <http://dbpedia.org> WHERE {\n?p <http://xmlns.com/foaf/0.1/surname> ?n \n}\nGROUP BY ?n HAVING COUNT(DISTINCT ?p) > 5"
    },

    {
        'title'     : 'Left Drivers',
        'endpoint'  : 'http://dbpedia.org/sparql',
        'query'  : 'SELECT ?DrivesOn, COUNT(distinct ?p) as ?Number from <http://dbpedia.org> WHERE {\n?p <http://dbpedia.org/property/drivesOn> ?DrivesOn ;\n<http://www.w3.org/2000/01/rdf-schema#label> ?nombre\n} GROUP BY ?DrivesOn'
    },

    {
        'title'     : 'Left Drivers 2',
        'endpoint'  : 'http://dbpedia.org/sparql',
        'query'  : 'SELECT ?DrivesOn, COUNT(distinct ?p) as ?Number from <http://dbpedia.org> WHERE {\n?p <http://dbpedia.org/property/drivesOn> ?DrivesOn ;\n<http://www.w3.org/2000/01/rdf-schema#label> ?nombre\n} GROUP BY ?DrivesOn HAVING COUNT(distinct ?p) > 5'
    },

    {
        'title'     : 'Chile Data',
        'endpoint'  : 'http://dbpedia.org/sparql',
        'query'  : 'SELECT DISTINCT ?Property, ?Value FROM <http://dbpedia.org> WHERE {<http://dbpedia.org/resource/Chile> ?Predicate ?V .\n ?Predicate <http://www.w3.org/2000/01/rdf-schema#label> ?Property . \n?V <http://www.w3.org/2000/01/rdf-schema#label> ?Value .}'
    },

    {
        'title'     : 'Proyectos Ley',
        'endpoint'  : 'http://192.168.1.131:8890/sparql',
        'query'  : 'SELECT ?o, COUNT(*) FROM <http://vota-inteligente.cl/graph> WHERE { ?s <http://vota-inteligente.cl/props/Legislativo/materiaProyecto> ?o} GROUP BY ?o'
    }
];

for i in saved_queries:
    print i['title']
    print i['query']

