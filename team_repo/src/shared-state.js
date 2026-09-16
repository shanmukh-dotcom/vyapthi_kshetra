/**
 * VYAPTI KSHETRA - Shared Application State
 * Central Data Layer for synchronizing Farmer and Buyer interfaces.
 */

const SHARED_DB_KEY = 'vyapti_shared_db';
const EVENTS = {
  DATA_CHANGED: 'vyapti:data_changed',
};

// Initial Demo State
const INITIAL_DB = {
  farmers: {
    'farmer-ramesh': {
      id: 'farmer-ramesh',
      name: 'Ramesh Kumar',
      location: 'Krishna District, Andhra Pradesh',
      role: 'Farmer',
      farmName: 'Chennuboina Farm',
      mobile: '9876543210'
    },
    'farmer-lakshmi': {
      id: 'farmer-lakshmi',
      name: 'Lakshmi Devi',
      location: 'Krishna District, Andhra Pradesh',
      role: 'Farmer',
      farmName: 'Sri Venkateshwara Farm',
      mobile: '9876543211'
    }
  },
  supplies: {
    'supply-ramesh-tomato': {
      id: 'supply-ramesh-tomato',
      farmerId: 'farmer-ramesh',
      crop: 'Tomato',
      quantity: 5000,
      grade: 'Grade A',
      availability: 'Available',
      location: 'Krishna District, Andhra Pradesh'
    },
    'supply-lakshmi-tomato': {
      id: 'supply-lakshmi-tomato',
      farmerId: 'farmer-lakshmi',
      crop: 'Tomato',
      quantity: 3500,
      grade: 'Grade A',
      availability: 'Available',
      location: 'Krishna District, Andhra Pradesh'
    }
  },
  buyers: {
    'buyer-greenbite': {
      id: 'buyer-greenbite',
      name: 'Sharan',
      role: 'Procurement Manager',
      company: 'GreenBite Foods Pvt. Ltd.',
      location: 'Vijayawada, Andhra Pradesh'
    }
  },
  requirements: {}, // Will be populated by the buyer
  orders: {} 
};

class SharedState {
  constructor() {
    this.db = this.loadDB();
    this.channel = new BroadcastChannel('vyapti_channel');
    
    // Listen to changes from other tabs
    this.channel.onmessage = (event) => {
      if (event.data.type === EVENTS.DATA_CHANGED) {
        this.db = this.loadDB();
        window.dispatchEvent(new CustomEvent(EVENTS.DATA_CHANGED));
      }
    };
  }

  loadDB() {
    try {
      const stored = localStorage.getItem(SHARED_DB_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading shared DB', e);
    }
    // Set initial if empty
    localStorage.setItem(SHARED_DB_KEY, JSON.stringify(INITIAL_DB));
    return JSON.parse(JSON.stringify(INITIAL_DB));
  }

  saveDB() {
    localStorage.setItem(SHARED_DB_KEY, JSON.stringify(this.db));
    this.channel.postMessage({ type: EVENTS.DATA_CHANGED });
    window.dispatchEvent(new CustomEvent(EVENTS.DATA_CHANGED));
  }

  // --- CRUD Operations ---

  updateFarmerSupply(supplyId, updates) {
    if (this.db.supplies[supplyId]) {
      this.db.supplies[supplyId] = { ...this.db.supplies[supplyId], ...updates };
      this.saveDB();
    }
  }

  addRequirement(req) {
    const id = req.id || 'req-' + Date.now();
    this.db.requirements[id] = { ...req, id, status: 'active' };
    this.saveDB();
    return id;
  }

  updateRequirement(reqId, updates) {
    if (this.db.requirements[reqId]) {
      this.db.requirements[reqId] = { ...this.db.requirements[reqId], ...updates };
      this.saveDB();
    }
  }

  // --- Matching Engine ---

  matchRequirementToFarmers(requirement) {
    const matches = [];
    let totalMatchedQty = 0;

    Object.values(this.db.supplies).forEach(supply => {
      if (supply.availability !== 'Available') return;
      if (supply.crop.toLowerCase() !== requirement.crop.toLowerCase()) return;
      if (requirement.grade && supply.grade !== requirement.grade && requirement.grade !== 'Any') return;
      
      matches.push(supply);
      totalMatchedQty += Number(supply.quantity);
    });

    return {
      matches,
      totalMatchedQty,
      isFullyMatched: totalMatchedQty >= requirement.quantity
    };
  }

  matchFarmerToRequirements(farmerId) {
    const matchedReqs = [];
    
    // Find all supplies for this farmer
    const supplies = Object.values(this.db.supplies).filter(s => s.farmerId === farmerId && s.availability === 'Available');
    
    Object.values(this.db.requirements).forEach(req => {
      if (req.status !== 'active') return;
      
      let isMatch = false;
      supplies.forEach(supply => {
        if (supply.crop.toLowerCase() === req.crop.toLowerCase()) {
          if (!req.grade || req.grade === 'Any' || req.grade === supply.grade) {
            isMatch = true;
          }
        }
      });
      
      if (isMatch) {
        matchedReqs.push(req);
      }
    });

    return matchedReqs;
  }
}

export const sharedState = new SharedState();
