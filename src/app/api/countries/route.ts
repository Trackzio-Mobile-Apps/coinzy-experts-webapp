import { NextResponse } from "next/server";

type CountriesNowItem = {
  name: string;
  Iso2: string;
  Iso3: string;
};

type CountriesNowResponse = {
  error: boolean;
  msg: string;
  data: CountriesNowItem[];
};

export type CountryListItem = {
  code: string;
  name: string;
};

const COUNTRIES_API_URL =
  "https://countriesnow.space/api/v0.1/countries/iso";

export async function GET() {
  let response: Response;

  try {
    response = await fetch(COUNTRIES_API_URL, {
      next: { revalidate: 60 * 60 * 24 },
    });
  } catch {
    return NextResponse.json(
      { error: true, message: "Unable to reach countries service.", data: [] },
      { status: 502 },
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: true, message: "Countries service returned an error.", data: [] },
      { status: 502 },
    );
  }

  let payload: CountriesNowResponse;

  try {
    payload = (await response.json()) as CountriesNowResponse;
  } catch {
    return NextResponse.json(
      { error: true, message: "Invalid countries response.", data: [] },
      { status: 502 },
    );
  }

  if (payload.error || !Array.isArray(payload.data)) {
    return NextResponse.json(
      { error: true, message: "Unable to load countries.", data: [] },
      { status: 502 },
    );
  }

  const countries: CountryListItem[] = payload.data
    .filter(
      (item) =>
        typeof item.name === "string" &&
        item.name.trim() &&
        typeof item.Iso2 === "string" &&
        item.Iso2.trim(),
    )
    .map((item) => ({
      code: item.Iso2.trim().toUpperCase(),
      name: item.name.trim(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({
    error: false,
    message: null,
    data: { countries },
  });
}
