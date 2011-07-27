import os
import sys

os.environ['DJANGO_SETTINGS_MODULE'] = 'settings'

import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()

path = os.path.realpath(os.path.dirname(__file__))
if path not in sys.path:
    sys.path.append(path)
