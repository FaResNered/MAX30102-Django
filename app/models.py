from django.db import models
from django.contrib.auth.models import AbstractBaseUser
import random
import string
from django.utils import timezone

#User class for database
class User(AbstractBaseUser):

  def id_generator(size=60, chars=string.ascii_uppercase + string.digits + string.ascii_lowercase):
    return ''.join(random.choice(chars) for _ in range(size))

  Username = models.CharField(max_length=100)
  Name = models.CharField(max_length=100)
  Email = models.EmailField(unique=True)

  TOKEN_RESET = models.CharField(max_length=60, default="None")
  TIME_REQUEST_RESET = models.DateTimeField(default=timezone.now)

  USERNAME_FIELD = "Username"
  REQUIRED_FIELDS = [Email, Username]

  def __str__(self):
    return f"{self.Name}"

#Sensor class for database
class Sensor(models.Model):
  
  BPM = models.IntegerField()
  SpO2 = models.IntegerField()
  HRV = models.IntegerField()
  Temperature = models.DecimalField(max_digits=5, decimal_places=2)
  Humidity  = models.DecimalField(max_digits=5, decimal_places=2)
  HeatIndex = models.DecimalField(max_digits=5, decimal_places=2)
  Time = models.DateTimeField()
  CodUser = models.ForeignKey(User, on_delete=models.CASCADE)

  def __str__(self):
    return f"{self.Time}"