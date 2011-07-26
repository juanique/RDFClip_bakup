# Create your views here.
from django.views.decorators.csrf import csrf_exempt
from base.decorators import json_view
import triplestore

@csrf_exempt
@json_view
def batch(request,data):
    triplestore.insert(data.get('insert',[]))
    triplestore.delete(data.get('delete',[]))
    
