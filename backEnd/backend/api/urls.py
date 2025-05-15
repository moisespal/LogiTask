from django.urls import path
from . import views



urlpatterns = [
    path("clients/delete/<int:pk>/", views.ClientDelete.as_view(),name="client-note"),
    path("properties/", views.PropertyListCreate.as_view(), name="property-list-create"),
    path("clients/", views.ClientListCreate.as_view(), name="client-list"),
    path("clientPropertySetUp/", views.ClientScheduleSetUp.as_view(), name="client-property-schedule"),
    path("generateJobs/", views.generateTodaysJobs, name='generate-todays-jobs'),
    path("getTodaysJobs/", views.GetTodaysJobs.as_view(), name='job-list' ),
    path("PropertySetup/", views.PropertyListCreateView.as_view(), name='payment-list-create'),
    path("Update-Schedule/<int:pk>/", views.UpdateSchedule.as_view(), name='update-schedule'),
    path('multiple-clientsSetup', views.UploadExcelView.as_view(),name='upload_clients'),
    path('payments/', views.PaymentListCreate.as_view(), name='payment-list-create'),
    path('companySetup/', views.CompanyListCreate.as_view(), name='company-list-create'),
    path('update-company/<int:pk>/', views.CompanyUpdateView.as_view(), name='update-company'),
    path('update-timezone/', views.update_timezone, name='update-timezone'),
    path('schedule-jobs/', views.ScheduleJobsView.as_view(), name='view-schedule-jobs '),
    path('properties-service-info/',views.PropertyServiceInfoView.as_view(),name='view-property-service-info'),
    path('createSchedule/', views.ScheduleCreate.as_view(), name='create-schedule'),
    path('get-balance/', views.update_balance_view.as_view(), name="view-balance"),
    path('job-names/', views.get_unique_jobs, name='unique_job_names'),
    path('update-schedule-status/<int:pk>/',views.UpdateScheduleStatus.as_view(),name='update-schedule-status'),
]