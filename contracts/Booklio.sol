// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Booklio
 * @notice Appointment-booking smart contract for small businesses and freelancers.
 * Tagline: Your bookings, organized.
 */
contract Booklio {
    enum BookingStatus {
        Pending,
        Confirmed,
        Cancelled,
        Completed
    }

    struct Service {
        uint256 id;
        string name;
        string description;
        address owner;
        bool active;
    }

    struct Slot {
        uint256 id;
        uint256 serviceId;
        uint256 appointmentTime;
        bool isAvailable;
    }

    struct Booking {
        uint256 id;
        uint256 slotId;
        address customer;
        address serviceOwner;
        uint256 bookingTime;
        BookingStatus status;
    }

    struct BookingDetail {
        uint256 id;
        uint256 slotId;
        uint256 serviceId;
        string serviceName;
        uint256 appointmentTime;
        address customer;
        address serviceOwner;
        uint256 bookingTime;
        BookingStatus status;
    }

    // Storage counters (1-indexed for IDs)
    uint256 public nextServiceId = 1;
    uint256 public nextSlotId = 1;
    uint256 public nextBookingId = 1;

    // ID to Struct mappings
    mapping(uint256 => Service) public services;
    mapping(uint256 => Slot) public slots;
    mapping(uint256 => Booking) public bookings;

    // Index tracking
    uint256[] private _allServiceIds;
    mapping(uint256 => uint256[]) private _serviceSlotIds;
    uint256[] private _allBookingIds;
    mapping(address => uint256[]) private _userBookingIds;

    // Events
    event ServiceCreated(
        uint256 indexed serviceId,
        string name,
        string description,
        address indexed owner
    );

    event SlotCreated(
        uint256 indexed slotId,
        uint256 indexed serviceId,
        uint256 appointmentTime
    );

    event SlotBooked(
        uint256 indexed bookingId,
        uint256 indexed slotId,
        uint256 indexed serviceId,
        address customer,
        address serviceOwner,
        uint256 appointmentTime
    );

    event BookingConfirmed(
        uint256 indexed bookingId,
        address indexed confirmedBy
    );

    event BookingCancelled(
        uint256 indexed bookingId,
        address indexed cancelledBy
    );

    // Modifiers
    modifier serviceExists(uint256 serviceId) {
        require(serviceId > 0 && serviceId < nextServiceId, "Invalid service ID");
        require(services[serviceId].active, "Service is inactive");
        _;
    }

    modifier slotExists(uint256 slotId) {
        require(slotId > 0 && slotId < nextSlotId, "Invalid slot ID");
        _;
    }

    modifier bookingExists(uint256 bookingId) {
        require(bookingId > 0 && bookingId < nextBookingId, "Invalid booking ID");
        _;
    }

    /**
     * @notice Create a new service
     * @param name Name of the service
     * @param description Brief description of the service
     */
    function createService(string calldata name, string calldata description) external returns (uint256) {
        require(bytes(name).length > 0, "Service name cannot be empty");

        uint256 serviceId = nextServiceId++;
        services[serviceId] = Service({
            id: serviceId,
            name: name,
            description: description,
            owner: msg.sender,
            active: true
        });

        _allServiceIds.push(serviceId);

        emit ServiceCreated(serviceId, name, description, msg.sender);
        return serviceId;
    }

    /**
     * @notice Create an available appointment slot for a service
     * @param serviceId ID of the service
     * @param appointmentTime Unix timestamp for the appointment
     */
    function createSlot(uint256 serviceId, uint256 appointmentTime)
        external
        serviceExists(serviceId)
        returns (uint256)
    {
        require(services[serviceId].owner == msg.sender, "Only service owner can create slots");
        require(appointmentTime > block.timestamp, "Appointment time must be in future");

        uint256 slotId = nextSlotId++;
        slots[slotId] = Slot({
            id: slotId,
            serviceId: serviceId,
            appointmentTime: appointmentTime,
            isAvailable: true
        });

        _serviceSlotIds[serviceId].push(slotId);

        emit SlotCreated(slotId, serviceId, appointmentTime);
        return slotId;
    }

    /**
     * @notice Book an available appointment slot
     * @param slotId ID of the slot to book
     */
    function bookSlot(uint256 slotId)
        external
        slotExists(slotId)
        returns (uint256)
    {
        Slot storage slot = slots[slotId];
        require(slot.isAvailable, "Slot is already booked or unavailable");
        require(slot.appointmentTime > block.timestamp, "Cannot book past appointment");

        Service storage service = services[slot.serviceId];
        require(service.active, "Service is not active");
        require(service.owner != msg.sender, "Cannot book your own service");

        // Mark slot unavailable immediately to prevent double booking
        slot.isAvailable = false;

        uint256 bookingId = nextBookingId++;
        bookings[bookingId] = Booking({
            id: bookingId,
            slotId: slotId,
            customer: msg.sender,
            serviceOwner: service.owner,
            bookingTime: block.timestamp,
            status: BookingStatus.Pending
        });

        _allBookingIds.push(bookingId);
        _userBookingIds[msg.sender].push(bookingId);
        _userBookingIds[service.owner].push(bookingId);

        emit SlotBooked(
            bookingId,
            slotId,
            slot.serviceId,
            msg.sender,
            service.owner,
            slot.appointmentTime
        );

        return bookingId;
    }

    /**
     * @notice Confirm a pending booking (Service owner only)
     * @param bookingId ID of the booking to confirm
     */
    function confirmBooking(uint256 bookingId)
        external
        bookingExists(bookingId)
    {
        Booking storage booking = bookings[bookingId];
        require(msg.sender == booking.serviceOwner, "Only service owner can confirm booking");
        require(booking.status == BookingStatus.Pending, "Booking is not in pending status");

        booking.status = BookingStatus.Confirmed;
        emit BookingConfirmed(bookingId, msg.sender);
    }

    /**
     * @notice Cancel a booking (Customer or Service Owner only)
     * @param bookingId ID of the booking to cancel
     */
    function cancelBooking(uint256 bookingId)
        external
        bookingExists(bookingId)
    {
        Booking storage booking = bookings[bookingId];
        require(
            msg.sender == booking.customer || msg.sender == booking.serviceOwner,
            "Not authorized to cancel this booking"
        );
        require(
            booking.status == BookingStatus.Pending || booking.status == BookingStatus.Confirmed,
            "Cannot cancel booking in current status"
        );

        booking.status = BookingStatus.Cancelled;

        // If the appointment is still in the future, reopen the slot for booking
        Slot storage slot = slots[booking.slotId];
        if (slot.appointmentTime > block.timestamp) {
            slot.isAvailable = true;
        }

        emit BookingCancelled(bookingId, msg.sender);
    }

    /**
     * @notice Retrieve all active services
     */
    function getAllServices() external view returns (Service[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < _allServiceIds.length; i++) {
            if (services[_allServiceIds[i]].active) {
                activeCount++;
            }
        }

        Service[] memory activeServices = new Service[](activeCount);
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < _allServiceIds.length; i++) {
            uint256 sId = _allServiceIds[i];
            if (services[sId].active) {
                activeServices[currentIndex] = services[sId];
                currentIndex++;
            }
        }

        return activeServices;
    }

    /**
     * @notice Retrieve available future slots for a given service
     * @param serviceId ID of the service
     */
    function getAvailableSlots(uint256 serviceId)
        external
        view
        serviceExists(serviceId)
        returns (Slot[] memory)
    {
        uint256[] storage slotIds = _serviceSlotIds[serviceId];
        uint256 availableCount = 0;

        for (uint256 i = 0; i < slotIds.length; i++) {
            Slot storage slot = slots[slotIds[i]];
            if (slot.isAvailable && slot.appointmentTime > block.timestamp) {
                availableCount++;
            }
        }

        Slot[] memory availableSlots = new Slot[](availableCount);
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < slotIds.length; i++) {
            Slot storage slot = slots[slotIds[i]];
            if (slot.isAvailable && slot.appointmentTime > block.timestamp) {
                availableSlots[currentIndex] = slot;
                currentIndex++;
            }
        }

        return availableSlots;
    }

    /**
     * @notice Retrieve all slots (both available and booked) for a given service
     * @dev Helpful for service owners to manage all their slots
     * @param serviceId ID of the service
     */
    function getAllSlotsForService(uint256 serviceId)
        external
        view
        serviceExists(serviceId)
        returns (Slot[] memory)
    {
        uint256[] storage slotIds = _serviceSlotIds[serviceId];
        Slot[] memory serviceSlotsList = new Slot[](slotIds.length);
        for (uint256 i = 0; i < slotIds.length; i++) {
            serviceSlotsList[i] = slots[slotIds[i]];
        }
        return serviceSlotsList;
    }

    /**
     * @notice Retrieve raw bookings belonging to the connected wallet (as customer or owner)
     */
    function getMyBookings() external view returns (Booking[] memory) {
        uint256[] storage userBIds = _userBookingIds[msg.sender];
        Booking[] memory userBookingsList = new Booking[](userBIds.length);
        for (uint256 i = 0; i < userBIds.length; i++) {
            userBookingsList[i] = bookings[userBIds[i]];
        }
        return userBookingsList;
    }

    /**
     * @notice Retrieve detailed bookings with service name and appointment time
     * @dev Single-call convenience for high performance UI rendering
     */
    function getMyBookingsDetailed() external view returns (BookingDetail[] memory) {
        uint256[] storage userBIds = _userBookingIds[msg.sender];
        BookingDetail[] memory details = new BookingDetail[](userBIds.length);

        for (uint256 i = 0; i < userBIds.length; i++) {
            Booking storage b = bookings[userBIds[i]];
            Slot storage s = slots[b.slotId];
            Service storage srv = services[s.serviceId];

            details[i] = BookingDetail({
                id: b.id,
                slotId: b.slotId,
                serviceId: s.serviceId,
                serviceName: srv.name,
                appointmentTime: s.appointmentTime,
                customer: b.customer,
                serviceOwner: b.serviceOwner,
                bookingTime: b.bookingTime,
                status: b.status
            });
        }
        return details;
    }

    /**
     * @notice Retrieve total dashboard statistics
     */
    function getDashboardStats()
        external
        view
        returns (
            uint256 totalServices,
            uint256 availableSlotsCount,
            uint256 totalBookingsCount,
            uint256 confirmedBookingsCount
        )
    {
        totalServices = _allServiceIds.length;
        totalBookingsCount = _allBookingIds.length;

        for (uint256 i = 0; i < _allBookingIds.length; i++) {
            if (bookings[_allBookingIds[i]].status == BookingStatus.Confirmed) {
                confirmedBookingsCount++;
            }
        }

        for (uint256 i = 1; i < nextSlotId; i++) {
            if (slots[i].isAvailable && slots[i].appointmentTime > block.timestamp) {
                availableSlotsCount++;
            }
        }
    }
}

