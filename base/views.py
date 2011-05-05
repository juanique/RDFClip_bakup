from django.http import HttpResponse
from django.shortcuts import render_to_response

def login(request):
    template_vars = {}
    return render_to_response('login.html', template_vars)

