from . import views
from django.urls import path

urlpatterns = [
    path('', views.index_view, name='index'),
    path('login', views.login_view, name="login"),
    path("register", views.register_view, name="register"),
    path("logout", views.logout_view, name="logout"),
                    # API Links
    path('portal', views.portal_view, name="portal")
]