from django.contrib import admin
from .models import TeamMember, Project, Task

@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'email')
    search_fields = ('name', 'role', 'email')

class TaskInline(admin.StackedInline):
    model = Task
    extra = 1
    autocomplete_fields = ('assignee',)

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'budget', 'start_date', 'end_date', 'priority')
    list_filter = ('priority', 'start_date')
    search_fields = ('title', 'description')
    filter_horizontal = ('team_members',)
    inlines = [TaskInline]

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('name', 'project', 'assignee', 'due_date', 'status', 'points')
    list_filter = ('status', 'due_date', 'project')
    list_editable = ('status', 'assignee')
    search_fields = ('name', 'assignee__name')
    autocomplete_fields = ('assignee', 'project')
