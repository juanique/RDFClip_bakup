from django.shortcuts import render_to_response, get_object_or_404
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.template import RequestContext
from scrapper.utils import open_url
from base.connection import get_sparql_proxy

from models import RecentQuery

import urllib
import json
import settings


#@login_required
def home(request):
    template_vars = RequestContext(request,{
        'sparql_endpoint' : settings.SPARQL_ENDPOINT_URL,
    })
    return render_to_response('rdfadmin/query.html', template_vars)

def explore(request,file_hash):
    template_vars = RequestContext(request,{
        'sparql_endpoint' : settings.SPARQL_ENDPOINT_URL,
    })
    return render_to_response('rdfadmin/explore.html', template_vars)


def proxy(request):
    query = request.GET['query']
    endpoint = request.GET.get('service_uri', settings.VIRTUOSO_ENDPOINT)
    if endpoint[4:] !=  "http":
        endpoint = "http://%s" % endpoint

    output = request.GET['output']

    context = request.GET.get('context','')
    user = None
    if hasattr(request, 'user'):
        user = request.user
        if not user.is_authenticated():
            user = None

    base = RecentQuery.objects
    lastQueries = base.filter(context='userInput').order_by('-creation')[:10]

    for q in lastQueries:
        if(q.query == query):
            q.delete()


    query_obj = RecentQuery(query = query, endpoint = endpoint, user = user, context = context)
    query_obj.save()

    proxy_obj = get_sparql_proxy();
    return HttpResponse(proxy_obj.query(query, endpoint, output))
