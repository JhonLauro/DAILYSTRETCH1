from django import forms
from django.contrib.auth.models import User
from .models import UserSettings

class UserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username', 'email']

class UserSettingsForm(forms.ModelForm):
    class Meta:
        model = UserSettings
        fields = ['study_duration', 'break_duration', 'bio', 'avatar']
