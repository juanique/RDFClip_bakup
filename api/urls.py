from django.conf.urls.defaults import *
import settings
import views 
from piston.resource import Resource
from api.handlers import RDFTripleHandler

class CsrfExemptResource(Resource):
    def __init__(self, handler, authentication = None):
        super( CsrfExemptResource, self).__init__(handler, authentication)
        self.csrf_exempt = getattr(self.handler, 'csrf_exempt', True)

rdftriple_resource = CsrfExemptResource(RDFTripleHandler)

urlpatterns = patterns('',
    (r'insert/',rdftriple_resource),
)
