import settings

from piston.handler import BaseHandler
from models import RDFTriple
from datetime import datetime
from base.connection import get_triple_store
from base.inference import new_triple
from rdflib import URIRef

store = get_triple_store()

class RDFTripleHandler(BaseHandler):
    allowed_methods = ('POST')
    model = RDFTriple

    def create(self, request, *args, **kwargs):
        print request.content_type
        if request.content_type:
            data = request.data
            data['timestamp'] = datetime.now()

            triple = RDFTriple(**data)
            triple.save()

            s = URIRef(data['s'])
            p = URIRef(data['p'])
            if data['object_type'] == 'URI':
                o = URIRef(data['o'])
            else:
                o = Literal(data['o'])

            store.insert(settings.DATA_GRAPH, new_triple(s,p,o))
