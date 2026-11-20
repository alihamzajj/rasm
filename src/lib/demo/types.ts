export type Role = "customer" | "hall_owner" | "vendor" | "admin";

export type User = { id: string; name: string; phone: string; email: string; role: Role | string };
export type Hall = {
  id: string; ownerId: string; name: string; city: string; area: string; type: string; description: string;
  capacityMin: number; capacityMax: number; pricePerHead: number; basePrice: number;
  amenities: string[]; photos: string[]; rating: number; approved: string; createdAt: string;
};
export type Vendor = {
  id: string; userId: string; category: string; businessName: string; city: string; description: string;
  photos: string[]; rating: number; approved: string; createdAt: string;
};
export type Package = { id: string; hallId: string | null; vendorId: string | null; name: string; description: string; price: number };
export type Availability = { id: string; hallId: string | null; vendorId: string | null; date: string; status: string; heldUntil: string | null; heldByBooking: string | null };
export type Booking = { id: string; code: string; customerId: string; eventName: string; eventDate: string; guests: number; status: string; totalAmount: number; advanceAmount: number; createdAt: string };
export type BookingItem = { id: string; bookingId: string; type: string; refId: string; packageId: string | null; label: string; price: number; status: string };
export type Payment = { id: string; bookingId: string; amount: number; status: string; method: string; createdAt: string };
export type Review = { id: string; bookingId: string | null; authorName: string; targetType: string; targetId: string; rating: number; comment: string; createdAt: string };

export type DB = {
  users: User[];
  halls: Hall[];
  vendors: Vendor[];
  packages: Package[];
  availability: Availability[];
  bookings: Booking[];
  items: BookingItem[];
  payments: Payment[];
  reviews: Review[];
  commissionPercent: number;
};

export type DayStatus = { date: string; status: "booked" | "held" | "blocked" };
export type CartLine = { type: "hall" | "vendor"; refId: string; packageId: string };
