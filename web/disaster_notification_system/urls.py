from django.urls import path
from . import views

app_name = "disaster_notification_system"

urlpatterns = [
    # interactive map
    path('', views.disaster_notification_system, name = 'home'),
    
    # Polygon Data
    path('get/tenements/', views.get_tenements_json, name = 'get_tenements_json'),
    path('cadastre/', views.get_cadastre, name = 'cadastre'),
    # links to data of each map layer
    # path('pending/', views.pending_json, name = 'pending_application'),
    path('active/', views.active_json, name = 'active_application'),
    path('reaching/', views.reaching_moratorium_json, name = 'reaching_moratorium'),
    path('moratorium/', views.moratorium_json, name = 'moratorium'),
    path('disasters/', views.disaster_json, name = 'disasters'),
    path('render-email/', views.render_email_template, name='render_email'),
    path('subscribe_to_area/', views.subscribe_to_area, name='subscribe_to_area'),
    
]