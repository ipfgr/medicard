from django.contrib.auth import views as auth_views
from django.urls import path
from django.views.generic import TemplateView

from . import views

urlpatterns = [
    path('', views.index_view, name='index'),
    path('login', views.login_view, name="login"),
    path('register', views.register_view, name="register"),
    path('logout', views.logout_view, name="logout"),
    # For user reset password
    path("password-reset", auth_views.PasswordResetView.as_view
         (template_name="portal/reset/password_reset.html"),
         name="password_reset"),
    path("password-reset/done/",
         auth_views.PasswordResetDoneView.as_view
         (template_name="portal/reset/reset_send_success.html"),
         name="password_reset_done"),
    path("password-reset-confirm/<uidb64>/<token>",
         auth_views.PasswordResetConfirmView.as_view
         (template_name="portal/reset/password_reset_confirm.html"),
         name="password_reset_confirm"),
    path("password-reset-complete/",
         auth_views.PasswordResetCompleteView.as_view
         (template_name="portal/login.html"),
         name="password_reset_complete"),

    # API Links
    path('portal', views.portal_view, name="portal"),
    path('portal/<str:med_id>', views.portal_view, name="portal_access"),
    path('portal/api/v1/<str:link>', views.api_view, name="api"),
    path('portal/api/v1/<str:link>/<str:med_id>', views.api_view, name="api_with_ident"),
    path('portal/<str:page>/<str:med_id>', views.portal_view, name="page"),

    # for Admin
    path('admin', views.admin_panel_view, name="admin_panel"),

    # Load serviceworkers
    path('sw.js', (TemplateView.as_view(
        template_name="portal/serviceworkers/sw.js",
        content_type='application/javascript', )),
         name='serviceworker'),
]
