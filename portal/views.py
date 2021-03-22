import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.db.models import Q
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse

from .models import AccessList
from .models import AllergyList
from .models import FamilyMembers
from .models import RecognizedFiles
from .models import User



def index_view(request):
    context = {
        "message": "hello from Django",
        "title": "Welcome to MediCard",
        "index": True
    }
    return render(request, 'portal/index.html', context)


@login_required()
def portal_view(request, med_id="", page=""):
    # if user link to portal index page he automatialy get to pages with his med_id
    if med_id == "":
        med_id = request.user.med_id

    # Check if logged user looking his pages
    if med_id == request.user.med_id:
        current_user = User.objects.get(med_id=request.user.med_id)
        info = User.objects.get(username=current_user.username)
        if page == "family":
            family_members = []
            # Get all family members from DB
            members = FamilyMembers.objects.filter(user_id=request.user.id)
            if not members:
                return render(request, 'portal/family.html', {
                    "user": info,
                    "family": True,
                    "owner": True
                })
            else:
                # Prepare query for show added family members list
                for member in members:
                    family_members.append(member.family_members_list_id)
                query = Q()
                for ident in family_members:
                    query.add(Q(id=ident), Q.OR)
                my_family = User.objects.filter(query)
                return render(request, 'portal/family.html', {
                    "user": info,
                    "family": True,
                    "owner": True,
                    "my_family": my_family
                })
        elif page == "recognizer":
            return render(request, 'portal/recognizer.html', {
                "user": info,
                "recognizer": True,
                "owner": True,

            })
        elif page == "profile":
            return render(request, 'portal/profile.html', {
                "user": info,
                "owner": True,

            })
        elif page == "card":
            return render(request, 'portal/medicard.html', {
                "user": info,
                "owner": True,

            })
        elif page == "covidpass":
            return render(request, 'portal/passport.html', {
                "user": info,
                "owner": True
            })
        else:
            return render(request, 'portal/portal.html', {
                "user": info,
                "dashboard": True,
                "owner": True

            })
    else:
        # Check if user have access to look another user page
        access_user = User.objects.get(med_id=med_id)
        access_check = AccessList.objects.filter(user_id=access_user.id, access_user=request.user.id)
        info = User.objects.get(med_id=med_id)
        if not access_check:
            return render(request, 'portal/portal.html', {
                "user": info,
                "error": True
            })
        else:
            if page == "card":
                return render(request, 'portal/medicard.html', {
                    "card": True,
                    "user": info
                })
            elif page == "family":
                family_members = []
                # Get all family members from DB
                members = FamilyMembers.objects.filter(user_id=access_user.id)
                if not members:
                    return render(request, 'portal/family.html', {
                        "user": info,
                        "family": True,
                    })
                else:
                    # Prepare query for show added family members list
                    for member in members:
                        family_members.append(member.family_members_list_id)
                    query = Q()
                    for ident in family_members:
                        query.add(Q(id=ident), Q.OR)
                    my_family = User.objects.filter(query)
                    return render(request, 'portal/family.html', {
                        "user": info,
                        "family": True,
                        "my_family": my_family
                    })

            elif page == "profile":
                return render(request, 'portal/profile.html', {
                    "user": info
                })
            elif page == "covidpass":
                return render(request, 'portal/passport.html', {
                    "user": info,
                })
            else:
                return render(request, 'portal/portal.html', {
                    "user": info,
                    "dashboard": True
                })


@login_required()
def api_view(request, link, med_id=""):
    user_id = request.user.id
    # Get user id from med id
    get_user = User.objects.filter(med_id=med_id)
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

        if link == "family":
            data = json.loads(request.body)
            med_id = data.get("medid", "")
            get_append_user_id = User.objects.get(med_id=med_id)
            # check if current user already add this member to his family
            find_link = FamilyMembers.objects.filter(
                user_id=request.user.id,
                family_members_list_id=get_append_user_id.id
            )
            if not find_link:
                FamilyMembers(user_id=request.user.id, family_members_list_id=get_append_user_id.id).save()
                return JsonResponse({"message": "Add successfuly"}, status=201)
            else:
                return JsonResponse({"message": "Already added"}, status=200)

        if link == "allergens":
            data = json.loads(request.body)
            allergen = data.get("allergen", "")
            if AllergyList.objects.filter(user_id=user_id, allergen_name=allergen):
                return JsonResponse({"Message: Already exists"}, status=200)
            else:
                AllergyList(user_id=user_id, allergen_name=allergen).save()
                return JsonResponse({"Message: Saved"}, status=201)

        if link == "recognizer":
            data = json.loads(request.body)
            files = data.get("files", "")
            for file in files:
                RecognizedFiles(user_id=user_id, full_file_url=file).save()

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
            checkbox = True
            print(gender)

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

            return JsonResponse("Message: Saved", safe=False, status=201)

    if request.method == "GET":
        # If we search for user
        if link == "search":
            checker = User.objects.filter(med_id=med_id)
            if not checker:
                return JsonResponse({"message": "Not correct ID"}, status=404)
            else:
                return JsonResponse(checker[0].username, safe=False, status=200)

        if link == "allergens":
            report = []
            answer = AllergyList.objects.filter(user_id=get_user[0].id)
            for item in answer:
                report.append(item.allergen_name)
            return JsonResponse(report, safe=False)

        # Get all files in recognizer database
        if link == "recognizer":
            answers = RecognizedFiles.objects.filter(user_id=user_id)
            answers = answers.order_by("id").all()
            return JsonResponse([answer.serialize() for answer in answers], safe=False)

        if link == "access":
            answers = AccessList.objects.filter(user_id=user_id)
            return JsonResponse([answer.serialize() for answer in answers], safe=False, status=200)

        # GET only for superusers
        if request.user.is_superuser:
            if link == "getuser":
                if request.user.is_superuser:
                    data = User.objects.get(id=med_id)
                    return JsonResponse(data.med_id, status=201, safe=False)

            # Get unrecognized files list
            if link == "get_unrecognized":
                answers = RecognizedFiles.objects.filter(recognized=0)
                answers = answers.order_by("id").all()
                return JsonResponse([answer.serialize() for answer in answers], safe=False)
        else:
            return JsonResponse("Error: you dont have access to this files", status=500, safe=False)

    # For update avatar at profile page
    if request.method == "PUT":
        data = json.loads(request.body)
        url = data.get("url", "")
        User.objects.filter(id=user_id).update(avatar_url=url)
        return JsonResponse({"message": "Avatar url updated"}, status=204)

    if request.method == "PATCH":
        if link == "update_status":
            # GET only for superusers
            if request.user.is_superuser:
                data = json.loads(request.body)
                recognize_url = data.get("url", "")
                print (recognize_url)
                RecognizedFiles.objects.filter(full_file_url=recognize_url).update(recognized=1, rejected=0, uploaded=0)
                return JsonResponse({"Message: Information updated....... Success"})

    if request.method == "DELETE":
        if link == "allergens":
            data = json.loads(request.body)
            allergen = data.get("delete", "")
            AllergyList.objects.filter(user_id=user_id, allergen_name=allergen).delete()
            return JsonResponse({"Message": "Delete Success"}, status=204)

        if link == "access":
            data = json.loads(request.body)
            delete_user = data.get("delete", "")
            get_append_user_id = User.objects.get(username=delete_user)
            AccessList.objects.filter(user_id=user_id, access_user_id=get_append_user_id).delete()
            return JsonResponse({"Message": "Delete Success"}, status=204)

        if link == "family":
            data = json.loads(request.body)
            remove_id = data.get("id", "")
            FamilyMembers.objects.filter(user_id=request.user.id, family_members_list=remove_id).delete()


def login_view(request):
    context = {
        "message": "Login from Django",
        "title": "Login to MediCard",
        "login": True

    }
    if request.method == "GET":
        return render(request, 'portal/login.html', context)

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
            return render(request, "portal/login.html", {
                "message": "Invalid username and/or password.",
                "login": True
            })
    else:
        return render(request, "portal/login.html", context)


def register_view(request):
    context = {
        "message": "Register from Django",
        "title": "Register to MediCard",
        "register": True
    }

    if request.method == "GET":
        return render(request, 'portal/login.html', context)

    if request.method == "POST":
        user_role = request.POST["role_name"]
        username = request.POST["username"]
        email = request.POST["email"]
        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "portal/login.html", {
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
            return render(request, "portal/login.html", {
                "message": "Username already taken.",
                "register": True
            })
        if user_role == "doctor":
            return render(request, 'portal/login.html', {
                "register": True,
                "messagedoc": "You registred as Doctor, we need review your license for activate account. Its take up to 12 hours"
            })
        else:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "portal/login.html", context)


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


@login_required()
def admin_panel_view(request):
    # Get all unrecogized filenames
    files_list = RecognizedFiles.objects.raw(
        'SELECT * FROM portal_recognizedfiles WHERE recognized = "0" AND uploaded="1"')
    users_list = User.objects.all()
    if request.user.is_superuser:
        return render(request, "portal/admin/admin.html", {
            "files": files_list,
            "users": users_list
        })

