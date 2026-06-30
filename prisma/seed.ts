import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const PRODUCT_TEMPLATES = [
  {
    name: "Sony WH-1000XM5 Headphones",
    category: "Electronics",
    brand: "Sony",
    price: 187.99,
    imageUrls: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Sony WH-1000XM5 Headphones designed to elevate your electronics experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Sony Noise Cancelling Earbuds",
    category: "Electronics",
    brand: "Sony",
    price: 133.99,
    imageUrls: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Sony Noise Cancelling Earbuds designed to elevate your electronics experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Anker PowerCore 24K",
    category: "Electronics",
    brand: "Anker",
    price: 161.99,
    imageUrls: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Anker PowerCore 24K designed to elevate your electronics experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Anker Nano Power Bank",
    category: "Electronics",
    brand: "Anker",
    price: 52.99,
    imageUrls: ["https://images.unsplash.com/photo-1583394838020-f192b02ee24f?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Anker Nano Power Bank designed to elevate your electronics experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Bose SoundLink Flex",
    category: "Electronics",
    brand: "Bose",
    price: 153.99,
    imageUrls: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Bose SoundLink Flex designed to elevate your electronics experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "JBL Flip 6 Speaker",
    category: "Electronics",
    brand: "JBL",
    price: 247.99,
    imageUrls: ["https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&q=80&w=800"],
    description: "Premium JBL Flip 6 Speaker designed to elevate your electronics experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Samsung Galaxy Buds2 Pro",
    category: "Electronics",
    brand: "Samsung",
    price: 156.99,
    imageUrls: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Samsung Galaxy Buds2 Pro designed to elevate your electronics experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Apple AirPods Pro",
    category: "Electronics",
    brand: "Apple",
    price: 88.99,
    imageUrls: ["https://images.unsplash.com/photo-1606220588913-b3aecb492004?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Apple AirPods Pro designed to elevate your electronics experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Asus ZenScreen Portable",
    category: "Electronics",
    brand: "Asus",
    price: 151.99,
    imageUrls: ["https://images.unsplash.com/photo-1527443195645-1133f7f28990?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Asus ZenScreen Portable designed to elevate your electronics experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "LG UltraFine Display",
    category: "Electronics",
    brand: "LG",
    price: 247.99,
    imageUrls: ["https://images.unsplash.com/photo-1588620247657-3f36750de485?auto=format&fit=crop&q=80&w=800"],
    description: "Premium LG UltraFine Display designed to elevate your electronics experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Spigen Tough Armor Case",
    category: "Mobile Accessories",
    brand: "Spigen",
    price: 90.99,
    imageUrls: ["https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Spigen Tough Armor Case designed to elevate your mobile accessories experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "OtterBox Defender Case",
    category: "Mobile Accessories",
    brand: "OtterBox",
    price: 221.99,
    imageUrls: ["https://images.unsplash.com/photo-1609692814858-f7cd2f0afa4f?auto=format&fit=crop&q=80&w=800"],
    description: "Premium OtterBox Defender Case designed to elevate your mobile accessories experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Belkin BoostCharge Pro",
    category: "Mobile Accessories",
    brand: "Belkin",
    price: 198.99,
    imageUrls: ["https://images.unsplash.com/photo-1585298723682-7115561c51b7?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Belkin BoostCharge Pro designed to elevate your mobile accessories experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Anker 65W Charger",
    category: "Mobile Accessories",
    brand: "Anker",
    price: 88.99,
    imageUrls: ["https://images.unsplash.com/photo-1615655406736-b37c4fabf923?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Anker 65W Charger designed to elevate your mobile accessories experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Anker PowerLine Cable",
    category: "Mobile Accessories",
    brand: "Anker",
    price: 139.99,
    imageUrls: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Anker PowerLine Cable designed to elevate your mobile accessories experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Apple USB-C Cable",
    category: "Mobile Accessories",
    brand: "Apple",
    price: 122.99,
    imageUrls: ["https://images.unsplash.com/photo-1616439601321-7e77a2846933?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Apple USB-C Cable designed to elevate your mobile accessories experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Samsung Silicone Cover",
    category: "Mobile Accessories",
    brand: "Samsung",
    price: 195.99,
    imageUrls: ["https://images.unsplash.com/photo-1541877855018-0a0e50f3d9d4?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Samsung Silicone Cover designed to elevate your mobile accessories experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Dyson V15 Detect Vacuum",
    category: "Home",
    brand: "Dyson",
    price: 110.99,
    imageUrls: ["https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Dyson V15 Detect Vacuum designed to elevate your home experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Shark Cordless Vacuum",
    category: "Home",
    brand: "Shark",
    price: 120.99,
    imageUrls: ["https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Shark Cordless Vacuum designed to elevate your home experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Breville Barista Express",
    category: "Home",
    brand: "Breville",
    price: 219.99,
    imageUrls: ["https://images.unsplash.com/photo-1585659722983-36cb2b46faa6?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Breville Barista Express designed to elevate your home experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "DeLonghi Espresso Machine",
    category: "Home",
    brand: "DeLonghi",
    price: 84.99,
    imageUrls: ["https://images.unsplash.com/photo-1517246221520-22c6e612ed93?auto=format&fit=crop&q=80&w=800"],
    description: "Premium DeLonghi Espresso Machine designed to elevate your home experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Levoit Core 400S Purifier",
    category: "Home",
    brand: "Levoit",
    price: 61.99,
    imageUrls: ["https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Levoit Core 400S Purifier designed to elevate your home experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Coway Air Purifier",
    category: "Home",
    brand: "Coway",
    price: 52.99,
    imageUrls: ["https://images.unsplash.com/photo-1522055624797-2a54ce02d8da?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Coway Air Purifier designed to elevate your home experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Philips Hue Color Bulb",
    category: "Smart Home",
    brand: "Philips",
    price: 184.99,
    imageUrls: ["https://images.unsplash.com/photo-1629397637762-b941ba924151?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Philips Hue Color Bulb designed to elevate your smart home experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Nest Learning Thermostat",
    category: "Smart Home",
    brand: "Nest",
    price: 66.99,
    imageUrls: ["https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Nest Learning Thermostat designed to elevate your smart home experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Fellow Stagg EKG Kettle",
    category: "Home",
    brand: "Fellow",
    price: 247.99,
    imageUrls: ["https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Fellow Stagg EKG Kettle designed to elevate your home experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "August Smart Lock",
    category: "Smart Home",
    brand: "August",
    price: 64.99,
    imageUrls: ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800"],
    description: "Premium August Smart Lock designed to elevate your smart home experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Ring Video Doorbell Pro 2",
    category: "Smart Home",
    brand: "Ring",
    price: 191.99,
    imageUrls: ["https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Ring Video Doorbell Pro 2 designed to elevate your smart home experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Grovemade Desk Pad",
    category: "Office",
    brand: "Grovemade",
    price: 205.99,
    imageUrls: ["https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Grovemade Desk Pad designed to elevate your office experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Herman Miller Aeron Chair",
    category: "Office",
    brand: "Herman",
    price: 130.99,
    imageUrls: ["https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Herman Miller Aeron Chair designed to elevate your office experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Uplift V2 Standing Desk",
    category: "Office",
    brand: "Uplift",
    price: 167.99,
    imageUrls: ["https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Uplift V2 Standing Desk designed to elevate your office experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Logitech MX Master 3S Mouse",
    category: "Office",
    brand: "Logitech",
    price: 177.99,
    imageUrls: ["https://images.unsplash.com/photo-1527814050087-3793815479fa?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Logitech MX Master 3S Mouse designed to elevate your office experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Elgato Facecam Premium",
    category: "Office",
    brand: "Elgato",
    price: 185.99,
    imageUrls: ["https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Elgato Facecam Premium designed to elevate your office experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Razer DeathAdder V3 Pro",
    category: "Gaming",
    brand: "Razer",
    price: 127.99,
    imageUrls: ["https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Razer DeathAdder V3 Pro designed to elevate your gaming experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Corsair K100 RGB Keyboard",
    category: "Gaming",
    brand: "Corsair",
    price: 184.99,
    imageUrls: ["https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Corsair K100 RGB Keyboard designed to elevate your gaming experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Away The Bigger Carry-On",
    category: "Travel",
    brand: "Away",
    price: 154.99,
    imageUrls: ["https://images.unsplash.com/photo-1565026057447-bc90a3dceeee?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Away The Bigger Carry-On designed to elevate your travel experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Nomatic Travel Pack",
    category: "Travel",
    brand: "Nomatic",
    price: 88.99,
    imageUrls: ["https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Nomatic Travel Pack designed to elevate your travel experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Peak Design Tech Pouch",
    category: "Travel",
    brand: "Peak",
    price: 59.99,
    imageUrls: ["https://images.unsplash.com/photo-1590845947376-2638caa89309?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Peak Design Tech Pouch designed to elevate your travel experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Bellroy Travel Wallet",
    category: "Travel",
    brand: "Bellroy",
    price: 182.99,
    imageUrls: ["https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Bellroy Travel Wallet designed to elevate your travel experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Filson Rugged Twill Duffle",
    category: "Lifestyle",
    brand: "Filson",
    price: 247.99,
    imageUrls: ["https://images.unsplash.com/photo-1628151015968-3a4429e9ef04?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Filson Rugged Twill Duffle designed to elevate your lifestyle experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Theragun PRO Massager",
    category: "Fitness",
    brand: "Theragun",
    price: 241.99,
    imageUrls: ["https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Theragun PRO Massager designed to elevate your fitness experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Bowflex Adjustable Dumbbells",
    category: "Fitness",
    brand: "Bowflex",
    price: 228.99,
    imageUrls: ["https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Bowflex Adjustable Dumbbells designed to elevate your fitness experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Garmin Fenix 7X Sapphire",
    category: "Fitness",
    brand: "Garmin",
    price: 219.99,
    imageUrls: ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Garmin Fenix 7X Sapphire designed to elevate your fitness experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Seiko Prospex Divers Watch",
    category: "Lifestyle",
    brand: "Seiko",
    price: 52.99,
    imageUrls: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Seiko Prospex Divers Watch designed to elevate your lifestyle experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Lululemon Reversible Mat",
    category: "Fitness",
    brand: "Lululemon",
    price: 89.99,
    imageUrls: ["https://images.unsplash.com/photo-1575311373937-040b8e1fd5b0?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Lululemon Reversible Mat designed to elevate your fitness experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "Ray-Ban Aviator Classic",
    category: "Lifestyle",
    brand: "Ray-Ban",
    price: 199.99,
    imageUrls: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800"],
    description: "Premium Ray-Ban Aviator Classic designed to elevate your lifestyle experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  },
  {
    name: "YETI Rambler 26 oz Bottle",
    category: "Lifestyle",
    brand: "YETI",
    price: 219.99,
    imageUrls: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800"],
    description: "Premium YETI Rambler 26 oz Bottle designed to elevate your lifestyle experience. Carefully crafted with precision materials.",
    features: JSON.stringify(["Premium Build Quality", "Industry Leading Performance", "1 Year Warranty"]),
    specs: JSON.stringify({ "Material": "Premium", "Weight": "Lightweight", "Color": "Standard" })
  }
];

async function validateIntegrity() {
  const seenTitles = new Set();
  const seenPrimaryImages = new Set();

  for (const t of PRODUCT_TEMPLATES) {
    if (seenTitles.has(t.name)) {
      throw new Error('INTEGRITY ERROR: Duplicate product title detected: ' + t.name);
    }
    seenTitles.add(t.name);

    const primaryImage = t.imageUrls[0];
    if (seenPrimaryImages.has(primaryImage)) {
      throw new Error('INTEGRITY ERROR: Duplicate primary image detected. Image: ' + primaryImage);
    }
    seenPrimaryImages.add(primaryImage);
  }
  
  console.log('[Validation Passed] All ' + PRODUCT_TEMPLATES.length + ' products are uniquely titled and visually unique.');
}

async function main() {
  console.log('Initiating STRICT Execution Seed...');
  await validateIntegrity();
  
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  
  let count = 0;
  for (const template of PRODUCT_TEMPLATES) {
      const sku = template.brand.substring(0,3).toUpperCase() + '-' + template.category.substring(0,3).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
      
      const created = await prisma.product.create({
        data: {
          name: template.name,
          description: template.description,
          price: template.price,
          salePrice: null,
          sku: sku,
          category: template.category,
          brand: template.brand,
          stock: Math.floor(Math.random() * 150) + 5,
          isTrending: Math.random() > 0.5,
          rating: 4.5,
          reviewCount: 150,
          specs: template.specs,
          features: template.features,
        }
      });
      
      await prisma.productImage.create({
        data: {
          productId: created.id,
          url: template.imageUrls[0],
          isPrimary: true,
          order: 0
        }
      });

      count++;

  }

  console.log('Execution complete. ' + count + ' verified unique products seeded.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
