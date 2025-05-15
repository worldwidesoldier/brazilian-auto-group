const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// In-memory database for cars (replace with real database in production)
let cars = [
    {
        id: 1,
        name: "2023 Toyota Camry",
        price: 28990,
        year: 2023,
        image: "https://images.unsplash.com/photo-1617469767053-3c4f2a7c37e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        description: "Excellent condition, low mileage, one owner",
        features: ["Automatic", "4 Cylinder", "Gas", "FWD"]
    },
    {
        id: 2,
        name: "2022 Honda Accord",
        price: 26990,
        year: 2022,
        image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        description: "Well maintained, clean history, great fuel economy",
        features: ["Automatic", "4 Cylinder", "Hybrid", "FWD"]
    },
    {
        id: 3,
        name: "2023 Ford Mustang",
        price: 35990,
        year: 2023,
        image: "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        description: "Powerful V8 engine, premium interior, sport package",
        features: ["Automatic", "V8", "Gas", "RWD"]
    }
];

// API Routes
app.get('/api/cars', (req, res) => {
    res.json(cars);
});

app.get('/api/cars/featured', (req, res) => {
    res.json(cars.slice(0, 3)); // Return first 3 cars as featured
});

app.get('/api/cars/:id', (req, res) => {
    const car = cars.find(c => c.id === parseInt(req.params.id));
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json(car);
});

// Admin routes
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    // Simple authentication (replace with proper auth in production)
    if (username === 'admin' && password === 'admin123') {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.post('/api/admin/cars', (req, res) => {
    const newCar = {
        id: cars.length + 1,
        ...req.body
    };
    cars.push(newCar);
    res.status(201).json(newCar);
});

app.put('/api/admin/cars/:id', (req, res) => {
    const car = cars.find(c => c.id === parseInt(req.params.id));
    if (!car) return res.status(404).json({ message: 'Car not found' });
    
    Object.assign(car, req.body);
    res.json(car);
});

app.delete('/api/admin/cars/:id', (req, res) => {
    const index = cars.findIndex(c => c.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ message: 'Car not found' });
    
    cars.splice(index, 1);
    res.status(204).send();
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Brazilian Auto Group - Independent Dealer</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'primary': '#1B4332',    // Dark green
                        'secondary': '#40916C',  // Light green
                        'accent': '#2D6A4F',     // Medium green
                    },
                    fontFamily: {
                        'sans': ['Inter', 'sans-serif'],
                    },
                }
            }
        }
    </script>
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-lg fixed w-full z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <a href="/" class="flex items-center">
                        <svg class="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path>
                        </svg>
                        <span class="ml-2 text-xl font-bold text-primary">Brazilian Auto Group</span>
                    </a>
                </div>
                <div class="hidden md:flex items-center space-x-8">
                    <a href="/" class="text-gray-700 hover:text-primary">Home</a>
                    <a href="/cars" class="text-gray-700 hover:text-primary">Cars</a>
                    <a href="/about" class="text-gray-700 hover:text-primary">About</a>
                    <a href="/contact" class="text-gray-700 hover:text-primary">Contact</a>
                </div>
                <div class="md:hidden flex items-center">
                    <button class="mobile-menu-button">
                        <svg class="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <!-- Mobile Menu -->
        <div class="hidden md:hidden mobile-menu bg-white border-t">
            <div class="px-2 pt-2 pb-3 space-y-1">
                <a href="/" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">Home</a>
                <a href="/cars" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">Cars</a>
                <a href="/about" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">About</a>
                <a href="/contact" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">Contact</a>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-24 pb-12 bg-gradient-to-r from-primary to-secondary">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <h1 class="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                    <span class="block">Premium Cars</span>
                    <span class="block text-secondary-200">Rent & Buy</span>
                </h1>
                <p class="mt-3 max-w-md mx-auto text-base text-white sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                    Your trusted independent dealer in New Jersey. Experience personalized service and premium vehicles.
                </p>
                <div class="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                    <div class="rounded-md shadow">
                        <a href="/cars" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                            View Inventory
                        </a>
                    </div>
                    <div class="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                        <a href="https://wa.me/19733938674" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-secondary hover:bg-secondary-600 md:py-4 md:text-lg md:px-10">
                            Contact Us
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Featured Cars Section -->
    <section class="py-12 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-extrabold text-gray-900 text-center mb-8">Featured Vehicles</h2>
            <div id="featured-cars" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <!-- Cars will be loaded dynamically via JavaScript -->
            </div>
        </div>
    </section>

    <!-- Why Choose Us Section -->
    <section class="py-12 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-extrabold text-gray-900 text-center mb-8">Why Choose Brazilian Auto Group?</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="text-center">
                    <div class="bg-white p-6 rounded-lg shadow-lg">
                        <svg class="h-12 w-12 text-primary mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h3 class="mt-4 text-xl font-semibold text-gray-900">Personalized Service</h3>
                        <p class="mt-2 text-gray-600">Direct attention and customized solutions for your needs.</p>
                    </div>
                </div>
                <div class="text-center">
                    <div class="bg-white p-6 rounded-lg shadow-lg">
                        <svg class="h-12 w-12 text-primary mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                        <h3 class="mt-4 text-xl font-semibold text-gray-900">Trust & Reliability</h3>
                        <p class="mt-2 text-gray-600">Independent dealer with transparent and honest service.</p>
                    </div>
                </div>
                <div class="text-center">
                    <div class="bg-white p-6 rounded-lg shadow-lg">
                        <svg class="h-12 w-12 text-primary mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                        <h3 class="mt-4 text-xl font-semibold text-gray-900">Premium Selection</h3>
                        <p class="mt-2 text-gray-600">Carefully selected vehicles for rent and purchase.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-primary text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <h3 class="text-xl font-bold mb-4">Brazilian Auto Group</h3>
                    <p class="text-gray-300">Independent Dealer</p>
                </div>
                <div>
                    <h3 class="text-xl font-bold mb-4">Contact</h3>
                    <p class="text-gray-300">Phone: +1 (973) 393-8674</p>
                    <a href="https://wa.me/19733938674" class="text-gray-300 hover:text-white">WhatsApp</a>
                </div>
                <div>
                    <h3 class="text-xl font-bold mb-4">Location</h3>
                    <p class="text-gray-300">New Jersey, USA</p>
                </div>
            </div>
            <div class="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
                <p>&copy; 2024 Brazilian Auto Group. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script>
        // Mobile menu toggle
        document.querySelector('.mobile-menu-button').addEventListener('click', function() {
            const mobileMenu = document.querySelector('.mobile-menu');
            mobileMenu.classList.toggle('hidden');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const mobileMenu = document.querySelector('.mobile-menu');
            const mobileMenuButton = document.querySelector('.mobile-menu-button');
            
            if (!mobileMenu.contains(event.target) && !mobileMenuButton.contains(event.target)) {
                mobileMenu.classList.add('hidden');
            }
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
                document.querySelector('.mobile-menu').classList.add('hidden');
            });
        });

        // Fetch featured cars
        async function loadFeaturedCars() {
            try {
                const response = await fetch('/api/cars/featured');
                const cars = await response.json();
                const carsContainer = document.getElementById('featured-cars');
                
                cars.forEach(car => {
                    const carCard = `
                        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                            <img src="${car.image}" alt="${car.name}" class="w-full h-48 object-cover">
                            <div class="p-4">
                                <h3 class="text-xl font-semibold text-gray-900">${car.name}</h3>
                                <p class="text-primary font-bold mt-2">$${car.price.toLocaleString()}</p>
                                <div class="mt-4 flex justify-between items-center">
                                    <span class="text-gray-600">${car.year}</span>
                                    <a href="/car/${car.id}" class="text-primary hover:text-secondary">View Details</a>
                                </div>
                            </div>
                        </div>
                    `;
                    carsContainer.innerHTML += carCard;
                });
            } catch (error) {
                console.error('Error loading featured cars:', error);
            }
        }

        // Load featured cars when the page loads
        document.addEventListener('DOMContentLoaded', loadFeaturedCars);
    </script>
</body>
</html>
    `);
});

// Serve the cars page
app.get('/cars', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cars - Brazilian Auto Group</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'primary': '#1B4332',
                        'secondary': '#40916C',
                        'accent': '#2D6A4F',
                    },
                    fontFamily: {
                        'sans': ['Inter', 'sans-serif'],
                    },
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50">
    <!-- Navigation (same as index.html) -->
    <nav class="bg-white shadow-lg fixed w-full z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <a href="/" class="flex items-center">
                        <svg class="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path>
                        </svg>
                        <span class="ml-2 text-xl font-bold text-primary">Brazilian Auto Group</span>
                    </a>
                </div>
                <div class="hidden md:flex items-center space-x-8">
                    <a href="/" class="text-gray-700 hover:text-primary">Home</a>
                    <a href="/cars" class="text-gray-700 hover:text-primary">Cars</a>
                    <a href="/about" class="text-gray-700 hover:text-primary">About</a>
                    <a href="/contact" class="text-gray-700 hover:text-primary">Contact</a>
                </div>
                <div class="md:hidden flex items-center">
                    <button class="mobile-menu-button">
                        <svg class="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <!-- Mobile Menu -->
        <div class="hidden md:hidden mobile-menu bg-white border-t">
            <div class="px-2 pt-2 pb-3 space-y-1">
                <a href="/" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">Home</a>
                <a href="/cars" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">Cars</a>
                <a href="/about" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">About</a>
                <a href="/contact" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">Contact</a>
            </div>
        </div>
    </nav>

    <!-- Cars Listing -->
    <div class="pt-24 pb-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 class="text-3xl font-extrabold text-gray-900 mb-8">Our Inventory</h1>
            <div id="cars-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <!-- Cars will be loaded dynamically -->
            </div>
        </div>
    </div>

    <script>
        // Mobile menu toggle
        document.querySelector('.mobile-menu-button').addEventListener('click', function() {
            const mobileMenu = document.querySelector('.mobile-menu');
            mobileMenu.classList.toggle('hidden');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const mobileMenu = document.querySelector('.mobile-menu');
            const mobileMenuButton = document.querySelector('.mobile-menu-button');
            
            if (!mobileMenu.contains(event.target) && !mobileMenuButton.contains(event.target)) {
                mobileMenu.classList.add('hidden');
            }
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
                document.querySelector('.mobile-menu').classList.add('hidden');
            });
        });

        async function loadCars() {
            try {
                const response = await fetch('/api/cars');
                const cars = await response.json();
                const carsContainer = document.getElementById('cars-grid');
                
                cars.forEach(car => {
                    const carCard = `
                        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                            <img src="${car.image}" alt="${car.name}" class="w-full h-48 object-cover">
                            <div class="p-4">
                                <h3 class="text-xl font-semibold text-gray-900">${car.name}</h3>
                                <p class="text-primary font-bold mt-2">$${car.price.toLocaleString()}</p>
                                <div class="mt-4 flex justify-between items-center">
                                    <span class="text-gray-600">${car.year}</span>
                                    <a href="/car/${car.id}" class="text-primary hover:text-secondary">View Details</a>
                                </div>
                            </div>
                        </div>
                    `;
                    carsContainer.innerHTML += carCard;
                });
            } catch (error) {
                console.error('Error loading cars:', error);
            }
        }

        document.addEventListener('DOMContentLoaded', loadCars);
    </script>
</body>
</html>
    `);
});

// Serve the car details page
app.get('/car/:id', (req, res) => {
    const car = cars.find(c => c.id === parseInt(req.params.id));
    if (!car) {
        return res.status(404).send('Car not found');
    }

    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${car.name} - Brazilian Auto Group</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'primary': '#1B4332',
                        'secondary': '#40916C',
                        'accent': '#2D6A4F',
                    },
                    fontFamily: {
                        'sans': ['Inter', 'sans-serif'],
                    },
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50">
    <!-- Navigation (same as index.html) -->
    <nav class="bg-white shadow-lg fixed w-full z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <a href="/" class="flex items-center">
                        <svg class="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path>
                        </svg>
                        <span class="ml-2 text-xl font-bold text-primary">Brazilian Auto Group</span>
                    </a>
                </div>
                <div class="hidden md:flex items-center space-x-8">
                    <a href="/" class="text-gray-700 hover:text-primary">Home</a>
                    <a href="/cars" class="text-gray-700 hover:text-primary">Cars</a>
                    <a href="/about" class="text-gray-700 hover:text-primary">About</a>
                    <a href="/contact" class="text-gray-700 hover:text-primary">Contact</a>
                </div>
                <div class="md:hidden flex items-center">
                    <button class="mobile-menu-button">
                        <svg class="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <!-- Mobile Menu -->
        <div class="hidden md:hidden mobile-menu bg-white border-t">
            <div class="px-2 pt-2 pb-3 space-y-1">
                <a href="/" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">Home</a>
                <a href="/cars" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">Cars</a>
                <a href="/about" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">About</a>
                <a href="/contact" class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">Contact</a>
            </div>
        </div>
    </nav>

    <!-- Car Details -->
    <div class="pt-24 pb-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                <img src="${car.image}" alt="${car.name}" class="w-full h-96 object-cover">
                <div class="p-6">
                    <h1 class="text-3xl font-bold text-gray-900">${car.name}</h1>
                    <p class="text-2xl text-primary font-bold mt-2">$${car.price.toLocaleString()}</p>
                    <p class="text-gray-600 mt-4">${car.description}</p>
                    
                    <div class="mt-6">
                        <h2 class="text-xl font-semibold text-gray-900">Features</h2>
                        <ul class="mt-2 grid grid-cols-2 gap-2">
                            ${car.features.map(feature => `
                                <li class="flex items-center text-gray-600">
                                    <svg class="h-5 w-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    ${feature}
                                </li>
                            `).join('')}
                        </ul>
                    </div>

                    <div class="mt-8">
                        <a href="https://wa.me/19733938674" class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-secondary">
                            Contact via WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Mobile menu toggle
        document.querySelector('.mobile-menu-button').addEventListener('click', function() {
            const mobileMenu = document.querySelector('.mobile-menu');
            mobileMenu.classList.toggle('hidden');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const mobileMenu = document.querySelector('.mobile-menu');
            const mobileMenuButton = document.querySelector('.mobile-menu-button');
            
            if (!mobileMenu.contains(event.target) && !mobileMenuButton.contains(event.target)) {
                mobileMenu.classList.add('hidden');
            }
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
                document.querySelector('.mobile-menu').classList.add('hidden');
            });
        });
    </script>
</body>
</html>
    `);
});

// Admin panel route
app.get('/admin', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - Brazilian Auto Group</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'primary': '#1B4332',
                        'secondary': '#40916C',
                        'accent': '#2D6A4F',
                    },
                    fontFamily: {
                        'sans': ['Inter', 'sans-serif'],
                    },
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Admin Login
                </h2>
            </div>
            <form id="login-form" class="mt-8 space-y-6">
                <div class="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label for="username" class="sr-only">Username</label>
                        <input id="username" name="username" type="text" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Username">
                    </div>
                    <div>
                        <label for="password" class="sr-only">Password</label>
                        <input id="password" name="password" type="password" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Password">
                    </div>
                </div>

                <div>
                    <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                        Sign in
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script>
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();
                if (data.success) {
                    window.location.href = '/admin/dashboard';
                } else {
                    alert('Invalid credentials');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred');
            }
        });
    </script>
</body>
</html>
    `);
});

// Admin dashboard route
app.get('/admin/dashboard', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Brazilian Auto Group</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'primary': '#1B4332',
                        'secondary': '#40916C',
                        'accent': '#2D6A4F',
                    },
                    fontFamily: {
                        'sans': ['Inter', 'sans-serif'],
                    },
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen">
        <nav class="bg-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <h1 class="text-xl font-bold text-primary">Admin Dashboard</h1>
                    </div>
                    <div class="flex items-center">
                        <button id="add-car-btn" class="bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary">
                            Add New Car
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div class="px-4 py-6 sm:px-0">
                <div id="cars-list" class="grid grid-cols-1 gap-6">
                    <!-- Cars will be loaded dynamically -->
                </div>
            </div>
        </main>
    </div>

    <!-- Add/Edit Car Modal -->
    <div id="car-modal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3">
                <h3 class="text-lg font-medium text-gray-900" id="modal-title">Add New Car</h3>
                <form id="car-form" class="mt-4">
                    <div class="mt-2 px-7 py-3">
                        <input type="text" id="car-name" placeholder="Car Name" class="w-full px-3 py-2 border rounded-md mb-3">
                        <input type="number" id="car-price" placeholder="Price" class="w-full px-3 py-2 border rounded-md mb-3">
                        <input type="number" id="car-year" placeholder="Year" class="w-full px-3 py-2 border rounded-md mb-3">
                        <input type="text" id="car-image" placeholder="Image URL" class="w-full px-3 py-2 border rounded-md mb-3">
                        <textarea id="car-description" placeholder="Description" class="w-full px-3 py-2 border rounded-md mb-3"></textarea>
                        <input type="text" id="car-features" placeholder="Features (comma-separated)" class="w-full px-3 py-2 border rounded-md">
                    </div>
                    <div class="flex justify-end mt-4">
                        <button type="button" id="cancel-btn" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md mr-2">Cancel</button>
                        <button type="submit" class="px-4 py-2 bg-primary text-white rounded-md">Save</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script>
        // Load cars
        async function loadCars() {
            try {
                const response = await fetch('/api/cars');
                const cars = await response.json();
                const carsContainer = document.getElementById('cars-list');
                
                carsContainer.innerHTML = cars.map(car => `
                    <div class="bg-white shadow rounded-lg p-6">
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900">${car.name}</h3>
                                <p class="text-primary font-bold">$${car.price.toLocaleString()}</p>
                                <p class="text-gray-600">${car.year}</p>
                            </div>
                            <div class="flex space-x-2">
                                <button onclick="editCar(${car.id})" class="text-primary hover:text-secondary">Edit</button>
                                <button onclick="deleteCar(${car.id})" class="text-red-600 hover:text-red-800">Delete</button>
                            </div>
                        </div>
                    </div>
                `).join('');
            } catch (error) {
                console.error('Error loading cars:', error);
            }
        }

        // Modal handling
        const modal = document.getElementById('car-modal');
        const addCarBtn = document.getElementById('add-car-btn');
        const cancelBtn = document.getElementById('cancel-btn');
        const carForm = document.getElementById('car-form');

        addCarBtn.addEventListener('click', () => {
            document.getElementById('modal-title').textContent = 'Add New Car';
            carForm.reset();
            modal.classList.remove('hidden');
        });

        cancelBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        // Form submission
        carForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const carData = {
                name: document.getElementById('car-name').value,
                price: parseInt(document.getElementById('car-price').value),
                year: parseInt(document.getElementById('car-year').value),
                image: document.getElementById('car-image').value,
                description: document.getElementById('car-description').value,
                features: document.getElementById('car-features').value.split(',').map(f => f.trim())
            };

            try {
                const response = await fetch('/api/admin/cars', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(carData),
                });

                if (response.ok) {
                    modal.classList.add('hidden');
                    loadCars();
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });

        // Delete car
        async function deleteCar(id) {
            if (confirm('Are you sure you want to delete this car?')) {
                try {
                    const response = await fetch('/api/admin/cars/' + id, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        loadCars();
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        }

        // Load cars when the page loads
        document.addEventListener('DOMContentLoaded', loadCars);
    </script>
</body>
</html>
    `);
});

// Start the server
app.listen(port, () => {
    console.log(\`Server running at http://localhost:\${port}\`);
}); 