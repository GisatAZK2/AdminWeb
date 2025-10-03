

import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { query, variables } = await request.json();

    const response = await fetch("https://backboard.railway.app/graphql/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RAILWAY_API_TOKEN}`, // 🔒 simpan di .env.local
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch Railway API", details: err.message },
      { status: 500 }
    );
  }
}
