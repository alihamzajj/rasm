-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Hall" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "capacityMin" INTEGER NOT NULL,
    "capacityMax" INTEGER NOT NULL,
    "pricePerHead" INTEGER NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "amenities" TEXT NOT NULL DEFAULT '[]',
    "photos" TEXT NOT NULL DEFAULT '[]',
    "rating" REAL NOT NULL DEFAULT 0,
    "approved" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Hall_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photos" TEXT NOT NULL DEFAULT '[]',
    "rating" REAL NOT NULL DEFAULT 0,
    "approved" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vendor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hallId" TEXT,
    "vendorId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    CONSTRAINT "Package_hallId_fkey" FOREIGN KEY ("hallId") REFERENCES "Hall" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Package_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hallId" TEXT,
    "vendorId" TEXT,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "heldUntil" DATETIME,
    "heldByBooking" TEXT,
    CONSTRAINT "Availability_hallId_fkey" FOREIGN KEY ("hallId") REFERENCES "Hall" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Availability_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventDate" TEXT NOT NULL,
    "guests" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "advanceAmount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BookingItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "packageId" TEXT,
    "label" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'requested',
    CONSTRAINT "BookingItem_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT,
    "authorName" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "photos" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Availability_status_heldUntil_idx" ON "Availability"("status", "heldUntil");

-- CreateIndex
CREATE UNIQUE INDEX "Availability_hallId_date_key" ON "Availability"("hallId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Availability_vendorId_date_key" ON "Availability"("vendorId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_code_key" ON "Booking"("code");
