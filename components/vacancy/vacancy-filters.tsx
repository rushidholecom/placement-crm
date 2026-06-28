import Link from "next/link";
import { Search } from "lucide-react";
import { VACANCY_PRIORITIES, VACANCY_STATUSES } from "@/lib/vacancy/constants";
import { formatVacancyPriority, formatVacancyStatus } from "@/lib/vacancy/format";
import type { VacanciesQueryInput } from "@/lib/vacancy/validators";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type CompanyOption = {
  id: string;
  name: string;
  city: string;
};

type VacancyFiltersProps = {
  filters: VacanciesQueryInput;
  companies: CompanyOption[];
  locations: string[];
};

export function VacancyFilters({
  filters,
  companies,
  locations
}: VacancyFiltersProps) {
  return (
    <form className="grid gap-4 rounded-3xl border border-slate-200/80 bg-white/90 p-5 dark:border-slate-800 dark:bg-slate-900/90 xl:grid-cols-[2fr_1.2fr_1fr_1fr_1fr_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
        <Input
          name="search"
          defaultValue={filters.search}
          placeholder="Search title, company, skills, technology, recruiter"
          className="pl-9"
        />
      </div>

      <Select name="companyId" defaultValue={filters.companyId}>
        <option value="">All companies</option>
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name} - {company.city}
          </option>
        ))}
      </Select>

      <Select name="priority" defaultValue={filters.priority ?? ""}>
        <option value="">All priorities</option>
        {VACANCY_PRIORITIES.map((priority) => (
          <option key={priority} value={priority}>
            {formatVacancyPriority(priority)}
          </option>
        ))}
      </Select>

      <Select name="status" defaultValue={filters.status ?? ""}>
        <option value="">All statuses</option>
        {VACANCY_STATUSES.map((status) => (
          <option key={status} value={status}>
            {formatVacancyStatus(status)}
          </option>
        ))}
      </Select>

      <Select name="location" defaultValue={filters.location}>
        <option value="">All locations</option>
        {locations.map((location) => (
          <option key={location} value={location}>
            {location}
          </option>
        ))}
      </Select>

      <div className="flex gap-2">
        <Button type="submit">Apply</Button>
        <Link href="/dashboard/vacancies" className={buttonVariants({ variant: "outline" })}>
          Reset
        </Link>
      </div>
    </form>
  );
}
