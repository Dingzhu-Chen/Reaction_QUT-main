from django.test import TestCase
from shapely.geometry import Point, Polygon
from .tasks import emailPreference, geoCoordsMissing, generateResponse, titleMissing, process_escad_hazard, process_roads_hazard, process_water_hazard, process_hazard, formattedDate, hazardInArea, emailContext
from user.models import User

class NotificationSystemTestCases(TestCase):
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
    
    def test_geo_coords_missing_no_key(self):
        # Test when 'map_selection' key is not in request
        request = {}
        result = geoCoordsMissing(request)
        self.assertTrue(result)

    def test_geo_coords_missing_empty_value(self):
        # Test when 'map_selection' key is present but has an empty value
        request = {'map_selection': ''}
        result = geoCoordsMissing(request)
        self.assertTrue(result)

    def test_geo_coords_missing_present_value(self):
        # Test when 'map_selection' key is present with a non-empty value
        request = {'map_selection': 'some_value'}
        result = geoCoordsMissing(request)
        self.assertFalse(result)

    def test_generate_response(self):
        # Test the generateResponse function
        message = 'Sample message'
        status = 200
        expected_result = {'message': message, 'status': status}
        result = generateResponse(message, status)
        self.assertEqual(result, expected_result)

    def test_title_missing_no_key(self):
        # Test when 'title' key is not in request
        request = {}
        result = titleMissing(request)
        self.assertTrue(result)

    def test_title_missing_empty_value(self):
        # Test when 'title' key is present but has an empty value
        request = {'title': ''}
        result = titleMissing(request)
        self.assertTrue(result)

    def test_title_missing_present_value(self):
        # Test when 'title' key is present with a non-empty value
        request = {'title': 'Sample Title'}
        result = titleMissing(request)
        self.assertFalse(result)
    def test_process_escad_hazard(self):
        hazard_data = {
            "properties": {
                "VehiclesAssigned": 1,
                "VehiclesOnScene": 1,
                "VehiclesOnRoute": 1,
                "GroupedType": "Some Type",
                "Location": "Location Name"
            },
            "geometry": {
                "coordinates": [0.0, 0.0]
            }
        }
        hazard = DummyHazard("escad", hazard_data)
        severity, hazardType, location, description = process_escad_hazard(hazard)
        self.assertEqual(severity, "Moderate")
        self.assertEqual(hazardType, "Some Type")
        self.assertEqual(location, "Location Name : 0.0,0.0")
        self.assertEqual(description, "Emergency Services Computer Aided Dispatch Warnings")

    def test_process_water_hazard(self):
        hazard_data = {
            "properties": {
                "Class": "High",
                "Stream": "Some Stream"
            },
            "name": "Location Name",
            "geometry": {
                "coordinates": [0.0, 0.0]
            }
        }
        hazard = DummyHazard("water", hazard_data)
        severity, hazardType, location, description = process_water_hazard(hazard)
        self.assertEqual(severity, "High")
        self.assertEqual(hazardType, "Water Level Warning")
        self.assertEqual(location, "Location Name Some Stream : 0.0, 0.0")
        self.assertEqual(description, "Water Level Gauge")

    def test_process_roads_hazard(self):
        hazard_data = {
            "properties": {
                "impact": {
                    "impact_type": "High",
                    "direction": "North"
                },
                "description": "Road hazard description",
                "information": "Additional information",
                "road_summary": {
                    "road_name": "Some Road",
                    "locality": "Some Locality",
                    "postcode": "12345"
                },
                "event_type": "Hazard"
            },
            "geometry": {
                "coordinates": [0.0, 0.0]
            }
        }
        hazard = DummyHazard("roads", hazard_data)
        severity, hazardType, location, description = process_roads_hazard(hazard)
        self.assertEqual(severity, "High - North")
        self.assertEqual(hazardType, "Road Hazard")
        self.assertEqual(location, "Some Road Some Locality 12345")
        self.assertEqual(description, "Road hazard description - Additional information")

    def test_process_hazard_escad(self):
        hazard_data = {
            "properties": {
                "VehiclesAssigned": 1,
                "VehiclesOnScene": 1,
                "VehiclesOnRoute": 1,
                "GroupedType": "Some Type",
                "Location": "Location Name"
            },
            "geometry": {
                "coordinates": [0.0, 0.0]
            }
        }
        hazard = DummyHazard("escad", hazard_data)
        severity, hazardType, location, description = process_hazard(hazard)
        self.assertEqual(severity, "Moderate")
        self.assertEqual(hazardType, "Some Type")
        self.assertEqual(location, "Location Name : 0.0,0.0")
        self.assertEqual(description, "Emergency Services Computer Aided Dispatch Warnings")

    def test_process_hazard_water(self):
        hazard_data = {
            "properties": {
                "Class": "High",
                "Stream": "Some Stream"
            },
            "name": "Location Name",
            "geometry": {
                "coordinates": [0.0, 0.0]
            }
        }
        hazard = DummyHazard("water", hazard_data)
        severity, hazardType, location, description = process_hazard(hazard)
        self.assertEqual(severity, "High")
        self.assertEqual(hazardType, "Water Level Warning")
        self.assertEqual(location, "Location Name Some Stream : 0.0, 0.0")
        self.assertEqual(description, "Water Level Gauge")

    def test_process_hazard_roads(self):
        hazard_data = {
            "properties": {
                "impact": {
                    "impact_type": "High",
                    "direction": "North"
                },
                "description": "Road hazard description",
                "information": "Additional information",
                "road_summary": {
                    "road_name": "Some Road",
                    "locality": "Some Locality",
                    "postcode": "12345"
                },
                "event_type": "Hazard"
            },
            "geometry": {
                "coordinates": [0.0, 0.0]
            }
        }
        hazard = DummyHazard("roads", hazard_data)
        severity, hazardType, location, description = process_hazard(hazard)
        self.assertEqual(severity, "High - North")
        self.assertEqual(hazardType, "Road Hazard")
        self.assertEqual(location, "Some Road Some Locality 12345")
        self.assertEqual(description, "Road hazard description - Additional information")
    
    def test_formatted_date(self):
        hazard_data = {
            "properties": {
                "Class": "High",
                "Stream": "Some Stream"
            },
            "name": "Location Name",
            "geometry": {
                "coordinates": [0.0, 0.0]
            },
            "dateNum": 1634898000000
        }
        hazard = DummyHazard("water", hazard_data)
        # Test the formattedDate function
        hazard = DummyHazard(api_type="example", data=hazard_data)
        formatted_date = formattedDate(hazard)
        self.assertEqual(formatted_date, "22-10-2021")

    def test_hazard_in_area_true(self):
        # Test when hazard is within the area
        hazard_geometry = Point(1, 1)  # Adjust the coordinates as needed
        area_geometry = Polygon([(0, 0), (0, 2), (2, 2), (2, 0)])
        result = hazardInArea(hazard_geometry, area_geometry)
        self.assertTrue(result)

    def test_hazard_in_area_false(self):
        # Test when hazard is outside the area
        hazard_geometry = Point(3, 3)  # Adjust the coordinates as needed
        area_geometry = Polygon([(0, 0), (0, 2), (2, 2), (2, 0)])
        result = hazardInArea(hazard_geometry, area_geometry)
        self.assertFalse(result)
    
    def test_email_context(self):
        # Create a user instance for testing
        user = User.objects.create(username="testuser", first_name="John")

        # Define sample data
        data = ["hazard1", "hazard2", "hazard3"]

        # Call the emailContext function
        context = emailContext(user, data)

        # Define the expected context dictionary
        expected_context = {
            'email_subject': 'Natural Disaster Notifications',
            'recipient_name': 'John',
            'hazards': ["hazard1", "hazard2", "hazard3"],
        }

        # Check if the actual context matches the expected context
        self.assertEqual(context, expected_context)

# Dummy class to represent hazard data structure
class DummyHazard:
    def __init__(self, api_type, data):
        self.api_type = api_type
        self.properties = data["properties"]
        self.geometry = {
            "coordinates": data["geometry"]["coordinates"]
        }
        self.dateNum = data.get("dateNum", 0)
        if "name" in data:
            self.name = data["name"]
