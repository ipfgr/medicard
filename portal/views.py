import json
from django.shortcuts import render
from django.urls import reverse
from django.http import HttpResponseRedirect, JsonResponse
from django.db import IntegrityError
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from json import dumps
from django.core import serializers

from .models import User
from .models import FamilyMembers
from .models import AllergyList
from .models import RecognizedFiles
from .models import AccessList

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
    if page == "family":
        family_members = []
        members = FamilyMembers.objects.filter(user_id=request.user.id)
        if not members:
            return render(request, 'portal/portal.html', {
                "user": info,
                "family": True,
            })
        else:
            for member in members:
                family_members.append(member.family_members_list_id)
            query = Q()
            for ident in family_members:
                query.add(Q(id=ident), Q.OR)
            my_family = User.objects.filter(query)
            return render(request, 'portal/portal.html', {
                "user": info,
                "family": True,
                "my_family": my_family
            })
    elif page == "recognizer":
        return render(request, 'portal/portal.html', {
            "user": info,
            "recognizer": True,
        })
    elif page == "profile":
        return render(request, 'portal/portal.html', {
            "user": info,
            "profile": True,

        })
    else:
        return render(request, 'portal/portal.html', {
            "user": info,
            "dashboard": True
        })

@login_required()
def search_view(request, ident =""):
    if request.method == "GET":
        checker = User.objects.filter(med_id=ident)
        if not checker:
            return JsonResponse({"message": "Not correct ID"}, status=404)
        else:
            return JsonResponse(checker[0].username, safe=False, status=200)

@login_required()
def remove_family_member_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        remove_id = data.get("id", "")
        FamilyMembers.objects.filter(user_id=request.user.id, family_members_list=remove_id).delete()

@login_required()
def add_family_member_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        med_id = data.get("medid", "")
        # find_link = FamilyMembers.objects.raw('SELECT * from portal_familymembers WHERE family_members_id_list= %s',
        #                                       [med_id])
        get_append_user_id = User.objects.get(med_id=med_id)
        # check if current user already add this member to his family
        find_link = FamilyMembers.objects.filter(user_id=request.user.id, family_members_list=get_append_user_id.id)
        if not find_link:
            FamilyMembers(user_id=request.user.id, family_members_list=get_append_user_id.id).save()
            return JsonResponse({"message": "Add successfuly"}, status=201)
        else:
            return JsonResponse({"message": "Already added"}, status=200)

@login_required()
def api_view(request, link):
    user_id = request.user.id
    if request.method == "POST":
        if link == "access":
            data = json.loads(request.body)
            access = data.get("access", "")
            get_append_user_id = User.objects.get(med_id=access)
            if AccessList.objects.filter(user_id=user_id, access_user=get_append_user_id.id):
                return JsonResponse({"Message: Already exists"}, status=200)
            else:
                AccessList(user_id=user_id, access_user=get_append_user_id).save()
                return JsonResponse({"Message: Saved"}, status=201)

        if link == "allergens":
            data = json.loads(request.body)
            allergen = data.get("allergen", "")
            print(allergen)
            if AllergyList.objects.filter(user_id=user_id, allergen_name=allergen):
                return JsonResponse({"Message: Already exists"}, status=200)
            else:
                AllergyList(user_id =user_id, allergen_name=allergen).save()
                return JsonResponse({"Message: Saved"}, status=201)

        if link == "recognizer":
            data = json.loads(request.body)
            filenames = data.get("filenames", "")
            print(filenames)
            for file in filenames:
                RecognizedFiles(user_id=user_id, file_name=file).save()
            return JsonResponse({"Message: Saved"}, status=201)

        if link == "profile":
            data = json.loads(request.body)
            full_name = data.get("full-name", "")
            bio = data.get("bio", "")
            gender = data.get("gender", "")
            birthday = data.get("birthday", "")
            job = data.get("job", "")
            email = data.get("email", "")
            home_address = data.get("home-address", "")
            phone_number = data.get("phone_number", "")
            emergency_number = data.get("emergency_number", "")
            notifications = data.get("notifications", "")
            print(bio)
            checkbox = True
            if notifications == "off":
                checkbox = False
            User.objects.filter(id=request.user.id).update(full_name=full_name,
                                                        gender=gender,
                                                        bio=bio,
                                                        birth_date=birthday,
                                                        home_address=home_address,
                                                        job=job,
                                                        email=email,
                                                        phone_number=phone_number,
                                                        emergency_number=emergency_number,
                                                        notifications=checkbox)

            return JsonResponse({"Message: Saved"}, status=201)

    if request.method == "GET":
        if link == "allergens":
            report = []
            answer = AllergyList.objects.filter(user_id=user_id)
            for item in answer:
                report.append(item.allergen_name)
            return JsonResponse(report, safe=False)

        if link == "recognizer":
            answers = RecognizedFiles.objects.filter(user_id=user_id)
            answers = answers.order_by("id").all()
            return JsonResponse([answer.serialize() for answer in answers], safe=False)

        if link == "access":
            answers = AccessList.objects.filter(user_id=user_id)
            return JsonResponse([answer.serialize() for answer in answers], safe=False)

    if request.method == "PUT":
        data = json.loads(request.body)
        url = data.get("url", "")
        User.objects.filter(id=user_id).update(avatar_url=url)
        return JsonResponse({"message": "Avatar url updated"}, status=204)

    if request.method == "DELETE":
        if link == "allergens":
            data = json.loads(request.body)
            allergen = data.get("delete", "")
            AllergyList.objects.filter(user_id=user_id, allergen_name=allergen).delete()
            return JsonResponse({"Message": "Delete Success"}, status = 204)



def family_profile_view(request, id):
    pass

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

