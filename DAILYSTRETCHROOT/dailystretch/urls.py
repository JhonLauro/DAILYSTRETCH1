"""
URL configuration for dailystretch project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from dailystretch_app import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.landing_page, name='landing'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register_view, name='register'),

    # Home page
    path('main/', views.main_view, name='main'),

    # Segment URLs (for dynamic loading into the "island")
    path('main/dashboard/', views.dashboard_segment, name='dashboard'),
    path('main/library/', views.library_segment, name='library'),
    path('main/favorites/', views.favorites_segment, name='favorites'),
    path('main/profile/', views.profile_segment, name='profile'),
    path('main/settings/', views.settings_segment, name='settings'),
]
