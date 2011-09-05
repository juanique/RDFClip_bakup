# Create your views here.
from django.views.decorators.csrf import csrf_exempt
from base.decorators import json_view
from django.template import Template
import triplestore
from base.connection import get_sparql_proxy

@csrf_exempt
@json_view
def batch(request,data):
    triplestore.insert(data.get('insert',[]))
    triplestore.delete(data.get('delete',[]))
    
@csrf_exempt
@json_view
def query(request,data):
    pred= data['pred']
    obj= data['obj']
    proxy = get_sparql_proxy()

    pred_resource = RDFResource.objects.filter(label=pred)
    pred = pred_resource[0].uri

    sparql_template = TEMPLATE("""
             SELECT ?sub, ?label, ?size
             FROM <{{graph}}> 
             WHERE {
                ?sub <{{pred}}> <{{obj}}> .
                ?sub <{{nie:byteSize}}> ?size .
                OPTIONAL { ?sub <{{rdfs:label}}> ?label . }
            }
            """)

    context = {
            'graph' : settings.DATA_GRAPH,
            'pred'  : pred,
            'nie:byteSize' : NIE['bytesize'],
            'rdfs:label' : RDFS['label'],
            }


    return proxy.query(sparql_template.render(context),output='json')
