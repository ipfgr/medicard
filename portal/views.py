from django.shortcuts import render
from django.urls import reverse
from django.http import HttpResponseRedirect, JsonResponse
from django.db import IntegrityError
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required


from .models import User

from django.http import HttpResponse


def index_view(request):
    context = {
        "message": "hello from Django",
        "title": "Welcome to MediCard",
        "index": True
    }
    return render(request, 'portal/index.html', context)

@login_required()
def portal_view(request):
    return render(request, 'portal/portal.html')

def login_view(request):
    context = {
        "message": "Login from Django",
        "title": "Login to MediCard",
        "login": True

    }
    if request.method == "GET":
        return render(request, 'portal/index.html', context)

    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "portal/index.html", {
                "message": "Invalid username and/or password.",
                "login": True
            })
    else:
        return render(request, "portal/index.html", context)

def register_view(request):
    context = {
        "message": "Register from Django",
        "title": "Register to MediCard",
        "register": True
    }

    if request.method == "GET":

        return render(request, 'portal/index.html', context)

    if request.method == "POST":
        user_role = request.POST["role_name"]
        username = request.POST["username"]
        email = request.POST["email"]
        print(user_role)
        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "portal/index.html", {
                "message": "Passwords must match.",
                "register": True
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
            if user_role == "doctor":
                User.objects.filter(username=username).update(user_role=user_role, is_active=False)
            else:
                User.objects.filter(username=username).update(user_role=user_role)



        except IntegrityError:
            return render(request, "portal/index.html", {
                "message": "Username already taken.",
                "register": True
            })
        if user_role == "doctor":
            return render(request, 'portal/index.html', {
                "register": True,
                "messagedoc": "You registred as Doctor, we need review your license for activate account. Its take up to 12 hours"
            })
        else:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "portal/index.html", context)



def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

