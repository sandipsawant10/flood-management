import "@testing-library/jest-dom";
import { expect } from "vitest";
import { toHaveNoViolations } from "jest-axe";

// Extend expect with jest-axe accessibility matcher
expect.extend(toHaveNoViolations);

// Vitest provides describe/it/expect globals; eslint may still flag them if config missing.
// If needed, add a local eslint env override comment:
/* eslint-env jest */
