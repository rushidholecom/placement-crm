import Link from "next/link";
import { Search } from "lucide-react";
import { HR_PRIORITIES, HR_STATUSES } from "@/lib/hr/constants";
import { formatHrPriority, formatHrStatus } from "@/lib/hr/format";
import type { HrQueryInput } from "@/lib/hr/validators";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type CompanyOption = {
  id: string;
  name: string;
};

type HrFiltersProps = {
  filters: HrQueryInput;
  companies: CompanyOption[];
  cities: string[];
};

export function HrFilters({ filters, companies, cities }: HrFiltersProps) {
  return (
    <form className="grid gap-4 rounded-3xl border border-slate-200/80 bg-white/90 p-5 dark:border-slate-800 dark:bg-slate-900/90 xl:grid-cols-[2fr_1.2fr_1fr_1fr_1fr_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
        <Input
          name="search"
          defaultValue={filters.search}
          placeholder="Search HR, company, email, phone, city"
          className="pl-9"
        />
      </div>

      <Select name="companyId" defaultValue={filters.companyId}>
        <option value="">All companies</option>
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name}
          </option>
        ))}
      </Select>

      <Select name="priority" defaultValue={filters.priority ?? ""}>
        <option value="">All priorities</option>
        {HR_PRIORITIES.map((priority) => (
          <option key={priority} value={priority}>
            {formatHrPriority(priority)}
          </option>
        ))}
      </Select>

      <Select name="status" defaultValue={filters.status ?? ""}>
        <option value="">All statuses</option>
        {HR_STATUSES.map((status) => (
          <option key={status} value={status}>
            {formatHrStatus(status)}
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
        <Link href="/dashboard/hr" className={buttonVariants({ variant: "outline" })}>
          Reset
        </Link>
      </div>
    </form>
  );
}
