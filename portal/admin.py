from django.contrib import admin
from .models import User, FamilyMembers, AllergyList, RecognizedFiles
# Register your models here.

admin.site.register(FamilyMembers),
admin.site.register(User),
admin.site.register(AllergyList),
admin.site.register(RecognizedFiles)