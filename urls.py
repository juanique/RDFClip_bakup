from django.conf.urls.defaults import *
import settings
from base import views 
from rdfadmin.views import home, explore

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    (r'^$', home),
    (r'^rdfadmin/', include('rdfadmin.urls')),
    (r'^resource/(?P<file_hash>[0-9A-Za-z]+)', explore),
    (r'^api/', include('api.urls')),
    # Example:

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
