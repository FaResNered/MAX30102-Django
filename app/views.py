from django.shortcuts import render
from .models import *
from django.utils import timezone
from django.contrib.auth.hashers import make_password
from serial import Serial, PortNotOpenError, SerialException
from django.http import HttpResponseRedirect, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
import pytz
from yagmail import SMTP
from serial.tools.list_ports import comports

EMAIL = "" #Fill this with your app email to send "Forgot password?" links
PASSWORD = "" #Fill this with your app password (in gmail you have to activate 2FA) to send "Forgot password?" links

# DON'T TOUCH THIS PART
FORMAT = "%Y-%m-%d_%H:%M"
infoTemplates = {
    'login': 'login-page',
    'signup': 'sign-up-page',
    'fail_signin': None,
    'fail_signup': None,
    'username': None,
    'user': None,
    'ID_user': None,
    'fail_reset': None,
    'port': None,
}


@csrf_exempt
@api_view(['GET'])
def forgot_password(request):
    print(f"Request: {request.get_full_path()}")
    username = str(request.get_full_path()).removeprefix("/forgot-password/").removesuffix("/")
    try:
        user = User.objects.get(Username = username)
        user.TOKEN_RESET = User.id_generator()
        user.TIME_REQUEST_RESET = timezone.now()
        link_reset = f"http://127.0.0.1:8000/app/link-password/{user.Username}/{user.TOKEN_RESET}/"
        user.save()

        yag = SMTP(EMAIL, PASSWORD)
        yag.send(user.Email, "Reset password", f"Click the link to reset your password: {link_reset}\nThis link is valid for 10 minutes")
        yag.close()

    except Exception as e:
        print(e)
        return JsonResponse({"Text": f"User does not exist! Try again", "Sended": False})

    return JsonResponse({"Text": f"Check your inbox!", "Sended": True})

@csrf_exempt
@api_view(['GET'])
def measure(request):
    if not infoTemplates['ID_user']:
        return JsonResponse({"URL": "/app/sign-page/"})
    
    while not infoTemplates['port']:
        ports = list(comports())
        for port in ports:
            if "Serial Port" in port.description:
                infoTemplates['port'] = port.name

    try:
        ser = Serial(port=infoTemplates['port'], baudrate=115200)
        try:
            value = eval(str(ser.readline()).replace("b\'", "").replace("\\r\\n\'", ""))
            ser.close()
        except:
            ser.close()
            exit()
    except FileNotFoundError or PortNotOpenError or PermissionError:
        value = {"Finger": 0}
        print("Porta non aperta/Errore permessi")
    except SerialException:
        value = {"Finger": 0}
        infoTemplates['port'] = None
        print("Porta non aperta/Errore permessi (SerialException)")

    if value['Finger']:
        user = User.objects.get(id=infoTemplates['ID_user'])
        misuration = Sensor(BPM=value['BPM'],
                            SpO2=value['SpO2'],
                            HRV=value['HRV'],
                            Temperature=value['Temperature'],
                            Humidity=value['Humidity'],
                            HeatIndex=value['Heat_index'],
                            Time=timezone.now(),
                            CodUser=user)
        misuration.save()
        value.update({"Time": misuration.Time})

    print(value)
    return JsonResponse(infoTemplates | value)

@csrf_exempt
@api_view(['GET'])
def history(request):
    if not infoTemplates['ID_user']:
        return JsonResponse({"URL": "/app/sign-page/"})
    
    print(f"Request: {request.get_full_path()}")
    json_dates = eval("{" + str(request.get_full_path()).removeprefix('/history/').removesuffix('/') + "}")
    misurations = Sensor.objects.filter(CodUser = infoTemplates['ID_user'])
    zone = pytz.timezone('Europe/Rome')
    result = []

    for misuration in misurations:
        inizio = zone.localize(timezone.datetime.strptime(json_dates['inizio'], FORMAT))
        fine = zone.localize(timezone.datetime.strptime(json_dates['fine'], FORMAT))
        if misuration.Time > inizio and misuration.Time < fine:
            to_add = {'BPM': misuration.BPM,
                      'SpO2': misuration.SpO2,
                      'HRV': misuration.HRV,
                      'Temperature': misuration.Temperature,
                      'Humidity': misuration.Humidity,
                      'Heat_index': misuration.HeatIndex,
                      'Time': misuration.Time}
            result.append(to_add)
          
    return JsonResponse(result, safe=False)

def link_password(request):
    infoTemplates['fail_reset'] = None
    if request.method == 'POST':
        infoTemplates['fail_signup'] = None
        infoTemplates['fail_signin'] = None
        if request.POST.get('newpassword1') == request.POST.get('newpassword2'):
            user = User.objects.get(Username = infoTemplates['username'])
            user.password = make_password(request.POST.get('newpassword1'))
            user.save()
            return HttpResponseRedirect("http://127.0.0.1:8000/app/sign-page/")
        else:
            infoTemplates['fail_reset'] = "Passwords does not match"
            return render(request, 'reset-password.html', infoTemplates)
    else:
        username, token = str(request.get_full_path()).removeprefix("/app/link-password/").removesuffix("/").split("/")
        print(f"Username: {username}")
        print(f"TOKEN: {token}")
        if token != "None":
            try:
                user = User.objects.get(Username = username, TOKEN_RESET = token)

                if user.TIME_REQUEST_RESET > (timezone.now() - timezone.timedelta(minutes=10)):
                    user.TOKEN_RESET = "None"
                    user.save()
                    infoTemplates['username'] = user.Username
                    return render(request, 'reset-password.html', infoTemplates)
                else:
                    print("Error: Time limit (10 minutes) exceeded. Send another request")
                    infoTemplates['fail_signin'] = "Time limit (10 minutes) exceeded. Send another request"

            except Exception as e:
                print(f"Error: {e}")
                infoTemplates['fail_signin'] = "Wrong link, try again"
        else:
            infoTemplates['fail_signin'] = "Wrong link, try again"

        return HttpResponseRedirect("http://127.0.0.1:8000/app/sign-page/")

def home_page(request):
    if infoTemplates['ID_user']:
        return render(request, 'home-page.html', infoTemplates)
    else:
        return HttpResponseRedirect("/app/sign-page/")

def redirect_main_page(request):
    return HttpResponseRedirect("/app/main-page/home/")

def history_page(request):
    if infoTemplates['ID_user']:
        return render(request, 'history-page.html', infoTemplates)
    else:
        return HttpResponseRedirect("/app/sign-page/")
    
def health_page(request):
    if infoTemplates['ID_user']:
        return render(request, 'health-page.html', infoTemplates)
    else:
        return HttpResponseRedirect("/app/sign-page/")

def sign(request):
    if request.method == 'POST':
        infoTemplates['fail_signup'] = None
        infoTemplates['fail_signin'] = None
        # SIGNING IN
        if request.POST.get('name', None) == None:
            try:
                user = User.objects.get(Username = request.POST.get('username'))
                if user.check_password(request.POST.get('password')):
                    infoTemplates['user'] = user.Name
                    infoTemplates['ID_user'] = user.id
                    return HttpResponseRedirect("/app/main-page/")
                else:
                    infoTemplates['fail_signin'] = "Wrong password! Try again"
            
            except User.DoesNotExist:
                infoTemplates['fail_signin'] = "User does not exist! Try again"
        
        # SIGNING UP
        else:
            if request.POST.get('password1') == request.POST.get('password2'):
                user = User(Name = request.POST.get('name'),
                            Username = request.POST.get('username'),
                            password = make_password(request.POST.get('password1')),
                            Email = request.POST.get('email'))

                try:
                    user.save()
                    return HttpResponseRedirect("/app/sign-page/in")
                
                except Exception as e:
                    infoTemplates['fail_signup'] = "Username already exist, change it and try again"
                    print(f"Errore: {e}")
            else:
                print("Password diverse")
                infoTemplates['fail_signup'] = "Passwords do not match"
            
    infoTemplates['ID_user'] = None
    return render(request, 'sign-page.html', infoTemplates)

def emptyURL(request):
    return HttpResponseRedirect("/app/sign-page/")