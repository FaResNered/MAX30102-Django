from django.urls import path, re_path
from . import views
#from django.conf.urls.static import static
#from django.conf import settings

urlpatterns = [
    re_path(r"^link-password/.*/.*/$", views.link_password),
    re_path(r"^forgot-password/.*/$", views.forgot_password),
    path("measure/", views.measure),
    re_path(r"^sign-page/[A-Za-z]*$", views.sign),
    path("main-page/", views.redirect_main_page),
    path("main-page/home/", views.home_page),
    path("main-page/history/", views.history_page),
    path("main-page/health/", views.health_page),
    re_path(r"^history/.*/$", views.history),
    path("", views.emptyURL),
]

#urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)