from rdflib import Graph, Literal
from datetime import datetime
from base.connection import get_triple_store
from base.inference import new_triple
from rdflib import URIRef
import settings
from models import RDFTriple

store = get_triple_store()

def insert(triples):
    if not isinstance(triples,list):
        return insert([triples])

    g = Graph()
    for data in triples:
        data['timestamp'] = datetime.now()
        data['action'] = "INSERT"
        if data['o'] is None:
            data['o'] = ''
        triple = RDFTriple(**data)
        triple.save()

        s = URIRef(data['s'])
        p = URIRef(data['p'])
        if data['object_type'] == 'URI':
            o = URIRef(data['o'])
        else:
            o = Literal(data['o'])


        g = new_triple(s,p,o,g)
    store.insert(settings.DATA_GRAPH, g)

def delete(triples):
    if not isinstance(triples,list):
        return insert([triples])

    triples_to_delete = []
    for data in triples:
        data['timestamp'] = datetime.now()
        data['action'] = "DELETE"
        triple = RDFTriple(**data)
        triple.save()

        o = '<%s>' % data['o'] if data['object_type'] == 'URI' else data['o']
        triples_to_delete.append(['<%s>' % data['s'], '<%s>' % data['p'], o])

    store.delete(settings.DATA_GRAPH, triples_to_delete)
