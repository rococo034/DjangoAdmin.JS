from django.contrib import admin
from .models import Category, Product, Customer, Order, OrderItem

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'parent')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)
    autocomplete_fields = ('parent',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'price', 'status', 'category', 'created_at')
    list_filter = ('status', 'category', 'created_at')
    search_fields = ('name', 'sku', 'description')
    list_editable = ('price', 'status')
    autocomplete_fields = ('category',)
    prepopulated_fields = {}
    ordering = ('-created_at',)

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1
    raw_id_fields = ('product',)

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'tier', 'registered_at')
    list_filter = ('tier', 'registered_at')
    search_fields = ('first_name', 'last_name', 'email')
    fieldsets = (
        (None, {
            'fields': ('first_name', 'last_name', 'email', 'phone')
        }),
        ('Extra Info', {
            'classes': ('collapse',),
            'fields': ('tier', 'bio'),
        }),
    )

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'status', 'ordered_at', 'notes')
    list_filter = ('status', 'ordered_at')
    search_fields = ('customer__first_name', 'customer__last_name', 'notes')
    date_hierarchy = 'ordered_at'
    inlines = [OrderItemInline]
    actions = ['mark_as_shipped', 'mark_as_cancelled']

    @admin.action(description="Mark selected orders as Shipped")
    def mark_as_shipped(self, request, queryset):
        queryset.update(status='shipped')

    @admin.action(description="Mark selected orders as Cancelled")
    def mark_as_cancelled(self, request, queryset):
        queryset.update(status='cancelled')
