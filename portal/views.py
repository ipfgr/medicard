import json
from django.shortcuts import render
from django.urls import reverse
from django.http import HttpResponseRedirect, JsonResponse
from django.db import IntegrityError
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db.models import Q



from .models import User
from .models import FamilyMembers

from django.http import HttpResponse


def index_view(request):
    context = {
        "message": "hello from Django",
        "title": "Welcome to MediCard",
        "index": True
    }
    return render(request, 'portal/index.html', context)

@login_required()
def portal_view(request, page=""):
    current_user = request.user.username
    info = User.objects.get(username=current_user)

    family_members = []
    members = FamilyMembers.objects.filter(user_id=request.user.id)
    for member in members:
        family_members.append(member.family_members_id_list)
    query = Q()
    for id in family_members:
        query.add(Q(id=id), Q.OR)
    if page == "family":
        my_family = User.objects.filter(query)
        print(query)
        return render(request, 'portal/portal.html', {
            "user": info,
            "family": True,
            "my_family": my_family
        })
    else:
        return render(request, 'portal/portal.html', {
            "user": info,
            "dashboard": True
        })

@login_required()
def search_view(request, id =""):
    if request.method == "GET":
        checker = User.objects.filter(med_id=id)
        if not checker:
            return JsonResponse({"message": "Not correct ID"}, status=404)
        else:
            return JsonResponse(checker[0].username, safe=False, status=200)

@login_required()
def remove_family_member_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        remove_id = data.get("id", "")
        FamilyMembers.objects.filter(user_id=request.user.id, family_members_id_list=remove_id).delete()

@login_required()
def add_family_member_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        med_id = data.get("medid", "")
        find_link = FamilyMembers.objects.raw("SELECT * from portal_familymembers WHERE family_members_id_list= %s",
                                              [med_id])
        get_append_user_id = User.objects.get(med_id=med_id)

        if not find_link:
            FamilyMembers(user_id=request.user.id, family_members_id_list=get_append_user_id.id).save()
            return JsonResponse({"message": "Add succefuly"}, status=201)
        else:
            return JsonResponse({"message": "Already added"}, status=200)


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

