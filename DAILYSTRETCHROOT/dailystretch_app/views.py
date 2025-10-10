from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth.decorators import login_required

# Registrations


def register_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')

        errors = {}

        if User.objects.filter(username=username).exists():
            errors['username'] = 'Username already exists!'

        if User.objects.filter(email=email).exists():
            errors['email'] = 'Email already in use!'

        if password != confirm_password:
            errors['password'] = 'Passwords do not match!'

        if len(password) < 8:
            errors['password'] = 'Password must be at least 8 characters.'

        import re
        if not re.search(r'[A-Za-z]', password) or not re.search(r'\d', password):
            errors['password'] = 'Password must contain at least one letter and one number.'

        if errors:
            return render(request, 'dailystretch_app/register.html', {'errors': errors, 'username': username, 'email': email})

        user = User.objects.create_user(
            username=username, email=email, password=password)
        user.save()
        messages.success(
            request, 'Account created successfully! Please login.')
        return redirect('login')

    return render(request, 'dailystretch_app/register.html')


# Landing


def landing_page(request):
    return render(request, 'dailystretch_app/landing.html')


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
