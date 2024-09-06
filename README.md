# Team Reaction - Project Documentation<br/>Natural Disaster Warning System

The Notion page for this project can be found [here](https://www.notion.so/orefox/6-Natural-Disaster-Warning-System-b84b5375ae6a48b083512d3b52fc18bd?pvs=4).

## 1.0.0 - User Guide

### 1.0.1 - Startup Instructions

There are a number of additional packages that need to be installed, the requirements.txt has been updated accordingly, just run the standard `python3 pip install -r requirements.txt` command to update and install all necessary packages.

Some of the packages used to send the notifications rely on a redis server to be running. You can run the redis server with the following command:

```shell
sudo service redis-server start
```

The email notification system works using a service called Celery. For the system to work, two Celery services need to be run. From within the `/web` directory, you can run the main Celery worker, which is used to run the notification tasks, using the following command, adjust the logging level as needed:

```shell
celery -A main worker --loglevel=info
```

Celery Beat is also required to be running as this service is used to schedule the notification task so that they can be automatically run at specific times instead of being manually triggered.. When it runs it will trigger banner notifications for all notifications, and send emails for the areas that the associated user has enabled notifications for. This can be run using the following command:

```shell
celery -A main beat --loglevel=info
```

To trigger the notification manually, you can run the following command from the `/web` directory:

```shell
celery -A main call disaster_notification_system.tasks.hazard_notifications_task
```

In addition to gathering the notification details and sending it, it will also hit the disaster API's to update the data saved in the database. This will provide the users with the most up to date information on the map, without the need to query the API's every time.

## 1.2.0 - Interactive Map

The main functionality of this app is accessed through the pre-existing interactive map. The data pulled from the disaster API's is filtered and then displayed through a number of markers / lines on the map depending on the type of hazard.

Any road closures will appear on the map as a bright red line, showing the effected area from start to finish. These behave the same as any of the other marker and can be clicked on for more information.

Other hazards will appear with a relevant icon. This includes fire, water and general hazards such as traffic incidents etc. (see `Figure 1`).

![Interactive Map with Hazard Icons](https://i.imgur.com/T6mfL7L.png)

*Figure 1 - Interactive Map with new Hazard Icons*

### 1.2.1 - Hazard Icons

Six different icons are used to represent the different hazards on the interactive map. The main three hazards represented are Fire, Flooding and Other Hazards. Three additional icons were also created to represent when these main hazards coincide with roadworks as is often the case. These icons can be seen in the table below or above in `Figure 1`.

| Fire                                 | Flood                                | Other                                | Roadworks and Fire                  | Roadworks and Flood                 | Roadworks and Other                 |
| ------------------------------------ | ------------------------------------ | ------------------------------------ | ------------------------------------ | ------------------------------------ | ------------------------------------ |
| ![](https://i.imgur.com/tFXlQBD.png) | ![](https://i.imgur.com/C0W2IHs.png) | ![](https://i.imgur.com/rTRUOSF.png) | ![](https://i.imgur.com/pIT4uc1.png) | ![](https://i.imgur.com/MneSDI8.png) | ![](https://i.imgur.com/9TZQP3a.png) |


#### Icon Popup Information

When a user hovers their mouse on one of the hazard icons on the interactive map, a popup will show more detailed information on the hazard. This was made according to the format already existing on the OreFox website. An example of the popup can be seen below in `Figure 2`.

<img src="https://imgur.com/jDiID5d.png" alt="Hazard Icon Popup" width=30%>

*Figure 2 - Hazard Icon Popup*

### 1.2.2 - Subscribing & Unsubscribing

To subscribe to all hazard notifications in a given area, the user needs to select an area on the map using the toolbar to the left. Once selected, scroll down to the table below the map and select the natural disasters tab. There will be a list of all hazards within the area that the user has selected, and to the right, if the user is logged in (mostly applicable to the old code base) a subscribe to area button will be available.

Once the subscribe button has been clicked, enter a name for the area and select receive email notifications if needed. After subscribing to an area, the subscription will be available in the notifications page which can be accessed under the notification bell dropdown (see `Figure 3`).

<img src="https://i.imgur.com/qouKGZd.png" alt="Notifications Dropdown" width=50%>

*Figure 3 - Notifications dropdown buttons*

On the notifications page the user can unsubscribe from an area, view further details, view the notification history, or view an image of the selected area. There will be no notification history until the automatic notifications task runs and sends notifications to the user. Until the subscription is cancelled, the user will continue to receive new notifications for the area.

When the celery task runs in the background, if the user is logged in and currently using the application, they will get a banner notification indicating how many new notifications they have received as well as the corresponding email.

## 2.0.0 - Technical Implementation

### 2.1.0 - Interactive Map and Get Hazards for Map Module

To add the data to the interactive map and subsequent tables, the general layout of table creation for other map/table elements has been followed. However, to gather the data in the first place a separate module has been created under the `get_hazards_for_map.js` file. This uses the data provided by the view created to get api data, and then allocates it into a correct structure for the corresponding info popups on the map.

The layers are then constructed from the returned data as they would be with any of the other map layers, however with markers/lines instead of polygons.

### 2.1.1 - Time constraints

Due to time constraints toward the final period of the project, the implementation of the markers and map integration aligns more so with the old codebase than it does with the newer one. Thus the resulting code in the main interactive map JS file has somewhat of a mashup of the two code bases in some sections.

### 2.2.0 - API Integration and Views

A view in the interactive map views file has been created that connects to the `disasters.py` file. `disasters.py` is responsible for managing the database entities that are created from the retrieved API data. The models defined in the interactive map `models.py` file are what the incoming data is mapped to (see section `2.3.0` for more details). As the data comes from the API's as a feature list (alike to those in the local json files), they are processed and then a new feature list is created from the culmination of the processed data. This list is returned when the get disasters view is triggered.

### 2.2.1 - Triggering the API's

When retrieving the hazard data, the code first checks the Redis cache to see if it has any hazard data. If the redis cache has the data, it loads that data and doesn't call the API. However, the cache is currently set to expire once per hour. Once the cache expires, the hazard data will disappear from the cache.

If the cache does not have the data, the APIs will be called through the `saveDisasterData()` function which calls the APIs and saves all the data into the database. The data is then read from the database and uploaded into Redis before being returned.

This system ensures the data is never more than 1 hour old, while maintaining low latency when loading in the hazard data for the interactive map as well as for the daily notification task (see 2.4.0).

Additionally, when new data is pulled in it deletes all existing hazard data in the database so that only active hazards are stored.

The main function for retrieving the hazard data can be seen below:

```python
def getDisasterData():
    # Check if "hazard_events" data is cached in Redis
    events = cache.get("hazard_events")
    if events != None:
        events = json.loads(events)
    print("Loading hazard events cache.")

    if events is None:
        print("No hazard data in cache. Retrieving data from API.")
        events = {
            'type': 'FeatureCollection',
            'features': []
        }
        saveDisasterData()
        disasters = Disaster.objects.all()

        for event in disasters:
            events["features"].append(event.to_json())

        # Convert events to JSON and cache it in Redis
        events_json = json.dumps(events)
        cache.set("hazard_events", events_json, timeout=3600)  # Cache for 1 hour

    return events
```
### 2.3.0 - Database Implementation and Models

The database implementation follows the same principle of all other apps within the project, utilising models of the Django.db library.

### 2.3.1 - Models

Models `2.3.1.1`, `2.3.1.2` and `2.3.1.3` are defined in the `interactive_map/models.py` file, `2.3.1.4` is defined in the `user/models.py` file:

#### 2.3.1.1 - Disaster Model

```python
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
```

The disaster model is utilised mostly by the API integration and the interactive map to display data. A few key properties from within the original feature retrieved by the API have been added as columns, however the main content section of the features, the properties, has been allocated to its own JSON field so that any necessary data can be utilised in other sections if need be. Certain fields such as the `api_type` & `name` have been constructed based on the API it was retrieved from or underlying properties of the feature.

#### 2.3.1.2 - Area Selections

```python
# User subscriptions
class Area_Selections(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    geometry = models.JSONField(null=False, default={"type": "", "coordinates": []})
    title = models.CharField(max_length=255)
    receive_email_notifications = models.IntegerField(null=False, default=0)
    def __str__(self):
        return self.title
```

The area selection is what constitutes a subscription within this app. It is used to save the data of a selection by the user when they wish to subscribe to that area. It is used when allocating notifications by checking whether a hazard is contained within the selected area, and subsequently allocating a notification and, if email notifications are selected, sending an email to the user. This process takes place in the `interactive_map/tasks.py` file. The area selection is used in conjunction with Idempotency keys to create a Notification model (see `2.3.1.4`), which is used in the notifications page and the banner notifications.

#### 2.3.1.3 - Idempotency Keys

```python
class Idempotency_Keys(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    area = models.ForeignKey(Area_Selections, on_delete=models.CASCADE)
    hazard = models.ForeignKey(Disaster, on_delete=models.CASCADE)
    email = models.BooleanField(null=False, default=False)
    creation_date_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.id
```

The idempotency key is used to track which notifications have already been sent in the past so that the same notification is never sent more than once. An idempotency key uses the user, area and hazard related to a notification as foreign keys to ensure it is unique. It also stores the creation date for easier debugging. If any of the objects referred to as a foreign key are deleted, the associated idempotency key is automatically deleted as well.

#### 2.3.1.4 - Notification Model

```python
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='disaster_notifications')
    date = models.CharField(max_length=30, null=False, default="No Date Provided")
    area_name = models.CharField(max_length=100, null=False, default="No Title Provided")
    hazard_type = models.CharField(max_length=100, null=False, default="No Type Provided")
    hazard_severity = models.CharField(max_length=100, null=False, default="No Severity Provided")
    hazard_id = models.IntegerField(null=False, default=0)
    hazard_location = models.CharField(max_length=255, null=False, default="No Location Provided")
    hazard_description = models.CharField(max_length=2000)
```

The notification model is fundamental to how the notifications history page operates. It is essentially a subset of the email notification data with the addition of the user field. As opposed to the email notification, it needs to be saved so that a user can access the past history. The area name is the name of the subscription/area selection, and the hazard severity is a constructed parameter based on the data from the API, the remaining fields are data pulled from the disaster in question or the current user.

### 2.4.0 - Email Notification System

For a visual representation of how the email notification system works, please see `Figure 3`.

Once per day a daily task is triggered by Celery which sends the notifications. The crontab schedule type is used so that the task can be scheduled for a particular time of day. In this case, it has been configured to run at midnight everyday. This is configured in the `web/main/settings.py` file using the following code:

```python
CELERY_BEAT_SCHEDULE = {
    'check-database-condition': {
        'task': 'interactive_map.tasks.hazard_notifications_task',
        'schedule': crontab(hour=0, minute=0),
    },
}
```

Once the task is triggered, it first triggers the `updateHazardsData()` function which is used to pull in the latest hazard data from the APIs into the database. This is done to ensure the user receives notifications based on the most recent data.

Next, the task checks for each area subscription whether or not the associated user has notifications enabled. If the user has enabled notifications, it then checks the geo coordinates of all the active hazards in the database to see which hazards are within the subscribed area. This is calculated using the shapely python package.

If the notification has been sent before, it will be skipped. This is tracked using idempotency keys based on the user id, area id and hazard id.

Once all of the hazards a user needs to be notified of are identified, they are grouped by the subscribed area and appended to a table in an HTML template. This template is used to form the body of the email

- See `Figure 5` for an example of the email generated from the template

The email is then sent to the user and new idempotency keys are generated and saved to the database so that the notifications don't get sent again.

- If an email fails to send initially, that specific failed email will be re-attempted 10 times before throwing an exception.

The email is sent using the pre-existing SMTP server. The host user for the SMTP server is testbot.orefox@gmail.com.

This is repeated for all subscribed areas in the database.

**Note:**
- Currently the emails are being sent to an email specified by the developer in their `.env` file. This can quickly be modified however to send to the actual emails of the users simply by changing the `sendToRealEmails` variable in `tasks.py` from `False` to `True` (see below).
    ```python
    sendToRealEmails = False
    devEmail = os.environ.get('DEV_EMAIL')
    ```

- The email template currently links to [https://orefox.com/](https://orefox.com/) for the notification details page. This will need to be updated to the correct URL.

<img src="https://i.imgur.com/xVRkFaS.png" alt="System Design for Email Notification System" width=80%>

*Figure 3 - System Design for Email Notification System*

<img src="https://i.imgur.com/HCmsMuv.png" alt="Example email" width=80%>


*Figure 5 - Example email*

### 2.5.0 - Web Sockets for Banner Notifications

A web socket was necessary to be able to create the connection for banner notifications to the user. This was originally created under the 'notification' channel name, however after merging with the new code base toward the end of our project, it was necessary to rename it to `disasterNotifcation`. It was noted that their was a new websocket implementation that came with the nw features of the new code base, however due to a lack of time before artefact handover, full integration with this new websocket modelling was not possible, as such it has been left as a separate entity in the `main/consumers.py`, the `main/asagi.py` file has been updated to accept a list of URL's as websockets too:

```python
application = get_asgi_application()

# Define the Channel Layer
channel_layer = get_channel_layer()

application = ProtocolTypeRouter({
    'http': application,
    'websocket': AuthMiddlewareStack(
        URLRouter([
            path("ws/disasterNotification/", disasterConsumers.as_asgi(), name="disasterNotification"),
                path('ws/notification/', notificationConsumers.NotificationConsumer.as_asgi(), name="notification"),
                ]
        )
    ),
})
```

The disaster notification uses the users id as a suffix to the channel name, ensuring that each user retrieves personalised notifications. The event listener for the web socket is housed within the `appboard/base.html` file, see below.

```python
<script>
    $(document).ready(function() {
    const currentLocation = window.location;
    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/disasterNotification/`);
    // Message received event handler
    socket.addEventListener('open', (event) => {
        socket.send(JSON.stringify({"message":"Disaster Notification Socket Open"}))
    });
    socket.addEventListener('message', (event) => {
        if(event.data){
            var data = []
            data= JSON.parse(JSON.parse(event.data).response)
            var notificationBanner = $("#notificationBanner");
            console.log('Message from server:', JSON.parse(JSON.parse(event.data).response));
            if(data.length > 0){
                notificationBanner.removeClass("banner-hide")
                notificationBanner.addClass("banner-show")
                $("#notificationNum").text(data.length)
                setTimeout(() => {
                    notificationBanner.addClass("banner-hide")
                    notificationBanner.removeClass("banner-show")
                }, 4000)
            }
        }
    });
})

</script>
```

The banner notifications are also housed in the appboard/base.html file, see below:

```python
<div class="d-flex w-100" style="margin-left: 15rem">
    <div class="container-fluid m-0 p-0 ">
        <div class=" position-absolute banner-hide banner" id="notificationBanner">
            <div class="row">
                <div class="col-4 d-flex justify-center">
                    <img src="{% static 'website/images/brand/Banner.png' %}" class="img-fluid">
                </div>
                <div class="col-8 text-center d-flex align-items-center">
                    <p class="lead p-0 m-0">
                        You have <span id="notificationNum"></span> new notifications! Please visit the notifications page for more information.
                    </p>
                </div>
            </div>
        </div>
        {% include "appboard/topbar.html" with breadcrumb=breadcrumb %}

        <div class="p-4  h-100">

            {% block content %}
            {% endblock %}
        </div>
    </div>
    <footer class="swiper-slide-shadow-bottom bg-light text-dark footer fixed-bottom" >
        <div class="container ">
            <div class="copyright text-center  py-2">
                <span class="fs-6">Copyright &copy; OreFox 2021</span>
            </div>
        </div>
    </footer>
</div>
```

Once triggered, the banner notification will slide down from the top of the window, showing the user the have x new disaster notifications (See `Figure 6`).

![Banner Notification](https://i.imgur.com/SdgSxVi.png)

*Figure 6 - Example Banner Notification*

## 3.0.0 - Testing

As requested by OreFox, testing for the project has included a mix of manual and automated testing.

### 3.1.0 - Manual Testing

Every feature of the application has been manually tested from start to finish. This includes:

- Selecting an area on the interactive map
- Confirming the icons appear correctly on the map
  - Including popup on hover
- Toggling the icons on and off on the interactive map using the layers menu
- Subscribing to an area
  - Both with and without email notifications enabled
- Visiting the notifications page with the button the navbar
- Toggling email notifications on and off for a subscription
- Unsubscribing from an area
- Viewing the notification history of a subscription
  - Including the button for further details of a specific notification, and
  - The button to view the image of the subscribed area
- Using the back button to return from the notification history page back to the subscription page
- Using the interactive map button on the navbar to return to the interactive map
- Manually running the celery task to trigger the notification workflow
  - Both for email notifications and banner notifications

### 3.2.0 - Unit Tests

The code for this project is separated into many functions. Most functions fall into one of three categories:

1. Reading data from the database or pulling data from APIs,
2. Saving data to the database, or
3. Manipulating the data.

The unit tests written for this project cover all functions that fall into category 3 (manipulating the data).

The majority of the code written for this project is within either:

- `tasks.py`
  - Which is where the logic for the notification system is,
- or `disasters.py`
  - Which is where the logic for the API interaction is.

As all category 3 functions are in `tasks.py`, only `task.py` has been covered by the unit tests. Currently this consists of 20 unit tests which cover 11 separate functions in `tasks.py`.

These unit tests have been written using Django's built-in testing framework, and are contained in the `tests.py` file in the interactive map folder.

As an example, here is a simple function from `tasks.py` that was tested with unit tests:

```python
def emailPreference(request):
    if 'receive_email_notification' not in request.keys():
        return 0
    if request['receive_email_notification'] != "on":
        return 0
    return 1
```

The following unit tests were created to test this function:

```python
def test_email_preference_no_key(self):
    # Test when 'receive_email_notification' is not in request
    request = {}
    result = emailPreference(request)
    self.assertEqual(result, 0)

def test_email_preference_off(self):
    # Test when 'receive_email_notification' is not 'on'
    request = {'receive_email_notification': 'off'}
    result = emailPreference(request)
    self.assertEqual(result, 0)

def test_email_preference_on(self):
    # Test when 'receive_email_notification' is 'on'
    request = {'receive_email_notification': 'on'}
    result = emailPreference(request)
    self.assertEqual(result, 1)
```
