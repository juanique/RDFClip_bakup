from django.conf.urls.defaults import *
from piston.resource import Resource
from rdfadmin.handlers import SavedQueryHandler, RecentQueryHandler
import views

class CsrfExemptResource(Resource):
    def __init__(self, handler, authentication = None):
        super( CsrfExemptResource, self).__init__(handler, authentication)
        self.csrf_exempt = getattr(self.handler, 'csrf_exempt', True)

saved_query_resource = CsrfExemptResource(SavedQueryHandler)
recent_query_resource = CsrfExemptResource(RecentQueryHandler)

urlpatterns = patterns('',
    #(r'^$', views.home),
    #(r'explore/',views.explore),
    (r'^proxy/', views.proxy),
    url(r'SavedQuery/', saved_query_resource),
    url(r'RecentQuery/', recent_query_resource),
)
