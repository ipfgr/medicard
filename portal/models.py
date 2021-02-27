import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


# Create your models here.


class User(AbstractUser):
    user_role = models.CharField(max_length=30, default="user")
    avatar_url = models.URLField(
        default="https://firebasestorage.googleapis.com/v0/b/medicard-db.appspot.com/o/portal%2Fimg%2Fnoimage.jpg?alt=media&token=defb69c4-2ffc-4e10-be83-75498408c2e2")
    med_id = models.CharField(max_length=255, default=uuid.uuid4().hex[:12])
    gender = models.CharField(max_length=15, default='unknow')
    birth_date = models.CharField(max_length=30, default="1920-01-01", null=True)
    short_info = models.CharField(max_length=1000, default=None, null=True)
    home_address = models.CharField(max_length=255, null=True)
    job = models.CharField(max_length=255, null=True)
    phone_number = models.IntegerField(null=True)
    emergency_number = models.IntegerField(null=True)

    def serialize(self):
        return {
            "user": self.username
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


class RecognizedFiles(models.Model):
    user = models.ForeignKey(User, default=None, related_name="username_r", on_delete=models.CASCADE)
    file_name = models.CharField(max_length=255)
    uploaded = models.BooleanField(default=True)
    recognized = models.BooleanField(default=False)
    rejected = models.BooleanField(default=False)

    def __str__(self):
        return "User {}. File Name: {}. Uploaded {}. Recognized{} Rejected{}. ".format(self.user, self.file_name,
                                                                                       self.uploaded, self.recognized,
                                                                                       self.rejected)

    def serialize(self):
        return {
            "user_id": self.user.id,
            "file_name": self.file_name,
            "uploaded": self.uploaded,
            "recognized": self.recognized,
            "rejected": self.rejected
        }
