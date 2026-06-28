import { CompanySize, CompanyStatus } from "@prisma/client";

export function formatCompanyStatus(status: CompanyStatus) {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "PROSPECT":
      return "Prospect";
    case "ON_HOLD":
      return "On Hold";
    case "INACTIVE":
      return "Inactive";
  }
}

export function formatCompanySize(size: CompanySize) {
  switch (size) {
    case "STARTUP":
      return "Startup";
    case "SMALL":
      return "Small";
    case "MID_MARKET":
      return "Mid-Market";
    case "ENTERPRISE":
      return "Enterprise";
  }
}
