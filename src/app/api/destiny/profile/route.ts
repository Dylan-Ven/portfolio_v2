import { NextResponse } from 'next/server';

type BungieResponse<T> = {
  ErrorCode: number;
  Message: string;
  Response: T;
};

type ProfileResponse = {
  profile?: {
    data?: {
      dateLastPlayed?: string;
      userInfo?: {
        displayName?: string;
      };
      characterIds?: string[];
    };
  };
  characters?: {
    data?: Record<
      string,
      {
        characterId?: string;
        classType?: number;
        light?: number;
        minutesPlayedTotal?: string;
        dateLastPlayed?: string;
      }
    >;
  };
  profileProgression?: {
    data?: {
      seasonalRank?: number;
      triumphs?: Array<{
        hash?: number;
        objectives?: Array<{ complete?: boolean }>;
      }>;
    };
  };
};

type HistoricalStatsResponse = {
  results?: Record<
    string,
    {
      all?: {
        allTime?: Record<string, { basic?: { value?: number } }>;
      };
    }
  >;
};

type ActivityHistoryResponse = {
  activities?: Array<{
    period?: string;
    activityDetails?: {
      instanceId?: string;
    };
    values?: {
      completed?: {
        basic?: {
          value?: number;
        };
      };
      activityDurationSeconds?: {
        basic?: {
          value?: number;
        };
      };
    };
  }>;
};

type RaidRun = {
  characterId: string;
  className: string;
  period: string | null;
  instanceId: string | null;
  durationMinutes: number;
  completed: boolean;
};

const BUNGIE_BASE_URL = 'https://www.bungie.net/Platform';

function classTypeToLabel(classType: number | undefined) {
  if (classType === 0) {
    return 'Titan';
  }
  if (classType === 1) {
    return 'Hunter';
  }
  if (classType === 2) {
    return 'Warlock';
  }
  return 'Unknown';
}

async function fetchBungie<T>(path: string, apiKey: string) {
  const response = await fetch(`${BUNGIE_BASE_URL}${path}`, {
    headers: {
      'X-API-Key': apiKey,
    },
    next: { revalidate: 120 },
  });

  if (!response.ok) {
    throw new Error(`Bungie API returned ${response.status}`);
  }

  return (await response.json()) as BungieResponse<T>;
}

export async function GET() {
  const apiKey = process.env.BUNGIE_API_KEY;
  const membershipType = process.env.DESTINY_MEMBERSHIP_TYPE;
  const membershipId = process.env.DESTINY_MEMBERSHIP_ID;

  if (!apiKey || !membershipType || !membershipId) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Missing env vars. Set BUNGIE_API_KEY, DESTINY_MEMBERSHIP_TYPE, and DESTINY_MEMBERSHIP_ID.',
      },
      { status: 500 }
    );
  }

  try {
    const payload = await fetchBungie<ProfileResponse>(
      `/Destiny2/${membershipType}/Profile/${membershipId}/?components=100,200,101`,
      apiKey
    );

    if (payload.ErrorCode !== 1) {
      return NextResponse.json(
        {
          ok: false,
          error: payload.Message || 'Bungie API error',
          errorCode: payload.ErrorCode,
        },
        { status: 502 }
      );
    }

    const profile = payload.Response?.profile?.data;
    const characterMap = payload.Response?.characters?.data ?? {};

    const characters = Object.values(characterMap).map((character) => {
      const minutesPlayedTotal = Number(character.minutesPlayedTotal ?? 0);

      return {
        characterId: character.characterId ?? 'unknown',
        classType: character.classType ?? -1,
        className: classTypeToLabel(character.classType),
        light: character.light ?? 0,
        minutesPlayedTotal,
        hoursPlayedTotal: Math.round((minutesPlayedTotal / 60) * 10) / 10,
        lastPlayed: character.dateLastPlayed ?? null,
      };
    });

    const totalMinutesPlayed = characters.reduce(
      (sum, character) => sum + character.minutesPlayedTotal,
      0
    );
    const totalHoursPlayed = Math.round((totalMinutesPlayed / 60) * 10) / 10;

    const raidHistories = await Promise.all(
      characters.map(async (character) => {
        if (character.characterId === 'unknown') {
          return [] as RaidRun[];
        }

        const activityPayload = await fetchBungie<ActivityHistoryResponse>(
          `/Destiny2/${membershipType}/Account/${membershipId}/Character/${character.characterId}/Stats/Activities/?count=5&mode=4&page=0`,
          apiKey
        );

        if (activityPayload.ErrorCode !== 1) {
          return [] as RaidRun[];
        }

        return (activityPayload.Response?.activities ?? []).map((activity) => ({
          characterId: character.characterId,
          className: character.className,
          period: activity.period ?? null,
          instanceId: activity.activityDetails?.instanceId ?? null,
          durationMinutes: Math.round(
            (((activity.values?.activityDurationSeconds?.basic?.value ?? 0) as number) / 60) * 10
          ) / 10,
          completed: (activity.values?.completed?.basic?.value ?? 0) >= 1,
        }));
      })
    );

    const recentRaids = raidHistories
      .flat()
      .sort((a, b) => {
        const left = a.period ? new Date(a.period).getTime() : 0;
        const right = b.period ? new Date(b.period).getTime() : 0;
        return right - left;
      })
      .slice(0, 10);

    const raidsCompleted = recentRaids.filter((activity) => activity.completed).length;

    // Extract triumph score and seasonal rank
    const triumphScore = payload.Response?.profileProgression?.data?.seasonalRank ?? 0;
    const seasonalRank = payload.Response?.profileProgression?.data?.seasonalRank ?? 0;

    // Fetch weapon stats to find most-used weapon class
    let favoriteWeapon = 'Unknown';
    try {
      const firstCharacterId = characters[0]?.characterId ?? '0';
      if (firstCharacterId !== '0' && firstCharacterId !== 'unknown') {
        const weaponPayload = await fetchBungie<HistoricalStatsResponse>(
          `/Destiny2/${membershipType}/Account/${membershipId}/Character/${firstCharacterId}/Stats/`,
          apiKey
        );

        if (weaponPayload.ErrorCode === 1) {
          const weaponStats = weaponPayload.Response?.results?.allWeapons?.all?.allTime ?? {};
          const weaponKills: Record<string, number> = {
            auto_rifle_kills: weaponStats.autoRifleKills?.basic?.value ?? 0,
            hand_cannon_kills: weaponStats.handCannonKills?.basic?.value ?? 0,
            pulse_rifle_kills: weaponStats.pulseRifleKills?.basic?.value ?? 0,
            scout_rifle_kills: weaponStats.scoutRifleKills?.basic?.value ?? 0,
            fusion_rifle_kills: weaponStats.fusionRifleKills?.basic?.value ?? 0,
            sniper_rifle_kills: weaponStats.sniperRifleKills?.basic?.value ?? 0,
            shotgun_kills: weaponStats.shotgunKills?.basic?.value ?? 0,
            sword_kills: weaponStats.swordKills?.basic?.value ?? 0,
            rg_kills: weaponStats.rocketLauncherKills?.basic?.value ?? 0,
            linear_fusion_rifle_kills: weaponStats.linearFusionRifleKills?.basic?.value ?? 0,
            trace_rifle_kills: weaponStats.traceRifleKills?.basic?.value ?? 0,
            submachine_gun_kills: weaponStats.submachineGunKills?.basic?.value ?? 0,
          };

          const topWeapon = Object.entries(weaponKills).sort(([, a], [, b]) => b - a)[0];
          if (topWeapon) {
            const weaponNameMap: Record<string, string> = {
              auto_rifle_kills: 'Auto Rifles',
              hand_cannon_kills: 'Hand Cannons',
              pulse_rifle_kills: 'Pulse Rifles',
              scout_rifle_kills: 'Scout Rifles',
              fusion_rifle_kills: 'Fusion Rifles',
              sniper_rifle_kills: 'Sniper Rifles',
              shotgun_kills: 'Shotguns',
              sword_kills: 'Swords',
              rg_kills: 'Rocket Launchers',
              linear_fusion_rifle_kills: 'Linear Fusion Rifles',
              trace_rifle_kills: 'Trace Rifles',
              submachine_gun_kills: 'Submachine Guns',
            };
            favoriteWeapon = weaponNameMap[topWeapon[0]] ?? 'Unknown';
          }
        }
      }
    } catch {
      // Fail silently; weapon stats are optional
    }

    return NextResponse.json(
      {
        ok: true,
        destiny: {
          displayName: profile?.userInfo?.displayName ?? 'Unknown Guardian',
          lastPlayed: profile?.dateLastPlayed ?? null,
          characterCount: characters.length || profile?.characterIds?.length || 0,
          totalMinutesPlayed,
          totalHoursPlayed,
          triumphScore,
          seasonalRank,
          favoriteWeapon,
          characters,
          raidReport: {
            raidsTracked: recentRaids.length,
            raidsCompleted,
            completionRate:
              recentRaids.length > 0 ? Math.round((raidsCompleted / recentRaids.length) * 100) : 0,
            recentRaids,
          },
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 's-maxage=120, stale-while-revalidate=300',
        },
      }
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to contact Bungie API.',
      },
      { status: 502 }
    );
  }
}
