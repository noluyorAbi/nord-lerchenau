import { NextResponse } from "next/server";

import { findRosterPlayer, getFupaTeamRoster } from "@/lib/fupa";

type Ctx = { params: Promise<{ teamSlug: string; playerId: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const { teamSlug, playerId } = await params;

  if (!/^[a-z0-9-]+$/i.test(teamSlug)) {
    return NextResponse.json({ error: "invalid_team_slug" }, { status: 400 });
  }

  const roster = await getFupaTeamRoster(teamSlug);
  if (!roster) {
    return NextResponse.json({ error: "team_not_found" }, { status: 404 });
  }

  const player = findRosterPlayer(roster.players, playerId);
  if (!player) {
    return NextResponse.json({ error: "player_not_found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      teamSlug,
      player,
      team: {
        clubSlug: roster.info.club?.slug ?? null,
        clubName: roster.info.club?.name ?? null,
      },
      generatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    },
  );
}
