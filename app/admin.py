from django.contrib import admin
from .models import Sensor, User

# Register your models here.
admin.site.register(User)
admin.site.register(Sensor)