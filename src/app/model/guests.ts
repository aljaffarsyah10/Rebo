import type { pilar } from '@prisma/client'; // Importing the Guest type from the Prisma client library.
import { db } from '@/app/db';
import { notFound } from 'next/navigation'; // Importing the notFound function from Next.js for handling 404 errors.

export async function fetchGuests(): Promise<guestdata[]> {
  // Function to fetch all guests from the database.
  return await db.guestdata.findMany({
    orderBy: [
      {
        id: 'asc'
      }
    ]
  });
}

export async function fetchGuestById(id: number): Promise<guestdata | null> {
  // Function to fetch a single guest by its ID.
  const guest = await db.guestdata.findFirst({
    where: {
      id
    }
  });

  if (!guest) {
    notFound(); // If the guest is not found, a 404 error is thrown.
  }

  return guest;
}
