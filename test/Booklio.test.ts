import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { Booklio } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Booklio Smart Contract", function () {
  let booklio: Booklio;
  let owner: HardhatEthersSigner;
  let providerA: HardhatEthersSigner;
  let providerB: HardhatEthersSigner;
  let customer1: HardhatEthersSigner;
  let customer2: HardhatEthersSigner;
  let stranger: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, providerA, providerB, customer1, customer2, stranger] = await ethers.getSigners();

    const BooklioFactory = await ethers.getContractFactory("Booklio");
    booklio = await BooklioFactory.deploy();
    await booklio.waitForDeployment();
  });

  describe("Service Creation", function () {
    it("should allow a provider to create a service", async function () {
      const tx = await booklio.connect(providerA).createService(
        "Web3 Consulting",
        "Expert blockchain architecture advisory"
      );

      await expect(tx)
        .to.emit(booklio, "ServiceCreated")
        .withArgs(1, "Web3 Consulting", "Expert blockchain architecture advisory", providerA.address);

      const service = await booklio.services(1);
      expect(service.id).to.equal(1);
      expect(service.name).to.equal("Web3 Consulting");
      expect(service.description).to.equal("Expert blockchain architecture advisory");
      expect(service.owner).to.equal(providerA.address);
      expect(service.active).to.be.true;

      const allServices = await booklio.getAllServices();
      expect(allServices.length).to.equal(1);
      expect(allServices[0].name).to.equal("Web3 Consulting");
    });

    it("should reject creating a service with an empty name", async function () {
      await expect(
        booklio.connect(providerA).createService("", "Description")
      ).to.be.revertedWith("Service name cannot be empty");
    });
  });

  describe("Appointment Slot Management", function () {
    let serviceId: bigint;

    beforeEach(async function () {
      const tx = await booklio.connect(providerA).createService("Code Review", "Smart contract security review");
      await tx.wait();
      serviceId = 1n;
    });

    it("should allow the service owner to create future slots", async function () {
      const now = await time.latest();
      const futureTime = now + 3600; // 1 hour from now

      const tx = await booklio.connect(providerA).createSlot(serviceId, futureTime);
      await expect(tx)
        .to.emit(booklio, "SlotCreated")
        .withArgs(1, serviceId, futureTime);

      const slots = await booklio.getAvailableSlots(serviceId);
      expect(slots.length).to.equal(1);
      expect(slots[0].appointmentTime).to.equal(futureTime);
      expect(slots[0].isAvailable).to.be.true;
    });

    it("should reject slot creation from non-owners", async function () {
      const now = await time.latest();
      const futureTime = now + 3600;

      await expect(
        booklio.connect(providerB).createSlot(serviceId, futureTime)
      ).to.be.revertedWith("Only service owner can create slots");
    });

    it("should reject slot creation with past timestamp", async function () {
      const now = await time.latest();
      const pastTime = now - 100;

      await expect(
        booklio.connect(providerA).createSlot(serviceId, pastTime)
      ).to.be.revertedWith("Appointment time must be in future");
    });

    it("should reject slot creation for invalid service ID", async function () {
      const now = await time.latest();
      await expect(
        booklio.connect(providerA).createSlot(999, now + 3600)
      ).to.be.revertedWith("Invalid service ID");
    });
  });

  describe("Slot Booking & Double Booking Prevention", function () {
    let slotId: bigint;
    let appointmentTimestamp: number;

    beforeEach(async function () {
      await booklio.connect(providerA).createService("Dev Mentorship", "1-on-1 technical mentoring");
      const now = await time.latest();
      appointmentTimestamp = now + 7200; // 2 hours in future
      await booklio.connect(providerA).createSlot(1, appointmentTimestamp);
      slotId = 1n;
    });

    it("should allow a customer to book an available slot", async function () {
      const tx = await booklio.connect(customer1).bookSlot(slotId);

      await expect(tx)
        .to.emit(booklio, "SlotBooked")
        .withArgs(1, slotId, 1, customer1.address, providerA.address, appointmentTimestamp);

      const booking = await booklio.bookings(1);
      expect(booking.customer).to.equal(customer1.address);
      expect(booking.serviceOwner).to.equal(providerA.address);
      expect(booking.status).to.equal(0); // BookingStatus.Pending

      // Slot must be marked unavailable
      const slot = await booklio.slots(slotId);
      expect(slot.isAvailable).to.be.false;

      // Available slots list must be empty now
      const available = await booklio.getAvailableSlots(1);
      expect(available.length).to.equal(0);
    });

    it("should strictly prevent double-booking the same slot", async function () {
      // First customer books
      await booklio.connect(customer1).bookSlot(slotId);

      // Second customer tries to book the same slot
      await expect(
        booklio.connect(customer2).bookSlot(slotId)
      ).to.be.revertedWith("Slot is already booked or unavailable");
    });

    it("should prevent the service owner from booking their own service", async function () {
      await expect(
        booklio.connect(providerA).bookSlot(slotId)
      ).to.be.revertedWith("Cannot book your own service");
    });

    it("should prevent booking a past slot if time elapsed before booking", async function () {
      // Advance time past appointment
      await time.increaseTo(appointmentTimestamp + 10);

      await expect(
        booklio.connect(customer1).bookSlot(slotId)
      ).to.be.revertedWith("Cannot book past appointment");
    });
  });

  describe("Booking Confirmation & Cancellation Permissions", function () {
    let bookingId: bigint;

    beforeEach(async function () {
      await booklio.connect(providerA).createService("Design Review", "UX/UI feedback");
      const now = await time.latest();
      await booklio.connect(providerA).createSlot(1, now + 86400); // 1 day in future
      await booklio.connect(customer1).bookSlot(1);
      bookingId = 1n;
    });

    it("should allow service owner to confirm a pending booking", async function () {
      const tx = await booklio.connect(providerA).confirmBooking(bookingId);
      await expect(tx)
        .to.emit(booklio, "BookingConfirmed")
        .withArgs(bookingId, providerA.address);

      const booking = await booklio.bookings(bookingId);
      expect(booking.status).to.equal(1); // Confirmed
    });

    it("should prevent non-service-owners from confirming a booking", async function () {
      // Customer cannot confirm
      await expect(
        booklio.connect(customer1).confirmBooking(bookingId)
      ).to.be.revertedWith("Only service owner can confirm booking");

      // Stranger cannot confirm
      await expect(
        booklio.connect(stranger).confirmBooking(bookingId)
      ).to.be.revertedWith("Only service owner can confirm booking");
    });

    it("should allow customer to cancel their booking and reopen future slot", async function () {
      const tx = await booklio.connect(customer1).cancelBooking(bookingId);
      await expect(tx)
        .to.emit(booklio, "BookingCancelled")
        .withArgs(bookingId, customer1.address);

      const booking = await booklio.bookings(bookingId);
      expect(booking.status).to.equal(2); // Cancelled

      // Future slot is reopened
      const slot = await booklio.slots(1);
      expect(slot.isAvailable).to.be.true;
    });

    it("should allow service owner to cancel a booking", async function () {
      const tx = await booklio.connect(providerA).cancelBooking(bookingId);
      await expect(tx)
        .to.emit(booklio, "BookingCancelled")
        .withArgs(bookingId, providerA.address);

      const booking = await booklio.bookings(bookingId);
      expect(booking.status).to.equal(2); // Cancelled
    });

    it("should prevent unauthorized accounts from cancelling a booking", async function () {
      await expect(
        booklio.connect(stranger).cancelBooking(bookingId)
      ).to.be.revertedWith("Not authorized to cancel this booking");
    });
  });

  describe("Queries & Dashboard Statistics", function () {
    it("should accurately track stats and return user bookings", async function () {
      // Initially 0
      let stats = await booklio.getDashboardStats();
      expect(stats.totalServices).to.equal(0);
      expect(stats.availableSlotsCount).to.equal(0);
      expect(stats.totalBookingsCount).to.equal(0);
      expect(stats.confirmedBookingsCount).to.equal(0);

      // Create service
      await booklio.connect(providerA).createService("Fitness Training", "Personalized workout");
      const now = await time.latest();
      await booklio.connect(providerA).createSlot(1, now + 5000);
      await booklio.connect(providerA).createSlot(1, now + 10000);

      stats = await booklio.getDashboardStats();
      expect(stats.totalServices).to.equal(1);
      expect(stats.availableSlotsCount).to.equal(2);

      // Book 1 slot
      await booklio.connect(customer1).bookSlot(1);
      stats = await booklio.getDashboardStats();
      expect(stats.availableSlotsCount).to.equal(1);
      expect(stats.totalBookingsCount).to.equal(1);
      expect(stats.confirmedBookingsCount).to.equal(0);

      // Confirm booking
      await booklio.connect(providerA).confirmBooking(1);
      stats = await booklio.getDashboardStats();
      expect(stats.confirmedBookingsCount).to.equal(1);

      // Check getMyBookings for customer
      const customerBookings = await booklio.connect(customer1).getMyBookings();
      expect(customerBookings.length).to.equal(1);
      expect(customerBookings[0].customer).to.equal(customer1.address);

      // Check getMyBookingsDetailed
      const detailed = await booklio.connect(customer1).getMyBookingsDetailed();
      expect(detailed.length).to.equal(1);
      expect(detailed[0].serviceName).to.equal("Fitness Training");
    });
  });
});
