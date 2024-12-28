import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { db } from './db';
import { users } from './db/schema';
import { createSession, decrypt } from './app/lib/session';
import { NextURL } from 'next/dist/server/web/next-url';

async function isAuthenticated(request: NextRequest) {
  const session = request.cookies.get('session');
  if (!session) {
    return false;
  }
  const sessionPayload = await decrypt(session.value);
  return !!sessionPayload;
}

export default async function middleware(request: NextRequest) {
  // console.log('middleware');
  // console.log(request.nextUrl);
  // if (request.nextUrl.pathname === '/') {
  //   if (!request.cookies.get('session')) {
  //     const userInsertResult = (await db
  //       .insert(users)
  //       .values({})
  //       .$returningId()) as {
  //       id: string;
  //     }[];
  //     if (!userInsertResult || !userInsertResult[0]) {
  //       throw new Error('Failed to create user');
  //     }
  //     await createSession(userInsertResult[0].id);
  //     return NextResponse.next();
  //   } else if (await isAuthenticated(request)) {
  //     return NextResponse.next();
  //   }
  // }
  if (
    request.nextUrl.pathname.includes('/submission') &&
    !(await isAuthenticated(request))
  ) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }
  return NextResponse.next();
}

// This function can be marked `async` if using `await` inside
// async function middleware(request: NextRequest) {
//   console.log('middleware');
//   console.log(request.nextUrl);
//   if (request.nextUrl.pathname === '/') {
//     if (!request.cookies.get('session')) {
//       const userInsertResult = (await db
//         .insert(users)
//         .values({})
//         .$returningId()) as {
//         id: string;
//       }[];
//       if (!userInsertResult || !userInsertResult[0]) {
//         throw new Error('Failed to create user');
//       }
//       await createSession(userInsertResult[0].id);
//       return NextResponse.next();
//     } else if (await isAuthenticated(request)) {
//       return NextResponse.next();
//     }
//   }

//   if (
//     request.nextUrl.pathname.includes('/submission') &&
//     (await isAuthenticated(request))
//   ) {
//     return NextResponse.next();
//   }

//   return NextResponse.redirect(new URL('/'));
// }
