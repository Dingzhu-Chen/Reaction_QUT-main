from celery import shared_task
from user.models import User, Notification
from disaster_notification_system.models import Disaster, Idempotency_Keys, Area_Selections
from django.core.mail import EmailMessage
from http import HTTPStatus
from django.template.loader import render_to_string
import json
import os
import datetime
from . import disasters
from shapely.geometry import shape
from channels.layers import get_channel_layer
import asyncio

channel_layer = get_channel_layer()

sendToRealEmails = False
devEmail = os.environ.get('DEV_EMAIL')
activeStatusCodes = ["Going", "Active"]
all_users = User.objects.all()

# Query all APIs and add new hazards to database if not already in the database, and
# update entries in database if API has updated information
def updateHazardsData():
    disasters.saveDisasterData()

def emailPreference(request):
    if 'receive_email_notification' not in request.keys():
        return 0
    if request['receive_email_notification'] != "on":
        return 0
    return 1

def geoCoordsMissing(request):
    return 'map_selection' not in request.keys() or request['map_selection'] == ""
    
def generateResponse(message, status):
    return {'message': message, 'status': status}

def titleMissing(request):
    return 'title' not in request.keys() or request['title'] == ""

def nameMissing(request):
    areas_with_title = Area_Selections.objects.filter(title=request['title'], user=User.objects.get(id=request['user']))
    return len(areas_with_title) > 0

def saveArea(request, emailPreference):
    Area_Selections.objects.create(
            user=User.objects.get(id=request['user']),
            geometry=json.loads(request['map_selection'])['geometry'],
            title=request['title'],
            receive_email_notifications=emailPreference
            )

# Subscribe to a selected area
def subscribeToArea(request):
    try:
        preference = emailPreference(request)
        error_conditions = [
            (geoCoordsMissing(request), "You need to select a new area"),
            (titleMissing(request), "You need to enter a title"),
            (nameMissing(request), "Area with that title already exists"),
        ]

        for condition, error_message in error_conditions:
            if condition:
                return generateResponse(error_message, HTTPStatus.BAD_REQUEST)

        saveArea(request, preference)

        return generateResponse("Subscription Successful", HTTPStatus.OK)
        
    except Exception as e:
        print(f"Something went wrong. Error: {e}")
        return generateResponse(f"Something went wrong", HTTPStatus.INTERNAL_SERVER_ERROR)

def deleteAreaImage(area_id, area_title, user_id):
    img_file_path = f"./disaster_notification_system/static/disaster_notification_system/img/area_images/hazard_area_{area_id}_{area_title}_{user_id}.png"
    try:
        os.remove(img_file_path)
    except Exception as e:
        print(f"Something went wrong trying to delete {img_file_path}. Error: {e}")

def unsubscribeFromArea(subscription_id, user_id):
    try:
        area = Area_Selections.objects.filter(id=subscription_id).first()
        for notification in Notification.objects.filter(area_name=area.title):
            notification.delete()
        area.delete()
        deleteAreaImage(subscription_id, area.title, user_id)
        return generateResponse("Successfully unsubscribed", HTTPStatus.OK)
    except Exception as e:
        print(f"Area unsubscription unsuccessful. Error: {e}")
        return generateResponse("Something went Wrong", HTTPStatus.BAD_REQUEST)

def process_escad_hazard(hazard):
    sumOfVehicles = hazard.properties['VehiclesAssigned'] + hazard.properties['VehiclesOnScene'] + hazard.properties['VehiclesOnRoute']
    if sumOfVehicles <= 2:
        severity = "Minor"
    elif sumOfVehicles <= 6:
        severity = "Moderate"
    else:
        severity = "Severe"
    hazardType = hazard.properties['GroupedType']
    location = hazard.properties["Location"] + " : " + str(hazard.geometry["coordinates"][0]) + "," + str(hazard.geometry["coordinates"][1])
    description = "Emergency Services Computer Aided Dispatch Warnings"
    return severity, hazardType, location, description

def process_water_hazard(hazard):
    severity = hazard.properties['Class']
    hazardType = "Water Level Warning"
    location_name = hazard.name
    if hazard.properties["Stream"] is not None:
        location_name = f"{location_name} {hazard.properties['Stream']}"
    location = f"{location_name} : {str(hazard.geometry['coordinates'][0])}, {str(hazard.geometry['coordinates'][1])}"
    description = "Water Level Gauge"
    return severity, hazardType, location, description

def process_roads_hazard(hazard):
    severity = hazard.properties['impact']['impact_type'] + " - " + hazard.properties['impact']['direction']
    description = hazard.properties['description'] or "No description provided"
    info = hazard.properties['information'] or ""
    if info:
        description = f"{description} - {info}"
    location = f"{hazard.properties['road_summary']['road_name']} {hazard.properties['road_summary']['locality']} {hazard.properties['road_summary']['postcode']}" or "No location details provided"
    hazardType = "Road Hazard" if hazard.properties['event_type'] == "Hazard" else "Road Work"
    return severity, hazardType, location, description

def process_hazard(hazard):
    if hazard.api_type == "escad":
        return process_escad_hazard(hazard)
    elif hazard.api_type == "water":
        return process_water_hazard(hazard)
    elif hazard.api_type == "roads":
        return process_roads_hazard(hazard)
    
def formattedDate(hazard):
    timestamp = hazard.dateNum / 1000
    date_object = datetime.datetime.fromtimestamp(timestamp)
    return date_object.strftime('%d-%m-%Y')

def notificationExists(user, area, hazard):
    severity, hazardType, location, description = process_hazard(hazard)
    return Notification.objects.filter(user = user,
                    area_name = area.title,
                    hazard_type = hazardType,
                    hazard_severity = severity,
                    hazard_id = hazard.api_identifier,
                    hazard_location = location,
                    hazard_description = description,).exists()

def createNotification(user, area, hazard):
    severity, hazardType, location, description = process_hazard(hazard)
    Notification.objects.create(
                    user = user,
                    date = formattedDate(hazard),
                    area_name = area.title,
                    hazard_type = hazardType,
                    hazard_severity = severity,
                    hazard_id = hazard.api_identifier,
                    hazard_location = location,
                    hazard_description = description,
                )

def generateBannerNotification(area, hazard):
    severity, hazardType, location, description = process_hazard(hazard)
    return {
                'date': formattedDate(hazard),
                'area_name': area.title,
                'hazard_type': hazardType,
                'hazard_severity': severity,
                'hazard_id': hazard.api_identifier,
                'hazard_location': location,
                'hazard_description': description,
            }

def generateEmailNotification(idem_key, area, hazard):
    severity, hazardType, location, description = process_hazard(hazard)
    return {
                'date': formattedDate(hazard),
                'area_name': area.title,
                'hazard_type': hazardType,
                'hazard_severity': severity,
                'hazard_id': hazard.api_identifier,
                'hazard_location': location,
                'hazard_description': description,
                'idemKey': idem_key
            }

# Loop through all users and hazards to find hazards that the user should
# be notified about and return this information as a dictionary
def userHazardNotifications():
    userNotificationsDict = dict()
    allHazards = Disaster.objects.all()
    for user in all_users:
        userNotifs = []
        for area in Area_Selections.objects.filter(user = user):

            for hazard in allHazards:
                if not hazardInArea(hazard.geometry, area.geometry):
                    continue
                if Idempotency_Keys.objects.filter(user=user, area=area, hazard=hazard).exists():
                    continue
                if user.id not in userNotificationsDict.keys():
                    userNotificationsDict[user.id] = []
                
                idem_key = Idempotency_Keys(user=user, area=area, hazard=hazard, email=area.receive_email_notifications != 0)

                # Check exists
                if notificationExists(user, area, hazard):
                    continue

                # Create notification for banners and on User page
                createNotification(user, area, hazard)

                emailNotif = generateEmailNotification(idem_key, area, hazard)
                bannerNotif = generateBannerNotification(area, hazard)
                
                userNotifs.append(bannerNotif)

                # Only skip if email turned off
                if area.receive_email_notifications == 0:
                    # Since object has been created and email doesnt need to be sent, key can be saved
                    idem_key.save()
                    
                    # otherwise saves after email and still creates banner
                    continue
                userNotificationsDict[user.id].append(emailNotif)
        loop = asyncio.get_event_loop()
        loop.run_until_complete(sendBannerNotifications(user.id, userNotifs))
    return userNotificationsDict

# Check if the hazard is within the saved area
def hazardInArea(hazardGeometry, areaGeometry):
    polygon_shape = shape(areaGeometry)
    point_shape = shape(hazardGeometry)
    return point_shape.within(polygon_shape)

def emailContext(user, data):
    return {
        'email_subject': 'Natural Disaster Notifications',
        'recipient_name': user.first_name,
        'hazards': data,
    }

def emailHTML(context):
    current_directory = os.path.dirname(os.path.abspath(__file__))
    template_path = os.path.join(current_directory, 'templates/disaster_notification_system/disaster_notification_email.html')
    return render_to_string(template_path, context)

def emailMessage(user, emailBody):
    message = EmailMessage(
        subject = 'Natural Disaster Notifications',
        body = emailBody,
        to = [user.email] if sendToRealEmails else [devEmail],
    )
    message.content_subtype = "html"
    return message

def updateIdemKeys(idemKeys):
    for k in idemKeys:
            k.save()

def hazardTableRow(notif):
    return {
                'date': notif["date"],
                'area_name': notif["area_name"],
                'hazard_type': notif["hazard_type"],
                'hazard_severity': notif["hazard_severity"],
                'hazard_id': notif["hazard_id"],
                'hazard_location': notif["hazard_location"],
                'hazard_description': notif["hazard_description"],
            }

@shared_task(autoretry_for=(Exception,), retry_kwargs={'max_retries': 10}, retry_backoff=True)
def sendNotificationEmail(userId, hazardsTable):
    if len(hazardsTable) == 0:
        return
    user_by_id = User.objects.get(id=userId)
    context = emailContext(user_by_id, hazardsTable)
    email_html = emailHTML(context)
    email = emailMessage(user_by_id, email_html)
    email.send()

@shared_task(autoretry_for=(Exception,), retry_kwargs={'max_retries': 10}, retry_backoff=True)
def hazard_notifications_task():
    updateHazardsData()
    print(devEmail)
    userNotificationsDict = userHazardNotifications()
    for userId in userNotificationsDict.keys():
        hazardsTable = []
        idemKeys = []
        for notif in userNotificationsDict[userId]:
            hazardsTable.append(hazardTableRow(notif))
            idemKeys.append(notif["idemKey"])
        try:
            sendNotificationEmail.apply_async((userId, hazardsTable), ignore_result=True)
            updateIdemKeys(idemKeys)
        except Exception as e:
            print(f"Error sending email to userid [{userId}]: {e}")

async def sendBannerNotifications(userId, notificationsDict):
    channel_name = f"user_{str(userId)}"
    await channel_layer.group_send(
        channel_name,
        {
            "type": "disasterNotification",
            "message": json.dumps(notificationsDict),
        },
    )
