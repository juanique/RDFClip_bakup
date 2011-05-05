from django.shortcuts import render_to_response, get_object_or_404
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.template import RequestContext
from rdfclip.scrapper.utils import open_url

from models import RecentQuery

import urllib
import json


#@login_required
def home(request):
    template_vars = RequestContext(request,{
        'sparql_endpoint' : 'http://rafiki:8890/sparql',
    })
    return render_to_response('rdfadmin/query.html', template_vars)

def explore(request):
    template_vars = RequestContext(request,{
        'sparql_endpoint' : 'http://rafiki:8890/sparql',
    })
    return render_to_response('rdfadmin/explore.html', template_vars)


def proxy(request):
    query = request.GET['query']
    endpoint = request.GET['service_uri']
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

    url = 'http://localhost/apps/visualization/sparqlproxy.php?query=%s&service_uri=%s&output=%s' % (urllib.quote(query), urllib.quote(endpoint), urllib.quote(output))
    return HttpResponse(open_url(url))

