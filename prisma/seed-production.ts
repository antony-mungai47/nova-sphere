import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  // Electronics
  {
    name: 'Nova Sound Pro Wireless Earbuds',
    description: 'Experience studio-quality audio with active noise cancellation and a 30-hour battery life. Designed for audiophiles on the go, these earbuds feature custom-tuned 11mm dynamic drivers, water resistance, and a premium charging case. The ergonomic fit ensures comfort during long listening sessions.',
    price: 149.99, salePrice: 129.99, sku: 'NS-ELEC-001', category: 'Electronics', brand: 'NovaAudio', stock: 120, isTrending: true, rating: 4.8, reviewCount: 1245,
    specs: JSON.stringify({ Driver: '11mm Dynamic', Battery: '30h total', Connectivity: 'Bluetooth 5.3', ANC: 'Hybrid' }),
    features: JSON.stringify(['Active Noise Cancellation', 'Transparency Mode', 'Multipoint Connection']),
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'EchoBeat Sport Earbuds',
    description: 'Sweat-proof wireless earbuds built for the toughest workouts. Featuring secure ear hooks, punchy bass, and an IPX7 rating to withstand intense training. The 15-hour playback keeps your motivation high through the longest sessions.',
    price: 89.99, salePrice: null, sku: 'NS-ELEC-002', category: 'Electronics', brand: 'EchoBeat', stock: 85, isTrending: false, rating: 4.5, reviewCount: 840,
    specs: JSON.stringify({ Driver: '9mm', Battery: '15h', Waterproof: 'IPX7', Fit: 'Ear Hook' }),
    features: JSON.stringify(['Sweat and Water Resistant', 'Secure Fit', 'Deep Bass Tuning']),
    images: [{ url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'AeroClass Over-Ear Headphones',
    description: 'Immerse yourself in rich, high-fidelity sound with these premium over-ear headphones. Features plush memory foam ear cups, 40 hours of playtime, and advanced noise isolation. Perfect for travel or deep focus work.',
    price: 249.99, salePrice: 199.99, sku: 'NS-ELEC-003', category: 'Electronics', brand: 'AeroAudio', stock: 45, isTrending: true, rating: 4.9, reviewCount: 2150,
    specs: JSON.stringify({ Driver: '40mm Neodymium', Battery: '40h', Material: 'Memory Foam', Connectivity: 'Wired/Wireless' }),
    features: JSON.stringify(['Hi-Res Audio Certified', 'Foldable Design', 'Voice Assistant Integration']),
    images: [{ url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'Horizon Smartwatch Series 7',
    description: 'Your ultimate fitness and lifestyle companion. The Horizon Series 7 features a brilliant AMOLED display, comprehensive health tracking including ECG and blood oxygen monitoring, and up to 5 days of battery life.',
    price: 299.99, salePrice: null, sku: 'NS-ELEC-004', category: 'Electronics', brand: 'Horizon', stock: 200, isTrending: true, rating: 4.7, reviewCount: 1560,
    specs: JSON.stringify({ Display: '1.4" AMOLED', Battery: '5 Days', Sensors: 'HR, ECG, SpO2', WaterResistance: '5ATM' }),
    features: JSON.stringify(['Always-On Display', 'Built-in GPS', 'Sleep Tracking']),
    images: [{ url: 'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'Vanguard Titanium Smartwatch',
    description: 'A rugged smartwatch crafted from aerospace-grade titanium. Built for outdoor adventurers with advanced GPS tracking, altimeter, barometer, and a sapphire glass screen that resists scratches in extreme conditions.',
    price: 499.99, salePrice: 449.99, sku: 'NS-ELEC-005', category: 'Electronics', brand: 'Vanguard', stock: 30, isTrending: false, rating: 4.8, reviewCount: 420,
    specs: JSON.stringify({ Case: 'Titanium', Glass: 'Sapphire', GPS: 'Dual-Band', Battery: '14 Days' }),
    features: JSON.stringify(['Military-grade Durability', 'Offline Maps', 'Altimeter & Barometer']),
    images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'OmniCast Portable Bluetooth Speaker',
    description: 'Take the party anywhere with the OmniCast portable speaker. Delivering 360-degree sound, deep bass, and IP67 waterproof protection. The built-in power bank can even charge your phone while playing.',
    price: 119.99, salePrice: null, sku: 'NS-ELEC-006', category: 'Electronics', brand: 'OmniCast', stock: 150, isTrending: true, rating: 4.6, reviewCount: 930,
    specs: JSON.stringify({ Output: '30W', Playtime: '20h', Waterproof: 'IP67', Weight: '1.2 lbs' }),
    features: JSON.stringify(['360° Surround Sound', 'Built-in Power Bank', 'Stereo Pairing']),
    images: [{ url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'SoundWave Mini Speaker',
    description: 'Compact yet powerful, the SoundWave Mini fits in your palm but fills the room with rich audio. Perfect for small spaces, picnics, or travel. Features a sleek aluminum body and a 12-hour battery.',
    price: 59.99, salePrice: 49.99, sku: 'NS-ELEC-007', category: 'Electronics', brand: 'SoundWave', stock: 0, isTrending: false, rating: 4.4, reviewCount: 310,
    specs: JSON.stringify({ Output: '10W', Playtime: '12h', Material: 'Aluminum', Connectivity: 'Bluetooth 5.0' }),
    features: JSON.stringify(['Ultra-Compact', 'Premium Metal Build', 'Built-in Microphone']),
    images: [{ url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'ChargeMax 20000mAh Power Bank',
    description: 'Never run out of power. The ChargeMax features a massive 20,000mAh capacity, capable of charging most smartphones up to 5 times. Supports 65W fast charging to power laptops and tablets on the go.',
    price: 79.99, salePrice: null, sku: 'NS-ELEC-008', category: 'Electronics', brand: 'ChargeMax', stock: 250, isTrending: true, rating: 4.8, reviewCount: 1840,
    specs: JSON.stringify({ Capacity: '20000mAh', Output: '65W Max', Ports: '2x USB-C, 1x USB-A', Weight: '0.9 lbs' }),
    features: JSON.stringify(['Laptop Charging Capable', 'LED Display', 'Multi-Device Charging']),
    images: [{ url: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'ZenBook Pro 14 Laptop',
    description: 'A powerhouse for creators. The ZenBook Pro features a stunning 4K OLED touch display, a latest-gen processor, and dedicated graphics. Encased in a sleek, ultra-thin aluminum chassis.',
    price: 1499.99, salePrice: 1399.99, sku: 'NS-ELEC-009', category: 'Electronics', brand: 'Asus', stock: 25, isTrending: false, rating: 4.7, reviewCount: 350,
    specs: JSON.stringify({ Display: '14" 4K OLED', RAM: '32GB', Storage: '1TB SSD', Weight: '3.1 lbs' }),
    features: JSON.stringify(['Touchscreen', 'Backlit Keyboard', 'Thunderbolt 4']),
    images: [{ url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'Lumina 4K Webcam',
    description: 'Upgrade your video calls with the Lumina 4K webcam. Features an ultra-wide field of view, AI-powered auto-framing, and dual noise-canceling microphones. Perfect for streaming, conferencing, or recording.',
    price: 129.99, salePrice: null, sku: 'NS-ELEC-010', category: 'Electronics', brand: 'Lumina', stock: 90, isTrending: false, rating: 4.5, reviewCount: 620,
    specs: JSON.stringify({ Resolution: '4K @ 30fps', FOV: '90°', Microphones: 'Dual Stereo', Connection: 'USB-C' }),
    features: JSON.stringify(['AI Auto-Framing', 'Privacy Cover', 'Low-Light Correction']),
    images: [{ url: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70e8?w=800&q=80', isPrimary: true }]
  },

  // Home & Kitchen
  {
    name: 'BaristaPro Espresso Machine',
    description: 'Craft café-quality espresso at home. The BaristaPro features a built-in conical burr grinder, precise temperature control, and a powerful steam wand for micro-foam milk texturing.',
    price: 699.99, salePrice: 599.99, sku: 'NS-HOME-001', category: 'Home & Kitchen', brand: 'CafeTech', stock: 15, isTrending: true, rating: 4.9, reviewCount: 890,
    specs: JSON.stringify({ Pressure: '15 Bar', Capacity: '2L Water Tank', Grinder: 'Conical Burr', Material: 'Stainless Steel' }),
    features: JSON.stringify(['Built-in Grinder', 'PID Temperature Control', 'Manual Steam Wand']),
    images: [{ url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'AeroPress Coffee Maker',
    description: 'The iconic AeroPress delivers smooth, rich coffee without bitterness. Its unique brewing process yields a highly concentrated brew perfect for drinking black or adding milk for a latte style drink.',
    price: 39.99, salePrice: null, sku: 'NS-HOME-002', category: 'Home & Kitchen', brand: 'AeroPress', stock: 300, isTrending: true, rating: 4.8, reviewCount: 4500,
    specs: JSON.stringify({ Capacity: '1-3 Cups', Material: 'BPA-Free Plastic', BrewTime: '1 Minute', Type: 'Immersion/Pressure' }),
    features: JSON.stringify(['Travel-Friendly', 'Easy Cleanup', 'Smooth Brew']),
    images: [{ url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'VitaBlend High-Speed Blender',
    description: 'Crush ice, blend smoothies, and puree soups with the VitaBlend. Featuring a 1500W motor and aerospace-grade stainless steel blades, it tackles the toughest ingredients with ease.',
    price: 199.99, salePrice: 179.99, sku: 'NS-HOME-003', category: 'Home & Kitchen', brand: 'VitaBlend', stock: 65, isTrending: false, rating: 4.6, reviewCount: 1120,
    specs: JSON.stringify({ Power: '1500W', Capacity: '64 oz', Pitcher: 'Tritan Plastic', Speeds: 'Variable + Pulse' }),
    features: JSON.stringify(['Ice Crushing', 'Self-Cleaning Mode', 'BPA-Free Jar']),
    images: [{ url: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'Aura Air Purifier HEPA',
    description: 'Breathe cleaner air. The Aura Air Purifier uses a true HEPA filter to capture 99.97% of airborne particles, dust, and pollen. Smart sensors automatically adjust fan speed based on air quality.',
    price: 249.99, salePrice: null, sku: 'NS-HOME-004', category: 'Home & Kitchen', brand: 'Aura', stock: 110, isTrending: true, rating: 4.7, reviewCount: 840,
    specs: JSON.stringify({ Coverage: '500 sq ft', Filter: 'True HEPA (H13)', Noise: '24-50 dB', Connectivity: 'Wi-Fi' }),
    features: JSON.stringify(['Auto Mode', 'Air Quality Indicator', 'App Control']),
    images: [{ url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'Lumina Smart LED Light Strips',
    description: 'Transform any room with these app-controlled LED light strips. Syncs with music, supports 16 million colors, and integrates seamlessly with Alexa and Google Assistant.',
    price: 49.99, salePrice: 39.99, sku: 'NS-HOME-005', category: 'Home & Kitchen', brand: 'Lumina', stock: 400, isTrending: true, rating: 4.5, reviewCount: 2200,
    specs: JSON.stringify({ Length: '16.4 ft', Colors: '16 Million (RGB)', Connectivity: 'Wi-Fi/Bluetooth', Power: 'Plug-in' }),
    features: JSON.stringify(['Music Sync', 'Voice Control', 'Cuttable Design']),
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'Breeze Smart Pedestal Fan',
    description: 'A whisper-quiet oscillating fan with smart features. Control it via the app, set schedules, or use voice commands. Features 12 speed settings and a natural wind simulation mode.',
    price: 129.99, salePrice: null, sku: 'NS-HOME-006', category: 'Home & Kitchen', brand: 'Breeze', stock: 45, isTrending: false, rating: 4.4, reviewCount: 310,
    specs: JSON.stringify({ Speeds: '12', Oscillation: '120°', Noise: '15 dB Minimum', Control: 'App/Remote/Voice' }),
    features: JSON.stringify(['Ultra-Quiet DC Motor', 'Natural Wind Mode', 'Timer Function']),
    images: [{ url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80', isPrimary: true }]
  },

  // Fashion
  {
    name: 'Urban Glide Sneakers',
    description: 'Step into comfort. The Urban Glide features a responsive foam midsole, breathable knit upper, and a sleek profile perfect for both running and casual streetwear.',
    price: 119.99, salePrice: 89.99, sku: 'NS-FASH-001', category: 'Fashion', brand: 'Stride', stock: 180, isTrending: true, rating: 4.8, reviewCount: 3400,
    specs: JSON.stringify({ Material: 'Knit Mesh', Sole: 'EVA Foam', Weight: '250g', Closure: 'Lace-up' }),
    features: JSON.stringify(['Breathable Upper', 'Shock Absorption', 'Lightweight']),
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'Classic Leather High-Tops',
    description: 'A timeless silhouette. These premium leather high-tops offer durability, ankle support, and a vintage aesthetic that pairs well with any outfit.',
    price: 139.99, salePrice: null, sku: 'NS-FASH-002', category: 'Fashion', brand: 'Heritage', stock: 60, isTrending: false, rating: 4.6, reviewCount: 890,
    specs: JSON.stringify({ Material: 'Full-Grain Leather', Sole: 'Rubber', Lining: 'Cotton', Style: 'High-Top' }),
    features: JSON.stringify(['Premium Leather', 'Padded Collar', 'Durable Stitching']),
    images: [{ url: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'Ray Shield Aviator Sunglasses',
    description: 'Protect your eyes in style. Featuring polarized lenses that block 100% of UVA/UVB rays and a lightweight metal frame that rests comfortably on your face.',
    price: 149.99, salePrice: 129.99, sku: 'NS-FASH-003', category: 'Fashion', brand: 'RayShield', stock: 120, isTrending: true, rating: 4.7, reviewCount: 1560,
    specs: JSON.stringify({ Lenses: 'Polarized', Frame: 'Metal Alloy', Protection: '100% UV', Shape: 'Aviator' }),
    features: JSON.stringify(['Glare Reduction', 'Scratch Resistant', 'Adjustable Nose Pads']),
    images: [{ url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'Minimalist Chronograph Watch',
    description: 'Elegance in simplicity. A stunning chronograph watch featuring a matte black dial, stainless steel case, and a genuine leather strap. Water-resistant up to 30 meters.',
    price: 199.99, salePrice: null, sku: 'NS-FASH-004', category: 'Fashion', brand: 'Chronos', stock: 40, isTrending: false, rating: 4.9, reviewCount: 670,
    specs: JSON.stringify({ Movement: 'Quartz', Case: 'Stainless Steel', Strap: 'Genuine Leather', WaterResist: '30m' }),
    features: JSON.stringify(['Stopwatch Function', 'Date Display', 'Scratch-Resistant Glass']),
    images: [{ url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'Rose Gold Mesh Watch',
    description: 'A delicate and sophisticated timepiece. Features a minimalist white dial encased in a rose gold stainless steel frame, paired with a comfortable, adjustable mesh band.',
    price: 159.99, salePrice: 119.99, sku: 'NS-FASH-005', category: 'Fashion', brand: 'Elegance', stock: 85, isTrending: true, rating: 4.8, reviewCount: 1120,
    specs: JSON.stringify({ Movement: 'Japanese Quartz', Case: 'Rose Gold Plated', Strap: 'Mesh Stainless Steel', Dial: '32mm' }),
    features: JSON.stringify(['Interchangeable Straps', 'Ultra-Thin Profile', 'Water Resistant']),
    images: [{ url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'Explorer Winter Parka',
    description: 'Brave the cold. This heavily insulated parka features a faux-fur trimmed hood, water-resistant outer shell, and multiple fleece-lined pockets to keep you warm in sub-zero temperatures.',
    price: 249.99, salePrice: null, sku: 'NS-FASH-006', category: 'Fashion', brand: 'Explorer', stock: 0, isTrending: false, rating: 4.7, reviewCount: 540,
    specs: JSON.stringify({ Outer: 'Nylon/Polyester', Insulation: 'Synthetic Down', Rating: '-20°C', Fit: 'Regular' }),
    features: JSON.stringify(['Water-Resistant', 'Windproof', 'Fleece-Lined Pockets']),
    images: [{ url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'Essential Cotton T-Shirt',
    description: 'The perfect everyday tee. Made from 100% organic Peruvian pima cotton for unmatched softness and durability. Features a tailored fit that holds its shape wash after wash.',
    price: 29.99, salePrice: 24.99, sku: 'NS-FASH-007', category: 'Fashion', brand: 'Basics', stock: 500, isTrending: true, rating: 4.9, reviewCount: 5600,
    specs: JSON.stringify({ Material: '100% Pima Cotton', Fit: 'Slim/Tailored', Care: 'Machine Wash Cold', Weight: 'Medium' }),
    features: JSON.stringify(['Pre-Shrunk', 'Tagless Design', 'Ultra-Soft']),
    images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'Classic Bifold Leather Wallet',
    description: 'A slim, minimalist leather wallet that fits perfectly in your front pocket. Features 6 card slots, a cash pocket, and RFID-blocking technology to protect your information.',
    price: 49.99, salePrice: null, sku: 'NS-FASH-008', category: 'Fashion', brand: 'Heritage', stock: 120, isTrending: false, rating: 4.7, reviewCount: 890,
    specs: JSON.stringify({ Material: 'Full-Grain Leather', Capacity: '6-8 Cards', Security: 'RFID Blocking', Dimensions: '4" x 3"' }),
    features: JSON.stringify(['Slim Profile', 'Quick-Access Slot', 'Premium Stitching']),
    images: [{ url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80', isPrimary: true }]
  },

  // Travel
  {
    name: 'Nomad 40L Travel Backpack',
    description: 'Designed for the modern traveler. The Nomad 40L fits airline carry-on dimensions while packing a week\'s worth of clothes. Features a clamshell opening, padded laptop sleeve, and weather-resistant materials.',
    price: 179.99, salePrice: 149.99, sku: 'NS-TRAV-001', category: 'Travel', brand: 'NomadGear', stock: 85, isTrending: true, rating: 4.8, reviewCount: 1250,
    specs: JSON.stringify({ Capacity: '40 Liters', Material: '1000D Nylon', Laptop: 'Up to 16"', Weight: '3.5 lbs' }),
    features: JSON.stringify(['Clamshell Opening', 'TSA-Friendly', 'Hideaway Straps']),
    images: [{ url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'Urban Daypack 20L',
    description: 'A sleek, minimalist daypack perfect for your daily commute. Water-resistant zippers, a suspended laptop compartment, and hidden passport pockets make it secure and stylish.',
    price: 89.99, salePrice: null, sku: 'NS-TRAV-002', category: 'Travel', brand: 'CityTrek', stock: 140, isTrending: false, rating: 4.6, reviewCount: 780,
    specs: JSON.stringify({ Capacity: '20 Liters', Material: 'Recycled Polyester', Laptop: 'Up to 15"', WaterResistance: 'DWR Coating' }),
    features: JSON.stringify(['Minimalist Design', 'Hidden Pockets', 'Luggage Pass-Through']),
    images: [{ url: 'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'HydroFlask Insulated Water Bottle',
    description: 'Keep your drinks ice-cold for 24 hours or piping hot for 12. Made from pro-grade stainless steel with a sweat-proof powder coat finish. The perfect companion for hikes or long flights.',
    price: 39.99, salePrice: null, sku: 'NS-TRAV-003', category: 'Travel', brand: 'HydroFlask', stock: 350, isTrending: true, rating: 4.9, reviewCount: 8900,
    specs: JSON.stringify({ Capacity: '32 oz', Material: '18/8 Stainless Steel', Insulation: 'Double-Wall Vacuum', Mouth: 'Wide' }),
    features: JSON.stringify(['Keeps Cold 24h', 'Keeps Hot 12h', 'BPA-Free']),
    images: [{ url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80', isPrimary: true }]
  },

  // Gaming
  {
    name: 'Pro Controller X',
    description: 'Gain the competitive edge. The Pro Controller X features customizable back paddles, adjustable trigger stops, and interchangeable thumbsticks. Designed for elite console and PC gamers.',
    price: 159.99, salePrice: 129.99, sku: 'NS-GAME-001', category: 'Gaming', brand: 'NexusGaming', stock: 75, isTrending: true, rating: 4.7, reviewCount: 2300,
    specs: JSON.stringify({ Compatibility: 'PC/Console', Connection: 'Wireless/USB-C', Battery: '40h', Weight: '280g' }),
    features: JSON.stringify(['Rear Paddles', 'Trigger Stops', 'Custom Profiles']),
    images: [{ url: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'Immerse VR Headset',
    description: 'Step into new worlds. The Immerse VR provides stunning 4K resolution per eye, an ultra-wide 120-degree field of view, and inside-out tracking. No external sensors required.',
    price: 499.99, salePrice: null, sku: 'NS-GAME-002', category: 'Gaming', brand: 'ImmerseVR', stock: 20, isTrending: true, rating: 4.5, reviewCount: 450,
    specs: JSON.stringify({ Resolution: '4K per eye', RefreshRate: '120Hz', FOV: '120°', Tracking: 'Inside-Out' }),
    features: JSON.stringify(['Standalone or PC VR', 'Spatial Audio', 'Hand Tracking']),
    images: [{ url: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'Stealth 700 Gaming Headset',
    description: 'Hear every footstep. Featuring immersive 7.1 surround sound, a noise-canceling flip-to-mute mic, and cooling gel-infused ear cushions for marathon gaming sessions.',
    price: 149.99, salePrice: 119.99, sku: 'NS-GAME-003', category: 'Gaming', brand: 'StealthAudio', stock: 110, isTrending: false, rating: 4.6, reviewCount: 1890,
    specs: JSON.stringify({ Drivers: '50mm', Audio: '7.1 Surround', Connection: '2.4GHz Wireless', Mic: 'Flip-to-mute' }),
    features: JSON.stringify(['Cooling Gel Cushions', 'EQ Presets', 'Glasses Friendly']),
    images: [{ url: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'Chroma RGB Mousepad',
    description: 'Light up your desk setup. An extended mousepad with 14 lighting modes, a micro-textured surface for precise tracking, and an anti-slip rubber base.',
    price: 39.99, salePrice: null, sku: 'NS-GAME-004', category: 'Gaming', brand: 'NexusGaming', stock: 200, isTrending: false, rating: 4.8, reviewCount: 3100,
    specs: JSON.stringify({ Size: 'Extended (900x400mm)', Material: 'Micro-woven Cloth', Base: 'Rubber', Lighting: 'RGB LED' }),
    features: JSON.stringify(['14 Lighting Modes', 'Water-Resistant', 'Stitched Edges']),
    images: [{ url: 'https://images.unsplash.com/photo-1616588589676-62b3d4ff6e04?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'SpeedDrive 2TB NVMe SSD',
    description: 'Eliminate loading screens. The SpeedDrive NVMe SSD delivers blistering read/write speeds up to 7300MB/s. Perfect for PC upgrades or expanding PS5 storage.',
    price: 189.99, salePrice: 159.99, sku: 'NS-GAME-005', category: 'Gaming', brand: 'SpeedDrive', stock: 65, isTrending: true, rating: 4.9, reviewCount: 1450,
    specs: JSON.stringify({ Capacity: '2TB', Interface: 'PCIe Gen4 x4', Read: '7300 MB/s', Write: '6800 MB/s' }),
    features: JSON.stringify(['PS5 Compatible', 'Graphene Heatsink', 'TLC NAND']),
    images: [{ url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80', isPrimary: true }]
  },

  // Office
  {
    name: 'Apex Mechanical Keyboard',
    description: 'Type with precision. The Apex features hot-swappable tactile switches, per-key RGB backlighting, and a premium aluminum frame. The ultimate keyboard for typing and coding.',
    price: 149.99, salePrice: null, sku: 'NS-OFFI-001', category: 'Office', brand: 'Apex', stock: 80, isTrending: true, rating: 4.8, reviewCount: 2100,
    specs: JSON.stringify({ Switches: 'Tactile (Brown)', Layout: 'TKL (87 Key)', Material: 'Aluminum', Connection: 'USB-C / Bluetooth' }),
    features: JSON.stringify(['Hot-Swappable', 'PBT Keycaps', 'Mac/Windows Compatible']),
    images: [{ url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'ErgoPro Wireless Mouse',
    description: 'Say goodbye to wrist pain. The ErgoPro is sculpted to fit your hand naturally, reducing muscle strain. Features a hyper-fast scroll wheel and multi-device connection.',
    price: 99.99, salePrice: 79.99, sku: 'NS-OFFI-002', category: 'Office', brand: 'ErgoTech', stock: 150, isTrending: false, rating: 4.7, reviewCount: 3400,
    specs: JSON.stringify({ Sensor: '4000 DPI Laser', Buttons: '7 Programmable', Battery: '70 Days', Ergonomics: 'Right-handed' }),
    features: JSON.stringify(['Multi-Device Flow', 'Hyper-Fast Scrolling', 'Thumb Rest']),
    images: [{ url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'UltraWide 34" Curved Monitor',
    description: 'Expand your workspace. A stunning 34-inch ultra-wide curved display with WQHD resolution, 144Hz refresh rate, and 99% sRGB color accuracy. Excellent for multitasking.',
    price: 499.99, salePrice: 449.99, sku: 'NS-OFFI-003', category: 'Office', brand: 'VisionDisplay', stock: 40, isTrending: true, rating: 4.6, reviewCount: 890,
    specs: JSON.stringify({ Size: '34"', Resolution: '3440 x 1440', RefreshRate: '144Hz', Panel: 'IPS Curved' }),
    features: JSON.stringify(['Picture-by-Picture', 'USB-C Hub', 'Ergonomic Stand']),
    images: [{ url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'Lumina LED Desk Lamp',
    description: 'Reduce eye strain with flicker-free illumination. Features adjustable color temperatures (warm to cool white), smooth dimming, and a built-in wireless charger for your phone.',
    price: 59.99, salePrice: null, sku: 'NS-OFFI-004', category: 'Office', brand: 'Lumina', stock: 120, isTrending: false, rating: 4.8, reviewCount: 1100,
    specs: JSON.stringify({ Brightness: '800 Lumens', ColorTemp: '2700K - 6500K', Power: '12W LED', Extra: '10W Wireless Charger' }),
    features: JSON.stringify(['Wireless Charging Base', 'Eye-Caring Tech', 'Flexible Neck']),
    images: [{ url: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab3fe?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'Aeronaut Ergonomic Chair',
    description: 'Invest in your posture. Features premium breathable mesh, dynamic lumbar support, and fully adjustable 4D armrests. Designed for all-day comfort and support.',
    price: 599.99, salePrice: null, sku: 'NS-OFFI-005', category: 'Office', brand: 'ErgoTech', stock: 25, isTrending: true, rating: 4.9, reviewCount: 650,
    specs: JSON.stringify({ Material: 'Elastomeric Mesh', Capacity: '300 lbs', Adjustability: 'Tilt, Height, Armrests', Wheels: 'Hard/Soft Floor' }),
    features: JSON.stringify(['PostureFit Lumbar', 'Breathable Mesh', '12-Year Warranty']),
    images: [{ url: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80', isPrimary: true }]
  },

  // Fitness
  {
    name: 'Zenith Pro Yoga Mat',
    description: 'Find your center. The Zenith Pro mat is crafted from eco-friendly natural rubber, offering superior grip even during hot yoga sessions. 5mm thickness provides optimal joint cushioning.',
    price: 69.99, salePrice: 59.99, sku: 'NS-FIT-001', category: 'Fitness', brand: 'Zenith', stock: 200, isTrending: true, rating: 4.8, reviewCount: 1890,
    specs: JSON.stringify({ Material: 'Natural Rubber/PU', Thickness: '5mm', Dimensions: '72" x 26"', Weight: '6 lbs' }),
    features: JSON.stringify(['Non-Slip Surface', 'Eco-Friendly', 'Alignment Lines']),
    images: [{ url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'AdjustaWeight Dumbbell Set',
    description: 'A full gym in a compact design. Easily adjust from 5 to 52.5 lbs with a simple dial turn. Replaces 15 pairs of dumbbells, saving massive space in your home gym.',
    price: 299.99, salePrice: null, sku: 'NS-FIT-002', category: 'Fitness', brand: 'IronCore', stock: 45, isTrending: true, rating: 4.9, reviewCount: 3400,
    specs: JSON.stringify({ Range: '5 - 52.5 lbs', Adjustments: '15 Settings', Material: 'Steel & Plastic', SoldAs: 'Pair' }),
    features: JSON.stringify(['Space Saving', 'Quick Select Dial', 'Quiet Plates']),
    images: [{ url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'Revive Deep Tissue Massage Gun',
    description: 'Accelerate recovery. Delivers rapid, deep-tissue percussion to relieve muscle soreness. Includes 6 interchangeable heads, 30 speed levels, and an ultra-quiet brushless motor.',
    price: 129.99, salePrice: 99.99, sku: 'NS-FIT-003', category: 'Fitness', brand: 'Revive', stock: 110, isTrending: false, rating: 4.7, reviewCount: 2100,
    specs: JSON.stringify({ Speeds: '30 Levels', Attachments: '6 Heads', Battery: '6 Hours', Noise: '<45dB' }),
    features: JSON.stringify(['Quiet Glide Tech', 'LCD Touch Screen', 'Carrying Case']),
    images: [{ url: 'https://images.unsplash.com/photo-1570655652364-2e0a67455ac6?w=800&q=80', isPrimary: true }]
  },
  {
    name: 'FlexBand Resistance Set',
    description: 'Build strength anywhere. A premium set of 5 stackable resistance tubes ranging from 10 to 50 lbs. Includes handles, ankle straps, and a door anchor for a full-body workout.',
    price: 34.99, salePrice: null, sku: 'NS-FIT-004', category: 'Fitness', brand: 'FlexBand', stock: 300, isTrending: false, rating: 4.6, reviewCount: 1560,
    specs: JSON.stringify({ Material: 'Natural Latex', MaxResistance: '150 lbs Stacked', Pieces: '11-Piece Set', Type: 'Tube Bands' }),
    features: JSON.stringify(['Anti-Snap Design', 'Heavy Duty Carabiners', 'Door Anchor Included']),
    images: [{ url: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&q=80', isPrimary: true }]
  }
];

async function main() {
  console.log('Starting seed process...');
  
  // Backup count
  const existingCount = await prisma.product.count();
  console.log('Found ' + existingCount + ' existing products.');

  // Clean DB
  console.log('Cleaning database...');
  await prisma.paymentTransaction.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.auction.deleteMany();
  await prisma.recentlyViewed.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  console.log('Database cleaned.');

  console.log('Seeding ' + products.length + ' products...');
  for (const p of products) {
    const imagesData = p.images.map((img, i) => ({
      url: img.url,
      isPrimary: img.isPrimary,
      order: i
    }));

    await prisma.product.create({
      data: {
        name: p.name,
        description: p.description,
        price: p.price,
        salePrice: p.salePrice,
        sku: p.sku,
        category: p.category,
        brand: p.brand,
        stock: p.stock,
        isTrending: p.isTrending,
        rating: p.rating,
        reviewCount: p.reviewCount,
        specs: p.specs,
        features: p.features,
        images: {
          create: imagesData
        },
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      }
    });
  }

  console.log('Seeding coupons...');
  await prisma.coupon.upsert({
    where: { code: 'NOVA10' },
    update: { discountPercent: 10, isActive: true },
    create: { code: 'NOVA10', discountPercent: 10, isActive: true }
  });

  console.log('Seeding feature flags...');
  const initialFlags = [
    { key: "AUCTIONS", name: "Auctions", category: "Commerce", type: "Release" as const, enabled: false, description: "Real-time bidding functionality." },
    { key: "AI_ASSISTANT", name: "AI Assistant", category: "AI", type: "Experiment" as const, enabled: false, description: "Generative AI shopping assistant." },
    { key: "LIVE_SUPPORT", name: "Live Support", category: "Customer", type: "Release" as const, enabled: true, description: "Customer support chat widget." },
    { key: "RECOMMENDATIONS", name: "Recommendations", category: "Marketplace", type: "Release" as const, enabled: true, description: "AI-driven product recommendations." },
    { key: "NEW_CHECKOUT", name: "Checkout V2", category: "Commerce", type: "Release" as const, enabled: false, description: "Optimized one-page checkout." },
    { key: "NEW_SEARCH", name: "Search V2", category: "Search", type: "Experiment" as const, enabled: false, description: "Fuzzy and typo-tolerant search." },
    { key: "SELLER_CENTER", name: "Seller Center", category: "Marketplace", type: "Permission" as const, enabled: false, description: "Vendor onboarding portal." },
    { key: "DARK_THEME", name: "Dark Theme", category: "Experimental", type: "Release" as const, enabled: true, description: "Deep navy color scheme." },
    { key: "LIGHT_THEME", name: "Light Theme", category: "Experimental", type: "Release" as const, enabled: false, description: "Clean white color scheme." },
    { key: "EXECUTIVE_THEME", name: "Executive Theme", category: "Experimental", type: "Release" as const, enabled: false, description: "Luxury gold/black scheme." },
    { key: "ABANDONED_CART", name: "Abandoned Cart", category: "Customer", type: "Release" as const, enabled: true, description: "Email reminders for left items." },
    { key: "LOYALTY", name: "Loyalty Program", category: "Customer", type: "Release" as const, enabled: false, description: "Points system for repeat buyers." },
    { key: "WISHLIST_V2", name: "Wishlist V2", category: "Customer", type: "Experiment" as const, enabled: false, description: "Sharable wishlists." },
    { key: "LIVE_CHAT", name: "Live Chat", category: "Operational", type: "Release" as const, enabled: true, description: "Live WebSocket chat system." },
    { key: "NOTIFICATIONS", name: "Push Notifications", category: "Customer", type: "Release" as const, enabled: false, description: "Browser notifications." },
    { key: "BIDDING", name: "Bidding Engine", category: "Commerce", type: "Release" as const, enabled: false, description: "Underlying auction bid engine.", dependencies: ["AUCTIONS"] },
    { key: "ANALYTICS_V2", name: "Analytics V2", category: "Analytics", type: "Release" as const, enabled: false, description: "Advanced dashboard charts." },
    { key: "REGIONAL_PRODUCTS", name: "Regional Products", category: "Commerce", type: "Permission" as const, enabled: false, description: "Geofenced catalogs." },
    { key: "SMART_SEARCH", name: "Smart Search", category: "Search", type: "Release" as const, enabled: false, description: "Search by image/AI." },
    { key: "VOICE_SEARCH", name: "Voice Search", category: "Search", type: "Experiment" as const, enabled: false, description: "Microphone search input." },
    { key: "PAYMENTS", name: "Payments System", category: "Payments", type: "KillSwitch" as const, enabled: true, description: "Master switch for Stripe." },
  ];

  for (const flag of initialFlags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {
        name: flag.name,
        category: flag.category,
        type: flag.type,
        enabled: flag.enabled,
        description: flag.description,
        dependencies: flag.dependencies ? flag.dependencies : [],
      },
      create: {
        key: flag.key,
        name: flag.name,
        category: flag.category,
        type: flag.type,
        enabled: flag.enabled,
        description: flag.description,
        dependencies: flag.dependencies ? flag.dependencies : [],
        createdBy: "SYSTEM_SEED",
      }
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
