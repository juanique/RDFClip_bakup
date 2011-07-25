from django.conf.urls.defaults import *
import settings
from rdfclip.base import views 

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    (r'^rdfadmin/', include('rdfclip.rdfadmin.urls')),
    (r'^api/', include('rdfclip.api.urls')),
    # Example:
    # (r'^rdfclip/', include('rdfclip.foo.urls')),

    # Uncomment the admin/doc line below and add 'django.contrib.admindocs' 
    # to INSTALLED_APPS to enable admin documentation:
    # (r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    (r'^admin/', include(admin.site.urls)),
    (r'^login/$', 'django.contrib.auth.views.login', {'template_name' : 'login.html'}),
)


if settings.DEBUG:
    urlpatterns += patterns('',
        (r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT}),
    )
