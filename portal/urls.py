from . import views
from django.urls import path

urlpatterns = [
    path('', views.index_view, name='index'),
    path('login', views.login_view, name="login"),
    path("register", views.register_view, name="register"),
    path("logout", views.logout_view, name="logout"),
                    # API Links
    path('portal', views.portal_view, name="portal"),
    path('portal/api/v1/<str:link>', views.api_view, name="api"),
    path('portal/<str:page>', views.portal_view, name="page"),
    path('portal/search/<str:ident>', views.search_view, name="search_id"),
    path('portal/family/member/<str:id>', views.family_profile_view, name="family-memper-pprofile"),
    path('portal/family/add', views.add_family_member_view, name="addmember"),
    path('portal/family/remove', views.remove_family_member_view, name="removemember")

]