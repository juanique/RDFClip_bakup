import settings

from piston.handler import BaseHandler
from models import RDFTriple

import triplestore


class RDFTripleHandler(BaseHandler):
    allowed_methods = ('POST')
    model = RDFTriple

    def create(self, request, *args, **kwargs):
        if request.content_type:
            triplestore.insert(data)
