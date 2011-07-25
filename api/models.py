from django.db import models

# Create your models here.
class RDFTriple(models.Model):
    s = models.CharField(max_length = 200)
    p = models.CharField(max_length = 200)
    o = models.CharField(max_length = 200)
    action = models.CharField(max_length = 50)
    object_type = models.CharField(max_length = 32)
    timestamp = models.DateTimeField()
