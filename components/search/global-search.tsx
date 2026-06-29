"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  LoaderCircle,
  Mail,
  Pencil,
  Phone,
  Search,
  UserRound,
  X
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  GlobalSearchResponse,
  SearchCompanyResult,
  SearchHrResult,
  SearchVacancyResult
} from "@/lib/search/types";

const emptyResults: GlobalSearchResponse = {
  query: "",
  totalCount: 0,
  companies: [],
  hr: [],
  vacancies: []
};

function formatDate(value: string | null) {
  if (!value) {
    return "No follow-up";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium"
  }).format(new Date(value));
}

function ActionButtons({
  phone,
  email,
  editHref
}: {
  phone: string | null;
  email: string | null;
  editHref: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {phone ? (
        <a href={`tel:${phone}`} className={buttonVariants({ size: "sm", variant: "outline" })}>
          <Phone className="h-3.5 w-3.5" />
          Call
        </a>
      ) : null}
      {email ? (
        <a href={`mailto:${email}`} className={buttonVariants({ size: "sm", variant: "outline" })}>
          <Mail className="h-3.5 w-3.5" />
          Email
        </a>
      ) : null}
      <Link href={editHref} className={buttonVariants({ size: "sm", variant: "outline" })}>
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </Link>
    </div>
  );
}

function MetaGrid({
  phone,
  email,
  remark,
  nextFollowUp
}: {
  phone: string | null;
  email: string | null;
  remark: string | null;
  nextFollowUp: string | null;
}) {
  return (
    <div className="mt-3 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
      {phone ? (
        <p className="flex min-w-0 items-center gap-2">
          <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{phone}</span>
        </p>
      ) : null}
      {email ? (
        <p className="flex min-w-0 items-center gap-2">
          <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{email}</span>
        </p>
      ) : null}
      <p className="flex min-w-0 items-center gap-2">
        <CalendarClock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span>{formatDate(nextFollowUp)}</span>
      </p>
      {remark ? (
        <p className="line-clamp-2 text-muted-foreground">{remark}</p>
      ) : null}
    </div>
  );
}

function ResultSection({
  title,
  count,
  children
}: {
  title: string;
  count: number;
  children: ReactNode;
}) {
  if (count === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {count}
        </span>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function CompanyCard({ company, onNavigate }: { company: SearchCompanyResult; onNavigate: () => void }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-amber-500 dark:text-slate-950">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <Link href={company.href} onClick={onNavigate} className="font-semibold text-slate-950 hover:text-amber-700 dark:text-slate-50 dark:hover:text-amber-300">
            {company.name}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            {company.industry} - {company.city}
          </p>
          {company.website ? (
            <p className="mt-1 truncate text-sm text-amber-700 dark:text-amber-300">
              {company.website}
            </p>
          ) : null}
          <MetaGrid
            phone={company.phone}
            email={company.email}
            remark={company.remark}
            nextFollowUp={company.nextFollowUp}
          />
          <div className="mt-4">
            <ActionButtons phone={company.phone} email={company.email} editHref={company.editHref} />
          </div>
        </div>
      </div>
    </article>
  );
}

function HrCard({ contact, onNavigate }: { contact: SearchHrResult; onNavigate: () => void }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          <UserRound className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <Link href={contact.href} onClick={onNavigate} className="font-semibold text-slate-950 hover:text-amber-700 dark:text-slate-50 dark:hover:text-amber-300">
            {contact.fullName}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            {contact.designation} at {contact.companyName} - {contact.city}
          </p>
          {contact.linkedIn ? (
            <p className="mt-1 truncate text-sm text-amber-700 dark:text-amber-300">
              {contact.linkedIn}
            </p>
          ) : null}
          <MetaGrid
            phone={contact.phone}
            email={contact.email}
            remark={contact.remark}
            nextFollowUp={contact.nextFollowUp}
          />
          <div className="mt-4">
            <ActionButtons phone={contact.phone} email={contact.email} editHref={contact.editHref} />
          </div>
        </div>
      </div>
    </article>
  );
}

function VacancyCard({ vacancy, onNavigate }: { vacancy: SearchVacancyResult; onNavigate: () => void }) {
  const detail = [vacancy.location, vacancy.technology, vacancy.skills]
    .filter(Boolean)
    .join(" - ");

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
          <BriefcaseBusiness className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <Link href={vacancy.href} onClick={onNavigate} className="font-semibold text-slate-950 hover:text-amber-700 dark:text-slate-50 dark:hover:text-amber-300">
            {vacancy.title}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            {vacancy.companyName}
          </p>
          {detail ? (
            <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
              {detail}
            </p>
          ) : null}
          <MetaGrid
            phone={vacancy.phone}
            email={vacancy.email}
            remark={vacancy.remark}
            nextFollowUp={vacancy.nextFollowUp}
          />
          <div className="mt-4">
            <ActionButtons phone={vacancy.phone} email={vacancy.email} editHref={vacancy.editHref} />
          </div>
        </div>
      </div>
    </article>
  );
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResponse>(emptyResults);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const trimmedQuery = query.trim();

  const shouldSearch = trimmedQuery.length >= 2;

  useEffect(() => {
    if (!shouldSearch) {
      setResults(emptyResults);
      setIsLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal,
          headers: {
            Accept: "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = (await response.json()) as GlobalSearchResponse;
        setResults(data);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError("Search is unavailable right now.");
          setResults(emptyResults);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [shouldSearch, trimmedQuery]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }

      const activeElement = document.activeElement as HTMLElement | null;
      const isTypingField =
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA" ||
        activeElement?.isContentEditable;

      if (
        (event.key === "/" || (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey))) &&
        !isTypingField
      ) {
        event.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const hasResults = results.totalCount > 0;
  const statusText = useMemo(() => {
    if (!shouldSearch) {
      return "Type at least 2 characters";
    }

    if (isLoading) {
      return "Searching...";
    }

    if (error) {
      return error;
    }

    if (!hasResults) {
      return "No matching records";
    }

    return `${results.totalCount} result${results.totalCount === 1 ? "" : "s"} found`;
  }, [error, hasResults, isLoading, results.totalCount, shouldSearch]);

  function closeSearch() {
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <form
        role="search"
        onSubmit={(event) => event.preventDefault()}
        className={cn(
          "flex h-11 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/95 px-4 shadow-sm transition focus-within:border-slate-400 dark:border-slate-800 dark:bg-slate-900/95 dark:focus-within:border-slate-600",
          isOpen && "border-slate-400 dark:border-slate-600"
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          aria-label="Global search"
          aria-expanded={isOpen}
          aria-controls="global-search-results"
          placeholder="Search companies, HR, phone, email, vacancies, city, skills"
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {isLoading ? (
          <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults(emptyResults);
              setError("");
              inputRef.current?.focus();
            }}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </form>

      {isOpen ? (
        <div
          id="global-search-results"
          className="absolute left-0 right-0 top-[3.25rem] z-50 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-950/10 dark:border-slate-800 dark:bg-slate-950"
        >
          <div
            className="border-b border-slate-200/80 px-4 py-3 text-xs font-medium text-muted-foreground dark:border-slate-800"
            role="status"
            aria-live="polite"
          >
            {statusText}
          </div>
          <div className="max-h-[70vh] space-y-5 overflow-y-auto p-4">
            {hasResults ? (
              <>
                <ResultSection title="Companies" count={results.companies.length}>
                  {results.companies.map((company) => (
                    <CompanyCard
                      key={company.id}
                      company={company}
                      onNavigate={closeSearch}
                    />
                  ))}
                </ResultSection>
                <ResultSection title="HR" count={results.hr.length}>
                  {results.hr.map((contact) => (
                    <HrCard
                      key={contact.id}
                      contact={contact}
                      onNavigate={closeSearch}
                    />
                  ))}
                </ResultSection>
                <ResultSection title="Vacancies" count={results.vacancies.length}>
                  {results.vacancies.map((vacancy) => (
                    <VacancyCard
                      key={vacancy.id}
                      vacancy={vacancy}
                      onNavigate={closeSearch}
                    />
                  ))}
                </ResultSection>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-muted-foreground dark:border-slate-800">
                {statusText}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
