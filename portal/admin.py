from django.contrib import admin
from .models import User, FamilyMembers
# Register your models here.

admin.site.register(FamilyMembers),
admin.site.register(User),