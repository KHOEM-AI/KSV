// Generated from general-devices-control-extra.tiles.json — positions of the tiles on the extra picture.
// Every device is mapped to a type of the KSV gateway catalog (gateway/devices/catalog.js). The panel reads the
// commands of that type from the gateway, so it never has to know them.

export const EXTRA_IMAGE = { src: '/general-devices-control-extra.png?v=1', width: 1079, height: 525 };

export interface ExtraDevice {
  id: string;
  name: string;
  section: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export const EXTRA_DEVICES: ExtraDevice[] = [
  { id: 'laptop-1', name: 'Laptop', section: '9. General Electronics & Appliances (All Kinds)', type: 'generic', x: 22, y: 42, w: 80, h: 117 },
  { id: 'desktop-pc-1', name: 'Desktop PC', section: '9. General Electronics & Appliances (All Kinds)', type: 'generic', x: 111, y: 42, w: 78, h: 117 },
  { id: 'tablet-1', name: 'Tablet', section: '9. General Electronics & Appliances (All Kinds)', type: 'generic', x: 197, y: 42, w: 78, h: 117 },
  { id: 'smartphone-1', name: 'Smartphone', section: '9. General Electronics & Appliances (All Kinds)', type: 'generic', x: 282, y: 42, w: 78, h: 117 },
  { id: 'smart-watch-1', name: 'Smart Watch', section: '9. General Electronics & Appliances (All Kinds)', type: 'generic', x: 367, y: 42, w: 78, h: 117 },
  { id: 'headphones-1', name: 'Headphones', section: '9. General Electronics & Appliances (All Kinds)', type: 'generic', x: 453, y: 42, w: 79, h: 117 },
  { id: 'bluetooth-speaker-1', name: 'Bluetooth Speaker', section: '9. General Electronics & Appliances (All Kinds)', type: 'speaker', x: 542, y: 42, w: 79, h: 117 },
  { id: 'microwave-1', name: 'Microwave', section: '9. General Electronics & Appliances (All Kinds)', type: 'generic', x: 637, y: 42, w: 87, h: 117 },
  { id: 'electric-kettle-1', name: 'Electric Kettle', section: '9. General Electronics & Appliances (All Kinds)', type: 'cooker', x: 732, y: 42, w: 81, h: 117 },
  { id: 'rice-cooker-1', name: 'Rice Cooker', section: '9. General Electronics & Appliances (All Kinds)', type: 'cooker', x: 819, y: 42, w: 78, h: 117 },
  { id: 'vacuum-cleaner-1', name: 'Vacuum Cleaner', section: '9. General Electronics & Appliances (All Kinds)', type: 'generic', x: 905, y: 42, w: 79, h: 117 },
  { id: 'smart-tv-1', name: 'Smart TV', section: '9. General Electronics & Appliances (All Kinds)', type: 'tv', x: 994, y: 42, w: 78, h: 117 },
  { id: 'ceiling-light-1', name: 'Ceiling Light', section: '10. Lighting (All Kinds)', type: 'light', x: 24, y: 235, w: 76, h: 100 },
  { id: 'led-strip-1', name: 'LED Strip', section: '10. Lighting (All Kinds)', type: 'light', x: 108, y: 235, w: 76, h: 100 },
  { id: 'desk-lamp-1', name: 'Desk Lamp', section: '10. Lighting (All Kinds)', type: 'light', x: 192, y: 235, w: 76, h: 100 },
  { id: 'garden-light-1', name: 'Garden Light', section: '10. Lighting (All Kinds)', type: 'light', x: 276, y: 235, w: 76, h: 100 },
  { id: 'emergency-light-1', name: 'Emergency Light', section: '10. Lighting (All Kinds)', type: 'light', x: 360, y: 235, w: 76, h: 100 },
  { id: 'stage-light-1', name: 'Stage Light', section: '10. Lighting (All Kinds)', type: 'light', x: 444, y: 235, w: 76, h: 100 },
  { id: 'car-1', name: 'Car', section: '11. Vehicles & Heavy Machines', type: 'car', x: 558, y: 235, w: 76, h: 100 },
  { id: 'motorcycle-1', name: 'Motorcycle', section: '11. Vehicles & Heavy Machines', type: 'car', x: 642, y: 235, w: 76, h: 100 },
  { id: 'e-scooter-1', name: 'E-Scooter', section: '11. Vehicles & Heavy Machines', type: 'car', x: 726, y: 235, w: 76, h: 100 },
  { id: 'truck-1', name: 'Truck', section: '11. Vehicles & Heavy Machines', type: 'car', x: 810, y: 235, w: 76, h: 100 },
  { id: 'forklift-1', name: 'Forklift', section: '11. Vehicles & Heavy Machines', type: 'machine', x: 894, y: 235, w: 76, h: 100 },
  { id: 'excavator-1', name: 'Excavator', section: '11. Vehicles & Heavy Machines', type: 'machine', x: 978, y: 235, w: 76, h: 100 },
  { id: 'dishwasher-1', name: 'Dishwasher', section: '12. Kitchen, Audio & Home', type: 'dishwasher', x: 24, y: 399, w: 76, h: 100 },
  { id: 'induction-cooker-1', name: 'Induction Cooker', section: '12. Kitchen, Audio & Home', type: 'cooker', x: 108, y: 399, w: 76, h: 100 },
  { id: 'water-heater-1', name: 'Water Heater', section: '12. Kitchen, Audio & Home', type: 'cooker', x: 192, y: 399, w: 76, h: 100 },
  { id: 'subwoofer-1', name: 'Subwoofer', section: '12. Kitchen, Audio & Home', type: 'subwoofer', x: 276, y: 399, w: 76, h: 100 },
  { id: 'soundbar-1', name: 'Soundbar', section: '12. Kitchen, Audio & Home', type: 'speaker', x: 360, y: 399, w: 76, h: 100 },
  { id: 'air-purifier-1', name: 'Air Purifier', section: '12. Kitchen, Audio & Home', type: 'fan', x: 444, y: 399, w: 76, h: 100 },
  { id: 'garage-door-1', name: 'Garage Door', section: '13. Doors, Gates & Outdoor', type: 'barrier', x: 558, y: 399, w: 76, h: 100 },
  { id: 'sliding-gate-1', name: 'Sliding Gate', section: '13. Doors, Gates & Outdoor', type: 'barrier', x: 642, y: 399, w: 76, h: 100 },
  { id: 'curtain-1', name: 'Curtain', section: '13. Doors, Gates & Outdoor', type: 'barrier', x: 726, y: 399, w: 76, h: 100 },
  { id: 'smart-doorbell-1', name: 'Smart Doorbell', section: '13. Doors, Gates & Outdoor', type: 'generic', x: 810, y: 399, w: 76, h: 100 },
  { id: 'irrigation-1', name: 'Irrigation', section: '13. Doors, Gates & Outdoor', type: 'generic', x: 894, y: 399, w: 76, h: 100 },
  { id: 'water-tank-1', name: 'Water Tank', section: '13. Doors, Gates & Outdoor', type: 'sensor', x: 978, y: 399, w: 76, h: 100 },
];
