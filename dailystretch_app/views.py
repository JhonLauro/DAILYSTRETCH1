from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth.decorators import login_required

# Registration


def register_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists!')
            return redirect('register')
        user = User.objects.create_user(
            username=username, email=email, password=password)
        user.save()
        messages.success(
            request, 'Account created successfully! Please login.')
        return redirect('login')
    return render(request, 'dailystretch_app/register.html')

# Login


def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect('home')
        else:
            messages.error(request, 'Invalid credentials!')
            return redirect('login')
    return render(request, 'dailystretch_app/login.html')

# Logout


def logout_view(request):
    logout(request)
    return redirect('login')

# Home page (after login)


@login_required(login_url='login')
def home_view(request):
    return render(request, 'dailystretch_app/home.html')
