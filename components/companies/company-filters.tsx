import Link from "next/link";
import { Search } from "lucide-react";
import { COMPANY_STATUSES } from "@/lib/company/constants";
import { formatCompanyStatus } from "@/lib/company/format";
import type { CompaniesQueryInput } from "@/lib/company/validators";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type CompanyFiltersProps = {
  filters: CompaniesQueryInput;
  industries: string[];
  cities: string[];
};

export function CompanyFilters({
  filters,
  industries,
  cities
}: CompanyFiltersProps) {
  return (
    <form className="grid gap-4 rounded-3xl border border-slate-200/80 bg-white/90 p-5 dark:border-slate-800 dark:bg-slate-900/90 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
        <Input
          name="search"
          defaultValue={filters.search}
          placeholder="Search company, website, city, or industry"
          className="pl-9"
        />
      </div>

      <Select name="status" defaultValue={filters.status ?? ""}>
        <option value="">All statuses</option>
        {COMPANY_STATUSES.map((status) => (
          <option key={status} value={status}>
            {formatCompanyStatus(status)}
          </option>
        ))}
      </Select>

      <Select name="industry" defaultValue={filters.industry}>
        <option value="">All industries</option>
        {industries.map((industry) => (
          <option key={industry} value={industry}>
            {industry}
          </option>
        ))}
      </Select>

      <Select name="city" defaultValue={filters.city}>
        <option value="">All cities</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </Select>

      <div className="flex gap-2">
        <Button type="submit">Apply</Button>
        <Link href="/dashboard/companies" className={buttonVariants({ variant: "outline" })}>
          Reset
        </Link>
      </div>
    </form>
  );
}
