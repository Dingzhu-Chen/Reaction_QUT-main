from django.db import models
import random as rand
from user.models import User

class Disaster(models.Model):
    api_identifier =models.CharField(max_length=30, default=rand.random())
    api_type = models.CharField(max_length=30, default="No type specified")
    geometry = models.JSONField(null=False, default={"type": "", "coordinates": []})
    name = models.CharField(max_length=255, null=True)
    dateNum = models.BigIntegerField(null=True, default=0)
    lastUpdated = models.BigIntegerField(null=True, default=0)
    properties=models.JSONField(null=False, default={"Name": "Nothing"})
    
    def to_json(self):
        return {
            'api_identifier':self.api_identifier,
            'api_type': self.api_type,
            'geometry':self.geometry,
            'name':self.name,
            'dateNum':self.dateNum,
            'lastUpdated':self.lastUpdated,
            'properties': self.properties
        }
# User subscriptions
class Area_Selections(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    geometry = models.JSONField(null=False, default={"type": "", "coordinates": []})
    title = models.CharField(max_length=255)
    receive_email_notifications = models.IntegerField(null=False, default=0)
    def __str__(self):
        return self.title
    
class Idempotency_Keys(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    area = models.ForeignKey(Area_Selections, on_delete=models.CASCADE)
    hazard = models.ForeignKey(Disaster, on_delete=models.CASCADE)
    email = models.BooleanField(null=False, default=False)
    creation_date_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.id


