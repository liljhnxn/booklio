export const BOOKLIO_ABI = [
  {
    type: "function",
    name: "createService",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "description", type: "string" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "createSlot",
    stateMutability: "nonpayable",
    inputs: [
      { name: "serviceId", type: "uint256" },
      { name: "appointmentTime", type: "uint256" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "bookSlot",
    stateMutability: "nonpayable",
    inputs: [{ name: "slotId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "confirmBooking",
    stateMutability: "nonpayable",
    inputs: [{ name: "bookingId", type: "uint256" }],
    outputs: []
  },
  {
    type: "function",
    name: "cancelBooking",
    stateMutability: "nonpayable",
    inputs: [{ name: "bookingId", type: "uint256" }],
    outputs: []
  },
  {
    type: "function",
    name: "getAllServices",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "name", type: "string" },
          { name: "description", type: "string" },
          { name: "owner", type: "address" },
          { name: "active", type: "bool" }
        ]
      }
    ]
  },
  {
    type: "function",
    name: "getAvailableSlots",
    stateMutability: "view",
    inputs: [{ name: "serviceId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "serviceId", type: "uint256" },
          { name: "appointmentTime", type: "uint256" },
          { name: "isAvailable", type: "bool" }
        ]
      }
    ]
  },
  {
    type: "function",
    name: "getAllSlotsForService",
    stateMutability: "view",
    inputs: [{ name: "serviceId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "serviceId", type: "uint256" },
          { name: "appointmentTime", type: "uint256" },
          { name: "isAvailable", type: "bool" }
        ]
      }
    ]
  },
  {
    type: "function",
    name: "getMyBookings",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "slotId", type: "uint256" },
          { name: "customer", type: "address" },
          { name: "serviceOwner", type: "address" },
          { name: "bookingTime", type: "uint256" },
          { name: "status", type: "uint8" }
        ]
      }
    ]
  },
  {
    type: "function",
    name: "getMyBookingsDetailed",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "slotId", type: "uint256" },
          { name: "serviceId", type: "uint256" },
          { name: "serviceName", type: "string" },
          { name: "appointmentTime", type: "uint256" },
          { name: "customer", type: "address" },
          { name: "serviceOwner", type: "address" },
          { name: "bookingTime", type: "uint256" },
          { name: "status", type: "uint8" }
        ]
      }
    ]
  },
  {
    type: "function",
    name: "getDashboardStats",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "totalServices", type: "uint256" },
      { name: "availableSlotsCount", type: "uint256" },
      { name: "totalBookingsCount", type: "uint256" },
      { name: "confirmedBookingsCount", type: "uint256" }
    ]
  },
  {
    type: "event",
    name: "ServiceCreated",
    inputs: [
      { name: "serviceId", type: "uint256", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "description", type: "string", indexed: false },
      { name: "owner", type: "address", indexed: true }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "SlotCreated",
    inputs: [
      { name: "slotId", type: "uint256", indexed: true },
      { name: "serviceId", type: "uint256", indexed: true },
      { name: "appointmentTime", type: "uint256", indexed: false }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "SlotBooked",
    inputs: [
      { name: "bookingId", type: "uint256", indexed: true },
      { name: "slotId", type: "uint256", indexed: true },
      { name: "serviceId", type: "uint256", indexed: true },
      { name: "customer", type: "address", indexed: false },
      { name: "serviceOwner", type: "address", indexed: false },
      { name: "appointmentTime", type: "uint256", indexed: false }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "BookingConfirmed",
    inputs: [
      { name: "bookingId", type: "uint256", indexed: true },
      { name: "confirmedBy", type: "address", indexed: true }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "BookingCancelled",
    inputs: [
      { name: "bookingId", type: "uint256", indexed: true },
      { name: "cancelledBy", type: "address", indexed: true }
    ],
    anonymous: false
  }
] as const;

