import requests
from dateutil import parser
from disaster_notification_system.models import Disaster
from django.core.cache import cache
import json

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
    
# Hits api and saves data in hazard table - road closures is an issue due to API-key atm
def saveDisasterData():
    saveEscadHazards()
    saveFloodHazards()
    saveRoadData()

def saveEscadHazards():
    try:
        escad = requests.get("https://services1.arcgis.com/vkTwD8kHw2woKBqV/arcgis/rest/services/ESCAD_Current_Incidents_Public/FeatureServer/0/query?f=geojson&where=1%3D1&outFields=*").json()['features']
        
        api_identifiers = {feature["id"] for feature in escad}
        Disaster.objects.filter(api_type="escad").exclude(api_identifier__in=api_identifiers).delete()

        for feature in escad:
            api_identifier = feature["id"]
            name = ""
            if feature["properties"]["Locality"] is not None:
                name = feature["properties"]["Locality"] + ", " + feature["properties"]["GroupedType"]
            else:
                name = "No Locality, " + feature["properties"]["GroupedType"]
            try:
                Disaster.objects.create(
                    api_identifier = api_identifier,
                    api_type = "escad",
                    geometry = feature["geometry"],
                    name = name,
                    dateNum = feature["properties"]["Response_Date"],
                    lastUpdated = feature["properties"]["LastUpdate"],
                    properties = feature['properties']
                ).save()
            except Exception as e:
                print(e)

    except Exception as e:
        print(e)

def saveFloodHazards():
    try:
        floodData = requests.get("https://services1.arcgis.com/vkTwD8kHw2woKBqV/arcgis/rest/services/BOM_Flood_Gauges_Flood_Levels_15_min_update_RO/FeatureServer/0/query?f=geojson&where=1%3D1&outFields=*").json()['features']

        api_identifiers = {feature["id"] for feature in floodData}
        Disaster.objects.filter(api_type="water").exclude(api_identifier__in=api_identifiers).delete()

        for feature in floodData:
            api_identifier = feature["id"]
            if feature["properties"]["Class"] == "No Classification" or feature["properties"]["Class"] == "Below Flood Level":
                        continue
            try:
                Disaster.objects.create(
                    api_identifier = api_identifier,
                    geometry = feature["geometry"],
                    api_type="water",
                    name = feature["properties"]["Name"],
                    dateNum = feature["properties"]["ObservationTime"],
                    lastUpdated = feature["properties"]["FMETimestamp"],
                    properties = feature['properties']).save()
            except Exception as e:
                print(e)
            
    except Exception as e:
        print(e)

def saveRoadData():
    try:
        roadData = requests.get("https://api.qldtraffic.qld.gov.au/v2/events?apikey=yN0UppglBs74ToFh3d9l33DRhuEkrbqc2zEBXsCq").json()['features']
        
        api_identifiers = {feature["properties"]["id"] for feature in roadData}
        Disaster.objects.filter(api_type="roads").exclude(api_identifier__in=api_identifiers).delete()

        for feature in roadData:
            api_identifier = feature["properties"]['id']
            try:
                # Convert datetime to timestamp to fit with other API's
                initialTimeStamp =  round(parser.isoparse(feature["properties"]["duration"]["start"]).timestamp())
                lastUpdatedTimeStamp = round(parser.isoparse(feature["properties"]["last_updated"]).timestamp())

                Disaster.objects.create(
                    api_identifier = api_identifier,
                    geometry = feature["geometry"],
                    api_type="roads",
                    name = feature["properties"]["description"],
                    dateNum = initialTimeStamp,
                    lastUpdated = lastUpdatedTimeStamp,
                    properties = feature['properties']).save()
            except Exception as e:
                print(e)

    except Exception as e:
        print(e)