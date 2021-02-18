from django.db import models
from datetime import datetime

from django.contrib.auth.models import AbstractUser

# Create your models here.


class User(AbstractUser):
    user_role = models.CharField(max_length=30, default="user")

    def serialize(self):
        return {
            "username": self.username
        }
