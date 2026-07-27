import random
import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from store.models import Category, Product, Customer, Order, OrderItem
from management.models import TeamMember, Project, Task

class Command(BaseCommand):
    help = 'Seeds the database with high-quality mock data for testing.'

    def handle(self, *args, **options):
        self.stdout.write('Clearing existing data...')
        OrderItem.objects.all().delete()
        Order.objects.all().delete()
        Customer.objects.all().delete()
        Product.objects.all().delete()
        Category.objects.all().delete()
        Task.objects.all().delete()
        Project.objects.all().delete()
        TeamMember.objects.all().delete()

        self.stdout.write('Seeding Team Members...')
        roles = ['Frontend Dev', 'Backend Dev', 'UI/UX Designer', 'Product Manager', 'QA Specialist', 'DevOps Engineer']
        team_members_data = [
            ('Mario Rossi', 'mario.rossi@example.com'),
            ('Giulia Bianchi', 'giulia.bianchi@example.com'),
            ('Luca Verdi', 'luca.verdi@example.com'),
            ('Francesca Neri', 'francesca.neri@example.com'),
            ('Alessandro Russo', 'alessandro.russo@example.com'),
            ('Elena Gallo', 'elena.gallo@example.com'),
            ('Giovanni Ferrari', 'giovanni.ferrari@example.com'),
            ('Sofia Costa', 'sofia.costa@example.com'),
        ]
        team_members = []
        for name, email in team_members_data:
            member = TeamMember.objects.create(
                name=name,
                role=random.choice(roles),
                email=email
            )
            team_members.append(member)

        self.stdout.write('Seeding Projects...')
        projects_data = [
            ('E-Commerce Redesign', 'Complete redesign of our core storefront with Tailwind and Django.', 150000.00),
            ('Mobile App Launch', 'Developing a native mobile companion app for iOS and Android.', 85000.00),
            ('Cloud Migration', 'Migrating on-premise infrastructure to AWS and ECS.', 120000.00),
            ('Data Warehouse Integration', 'Aggregating sales and system logs into a Snowflake warehouse.', 45000.00),
            ('SEO & Marketing Automation', 'Automating email campaigns and optimizing organic search rankings.', 25000.00),
        ]
        projects = []
        for title, desc, budget in projects_data:
            project = Project.objects.create(
                title=title,
                description=desc,
                budget=budget,
                start_date=timezone.now().date() - datetime.timedelta(days=random.randint(10, 50)),
                end_date=timezone.now().date() + datetime.timedelta(days=random.randint(30, 120)),
                priority=random.choice(['low', 'medium', 'high', 'critical'])
            )
            # Assign random team members
            project.team_members.set(random.sample(team_members, random.randint(2, 5)))
            projects.append(project)

        self.stdout.write('Seeding Tasks...')
        task_names = [
            'Setup boilerplate', 'Design Figma mockups', 'Draft database schema',
            'Configure CI/CD pipelines', 'Setup Docker environment', 'Integrate Auth0',
            'Implement search filters', 'Create payment gateway mock', 'Write unit tests',
            'Perform security audits', 'Draft API documentation', 'Conduct user tests',
            'Optimize loading speed', 'Configure CDN assets', 'Analyze database indexes'
        ]
        for project in projects:
            for _ in range(random.randint(5, 10)):
                Task.objects.create(
                    project=project,
                    name=random.choice(task_names) + f" ({project.title})",
                    assignee=random.choice(project.team_members.all()),
                    due_date=timezone.now().date() + datetime.timedelta(days=random.randint(-5, 45)),
                    status=random.choice(['todo', 'in_progress', 'done']),
                    points=random.choice([1, 2, 3, 5, 8])
                )

        self.stdout.write('Seeding Categories...')
        categories_data = ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports & Outdoors']
        categories = []
        for name in categories_data:
            cat = Category.objects.create(
                name=name,
                slug=name.lower().replace(' & ', '-').replace(' ', '-')
            )
            categories.append(cat)

        self.stdout.write('Seeding Products...')
        products_data = [
            ('iPhone 15 Pro', 999.99, 'Electronics', 'IPHONE15P'),
            ('MacBook Pro M3', 1999.99, 'Electronics', 'MACBOOKM3'),
            ('Bluetooth Headphones', 149.99, 'Electronics', 'BTHEAD'),
            ('Leather Jacket', 249.99, 'Clothing', 'LTHRJKT'),
            ('Slim Fit Jeans', 59.99, 'Clothing', 'SLMFITJN'),
            ('Running Shoes', 89.99, 'Sports & Outdoors', 'RUNSHOE'),
            ('Yoga Mat', 29.99, 'Sports & Outdoors', 'YOGMAT'),
            ('Chef Knife', 79.99, 'Home & Kitchen', 'CHFKNIF'),
            ('Coffee Maker', 119.99, 'Home & Kitchen', 'COFMKR'),
            ('Python Deep Learning Book', 49.99, 'Books', 'PYDLBOOK'),
            ('The Great Gatsby', 14.99, 'Books', 'GRTGATSB'),
        ]
        products = []
        for name, price, cat_name, sku in products_data:
            cat = next(c for c in categories if c.name == cat_name)
            prod = Product.objects.create(
                name=name,
                sku=sku + str(random.randint(100, 999)),
                price=price,
                description=f"High quality {name.lower()} with standard warranty and fast shipping.",
                status=random.choice(['active', 'active', 'draft']),
                category=cat
            )
            products.append(prod)

        self.stdout.write('Seeding Customers...')
        customers_data = [
            ('Andrea', 'Martini', 'andrea.martini@example.com'),
            ('Chiara', 'Lombardi', 'chiara.lombardi@example.com'),
            ('Matteo', 'Serra', 'matteo.serra@example.com'),
            ('Silvia', 'Gatti', 'silvia.gatti@example.com'),
            ('Filippo', 'Fontana', 'filippo.fontana@example.com'),
            ('Martina', 'Moretti', 'martina.moretti@example.com'),
            ('Davide', 'Marini', 'davide.marini@example.com'),
            ('Giorgia', 'Rizzo', 'giorgia.rizzo@example.com'),
        ]
        customers = []
        for first, last, email in customers_data:
            cust = Customer.objects.create(
                first_name=first,
                last_name=last,
                email=email,
                phone=f"+39 333 {random.randint(1000000, 9999999)}",
                tier=random.choice(['free', 'bronze', 'silver', 'gold']),
                bio=f"Passionate user and customer of DjangoAdmin.JS store since {random.randint(2022, 2026)}."
            )
            customers.append(cust)

        self.stdout.write('Seeding Orders and Items...')
        order_notes = ['Please deliver after 6 PM', 'Gift wrap requested', '', 'Leave at the front desk', 'Fragile item']
        for _ in range(25):
            cust = random.choice(customers)
            order = Order.objects.create(
                customer=cust,
                status=random.choice(['pending', 'shipped', 'delivered', 'cancelled']),
                notes=random.choice(order_notes)
            )
            # Add 1 to 4 random products to each order
            order_prods = random.sample(products, random.randint(1, 4))
            for prod in order_prods:
                qty = random.randint(1, 3)
                OrderItem.objects.create(
                    order=order,
                    product=prod,
                    quantity=qty,
                    price=prod.price,
                    discount=random.choice([0.00, 0.00, 0.00, 5.00, 10.00]),
                    tax_rate=0.22,
                    shipping_cost=random.choice([0.00, 4.90, 9.90]),
                    estimated_delivery=timezone.now().date() + datetime.timedelta(days=random.randint(2, 7)),
                    warehouse_location=f"Aisle {random.randint(1, 10)}-Shelf {random.choice(['A', 'B', 'C', 'D'])}"
                )

        self.stdout.write(self.style.SUCCESS('Successfully seeded database with mock data!'))
