from django.contrib import admin
from .models import User, FamilyMembers, AllergyList
# Register your models here.

admin.site.register(FamilyMembers),
admin.site.register(User),
admin.site.register(AllergyList)