def user(request):
    if hasattr(request, 'user'):
        return {'user' : request.user }
    return {'user' : 'not_logged_in'}
