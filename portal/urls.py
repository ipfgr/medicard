from . import views
from django.urls import path

urlpatterns = [
    path('', views.index_view, name='index'),
    path('login', views.login_view, name="login"),
    path("register", views.register_view, name="register"),
    path("logout", views.logout_view, name="logout"),
                    # API Links
    path('portal', views.portal_view, name="portal"),
    path('portal/<str:med_id>', views.portal_view, name="portal_access"),
    path('portal/api/v1/<str:link>', views.api_view, name="api"),
    path('portal/api/v1/<str:link>/<str:med_id>', views.api_view, name="api_with_ident"),

    path('portal/<str:page>/<str:med_id>', views.portal_view, name="page"),
    path('portal/api/v1/family/member', views.family_profile_view, name="family-member-profile"),

]