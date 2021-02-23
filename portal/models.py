from django.db import models
from datetime import datetime
import uuid

from django.contrib.auth.models import AbstractUser

# Create your models here.


class User(AbstractUser):
    user_role = models.CharField(max_length=30, default="user")
    med_id = models.CharField(max_length=255, default=uuid.uuid4().hex[:12])
    gender = models.CharField(max_length=15, default='unknow')
    birth_date = models.DateField(default=None)

    def serialize(self):
        return {
            "username": self.username
        }


class FamilyMembers(models.Model):
    user = models.ForeignKey(User, default=None, related_name="username_f", on_delete=models.CASCADE)
    family_members_id_list = models.CharField(max_length=500, default=None)

    def __str__(self):
        return "User {} have family members {}".format(self.user_id, self.family_members_id_list)


class AllergyList(models.Model):
    user = models.ForeignKey(User, default=None, related_name="username_a", on_delete=models.CASCADE)
    allergen_name = models.CharField(max_length=100, default=None, null=True)
    custom_allergen_input = models.CharField(max_length=100, default=None, null=True)
    
    def __str__(self):
        return "User {} have allergy on {} {}".format(self.user, self.allergen_name, self.custom_alergen_input)

    def serialize(self):
        return {
            "userid": self.user,
            "allergen": self.allergen_name

        }
