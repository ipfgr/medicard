from django.shortcuts import render

from django.http import HttpResponse


def index(request):
    context = {
        "message": "hello from Django",
        "title": "Welcome to MediCard",
        "index": True
    }
    return render(request, 'portal/index.html', context)


def login(request):
    context = {
        "message": "Login from Django",
        "title": "Login to MediCard",
        "login": True

    }
    return render(request, 'portal/index.html', context)

def register(request):
    context = {
        "message": "Register from Django",
        "title": "Register to MediCard",
        "register": True
    }
    return render(request, 'portal/index.html', context)