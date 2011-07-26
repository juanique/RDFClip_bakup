from django.http import HttpResponse

import json

def json_view(func):
    def wrap(req, *args, **kwargs):
        try:
            j = json.loads(req.raw_post_data)
        except ValueError:
            j = None
        resp = func(req, j, *args, **kwargs)

        if isinstance(resp, HttpResponse):
            return resp

        return HttpResponse(json.dumps(resp), mimetype="text")
    return wrap
