export type DiariumSearchParameterName =
  | "SearchText"
  | "FromDate"
  | "ToDate"
  | "SelectedArendeProcess"
  | "SelectedHandlingType"
  | "SelectedCounty"
  | "SelectedMunicipality"
  | "OnlyActive"
  | "SelectedSortOrder";

export type DiariumSearchParameters = Partial<
  Record<DiariumSearchParameterName, string>
>;

export function generateDiariumUrl(params: DiariumSearchParameters): string {
  const url = new URL(
    "https://www.av.se/om-oss/diarium-och-allmanna-handlingar/bestall-handlingar/",
  );
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.append(key, value);
    }
  });
  return url.toString();
}
