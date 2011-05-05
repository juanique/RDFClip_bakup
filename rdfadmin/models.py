from django.db import models
from django.contrib.auth.models import User

class SavedQuery(models.Model):
    name = models.CharField(max_length = 200)
    endpoint = models.CharField(max_length = 200, blank = True)
    query = models.TextField()
    owner = models.ForeignKey(User)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Saved queries"

class RecentQuery(models.Model):
    endpoint = models.CharField(max_length = 200, blank = True)
    context = models.CharField(max_length = 200, blank = True)
    query = models.TextField()
    user = models.ForeignKey(User, null = True)
    creation = models.DateTimeField(auto_now = True)

    class Meta:
        verbose_name_plural = "Recent queries"
