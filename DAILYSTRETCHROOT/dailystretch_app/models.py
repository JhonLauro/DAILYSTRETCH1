from django.db import models


class Routine(models.Model):
    title = models.TextField()
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=64, blank=True, null=True)
    difficulty = models.CharField(max_length=32, blank=True, null=True)
    duration_text = models.CharField(max_length=64, blank=True, null=True)
    duration_minutes = models.IntegerField(blank=True, null=True)
    instructions = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return self.title
