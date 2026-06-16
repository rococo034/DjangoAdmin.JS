from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subcategories')

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Product(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('archived', 'Archived'),
    ]
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=50, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    image = models.FileField(upload_to='products/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"{self.name} ({self.sku})"

class Customer(models.Model):
    TIER_CHOICES = [
        ('free', 'Free User'),
        ('bronze', 'Bronze Member'),
        ('silver', 'Silver Member'),
        ('gold', 'Gold VIP'),
    ]
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, blank=True)
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, default='free')
    bio = models.TextField(blank=True)
    registered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    ordered_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Order #{self.id} - {self.customer}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price at purchase time")
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    notes = models.CharField(max_length=255, blank=True)
    tracking_number = models.CharField(max_length=100, blank=True)
    is_gift = models.BooleanField(default=False)
    gift_message = models.TextField(blank=True)
    tax_rate = models.DecimalField(max_digits=4, decimal_places=2, default=0.22)
    shipping_cost = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    estimated_delivery = models.DateField(null=True, blank=True)
    supplier_code = models.CharField(max_length=100, blank=True)
    warehouse_location = models.CharField(max_length=50, blank=True)
    serial_number = models.CharField(max_length=100, blank=True)
    refunded = models.BooleanField(default=False)
    return_reason = models.TextField(blank=True)

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"
