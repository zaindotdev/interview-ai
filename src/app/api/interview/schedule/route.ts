// import { NextRequest, NextResponse } from "next/server";
// import { google } from "googleapis";
// import { getOAuthClient } from "@/lib/google";

// export async function GET(_req: NextRequest) {
//   try {
//     const auth = getOAuthClient();               
//     const calendar = google.calendar({ version: "v3", auth });

//     const {data} = await google.calendar.list({
//         calenderId:"primary",
//         auth,
//         timeMin: new Date().toISOString(),
//         showDeleted: false,
//         singleEvents: true
//     })

//     return NextResponse.json(
//       { status: 200, message: "Events fetched", data: data.items },
//       { status: 200 },
//     );
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json(
//       { status: 500, message: (err as Error).message },
//       { status: 500 },
//     );
//   }
// }
